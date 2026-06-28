from app.infrastructure.llm_client import LLMClient
from app.modules.chatbot.repository import ChatbotRepository
from app.modules.chatbot.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ChatSession,
    ChatSessionCreate,
    CheckInRequest,
    CheckInResponse,
    Mood,
    PromptTemplateRequest,
    PromptTemplateResponse,
    SentimentLabel,
)
from app.modules.chatbot.templates import GymBuddyPromptTemplates


class ChatbotService:
    def __init__(self, chat: ChatbotRepository, llm: LLMClient):
        self.repository = chat
        self.llm = llm
        self.templates = GymBuddyPromptTemplates()

    def detect_mood(self, text: str) -> Mood:
        lowered = text.lower()
        if any(word in lowered for word in ["tired", "exhausted", "sleepy"]):
            return "tired"
        if any(word in lowered for word in ["stress", "anxious", "overwhelmed"]):
            return "stressed"
        if any(word in lowered for word in ["great", "happy", "good"]):
            return "happy"
        if any(word in lowered for word in ["ready", "motivated", "strong"]):
            return "motivated"
        return "neutral"

    def detect_sentiment(self, text: str) -> tuple[SentimentLabel, float]:
        lowered = text.lower()
        positive_hits = sum(word in lowered for word in ["great", "good", "love", "strong", "progress", "happy"])
        negative_hits = sum(word in lowered for word in ["tired", "hard", "hurt", "stuck", "sad", "anxious", "bad"])
        if positive_hits > negative_hits:
            return "positive", min(1.0, 0.65 + positive_hits * 0.1)
        if negative_hits > positive_hits:
            return "negative", min(1.0, 0.65 + negative_hits * 0.1)
        return "neutral", 0.5

    def _memory_summary(self, history: list[ChatMessage]) -> str:
        if not history:
            return "No prior conversation."
        recent_user_messages = [msg.message for msg in history if msg.sender == "user"][-3:]
        if not recent_user_messages:
            return "The user has mostly received assistant guidance so far."
        return "Recent user topics: " + " | ".join(recent_user_messages)

    def _extract_recommendations(self, message: str, mood: Mood, sentiment: SentimentLabel) -> tuple[list[str], list[str], str]:
        lowered = message.lower()
        workouts: list[str] = []
        meals: list[str] = []
        tip = "Keep showing up with small, repeatable wins."
        if any(word in lowered for word in ["strength", "muscle", "lift", "push", "press"]):
            workouts.extend(["Upper-body push session", "Compound lift technique work"])
            meals.extend(["Paneer or chicken bowl", "Greek yogurt with fruit"])
            tip = "Focus on progressive overload and consistent protein intake."
        if any(word in lowered for word in ["fat loss", "weight loss", "cut", "lean"]):
            workouts.extend(["Zone 2 cardio", "Full-body strength circuit"])
            meals.extend(["High-fiber dal salad", "Protein-rich breakfast"])
            tip = "Pair a moderate calorie deficit with high-protein meals."
        if any(word in lowered for word in ["recover", "sore", "tired", "rest"]):
            workouts = ["Mobility flow", "Light walk", "Recovery stretching"]
            meals = ["Hydrating meal", "Protein + carbs recovery plate"]
            tip = "Reduce intensity today and protect recovery."
        if mood in {"tired", "stressed"} or sentiment == "negative":
            workouts = workouts or ["Short, low-friction 10-minute session", "Gentle mobility circuit"]
            tip = "Lower the barrier: start tiny, then decide whether to continue."
        return workouts[:3], meals[:3], tip

    def _follow_up_question(self, mood: Mood, sentiment: SentimentLabel) -> str | None:
        if mood in {"tired", "stressed"} or sentiment == "negative":
            return "Do you want a lighter workout plan for today or a quick recovery meal idea?"
        return "Want me to tailor this to your goal, equipment, or time available?"

    def _build_summary(self, message: str, memory_summary: str, sentiment: SentimentLabel) -> str:
        return f"Latest topic: {message[:120]}. Sentiment: {sentiment}. Memory: {memory_summary[:180]}"

    async def create_session(self, user_id: str, payload: ChatSessionCreate | None = None) -> ChatSession:
        return await self.repository.create_session(user_id, payload)

    async def list_sessions(self, user_id: str, limit: int = 20) -> list[ChatSession]:
        return await self.repository.list_sessions(user_id, limit)

    async def generate_prompt_templates(self, request: PromptTemplateRequest) -> PromptTemplateResponse:
        return PromptTemplateResponse(
            system_prompt=self.templates.build_system_prompt(request),
            user_prompt_template=self.templates.build_user_prompt_template(),
            response_guidelines=self.templates.response_guidelines(),
        )

    async def chat(self, user_id: str, payload: ChatRequest) -> ChatResponse:
        session = await self._resolve_session(user_id, payload)
        history = await self.repository.history(user_id, limit=10, conversation_id=session.id)
        mood = self.detect_mood(payload.message)
        sentiment, sentiment_score = self.detect_sentiment(payload.message)
        memory_summary = session.summary or self._memory_summary(history)
        recent_context = " || ".join(f"{msg.sender}: {msg.message}" for msg in history[-6:])
        workouts, meals, tip = self._extract_recommendations(payload.message, mood, sentiment)
        prompt_request = PromptTemplateRequest(
            goal=payload.context.get("goal", "general fitness"),
            tone=payload.tone,
            memory_summary=memory_summary,
            mood=mood,
            sentiment=sentiment,
        )
        system_prompt = self.templates.build_system_prompt(prompt_request)
        user_prompt = self.templates.build_user_prompt_template().format(
            message=payload.message,
            memory_summary=memory_summary,
            recent_context=recent_context or "No recent context.",
            tone=payload.tone,
        )
        await self.repository.save_message(
            user_id,
            session.id,
            {
                "sender": "user",
                "message": payload.message,
                "mood_detected": mood,
                "sentiment": sentiment,
                "prompt_type": "user_message",
            },
        )
        answer = await self.llm.complete(system_prompt=system_prompt, user_message=user_prompt)
        enhanced_answer = answer if answer else tip
        await self.repository.save_message(
            user_id,
            session.id,
            {
                "sender": "assistant",
                "message": enhanced_answer,
                "mood_detected": mood,
                "sentiment": sentiment,
                "prompt_type": "assistant_reply",
            },
        )
        await self.repository.touch_session(user_id, session.id)
        await self.repository.update_session_summary(
            user_id, session.id, self._build_summary(payload.message, memory_summary, sentiment)
        )
        return ChatResponse(
            conversation_id=session.id,
            message=enhanced_answer,
            mood_detected=mood,
            sentiment=sentiment,
            sentiment_score=round(sentiment_score, 3),
            motivational_tip=tip,
            suggested_workouts=workouts,
            suggested_meals=meals,
            memory_summary=memory_summary,
            model_used=self.llm.model_name,
            follow_up_question=self._follow_up_question(mood, sentiment),
        )

    async def history(self, user_id: str, limit: int, conversation_id: str | None = None) -> list[ChatMessage]:
        return await self.repository.history(user_id, limit, conversation_id)

    async def check_in(self, user_id: str, payload: CheckInRequest) -> CheckInResponse:
        mood = self.detect_mood(payload.mood_text)
        recommendation = "Take a lighter session today." if payload.energy_level <= 4 else "You are clear for a focused workout."
        session = await self.repository.create_session(user_id, ChatSessionCreate(title="Daily Check-in"))
        sentiment, _ = self.detect_sentiment(payload.mood_text)
        await self.repository.save_message(
            user_id,
            session.id,
            {
                "sender": "user",
                "message": payload.mood_text,
                "mood_detected": mood,
                "sentiment": sentiment,
                "prompt_type": "check_in",
            },
        )
        await self.repository.update_session_summary(
            user_id, session.id, f"Check-in mood: {mood}. Energy: {payload.energy_level}/10."
        )
        return CheckInResponse(mood_detected=mood, recommendation=recommendation)

    async def _resolve_session(self, user_id: str, payload: ChatRequest) -> ChatSession:
        if payload.conversation_id:
            existing = await self.repository.get_session(user_id, payload.conversation_id)
            if existing is not None:
                return existing
        return await self.repository.create_session(user_id)
