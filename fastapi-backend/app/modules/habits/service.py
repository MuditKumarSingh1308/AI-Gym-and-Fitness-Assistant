from __future__ import annotations

from app.modules.habits.ml import WorkoutSkipPredictor
from app.modules.habits.repository import HabitRepository
from app.modules.habits.schemas import (
    Habit,
    HabitCreate,
    HabitPrediction,
    HabitUpdate,
    StreakSummary,
    WorkoutSkipPredictionHistory,
    WorkoutSkipPredictionRequest,
    WorkoutSkipPredictionResponse,
)


class HabitService:
    def __init__(self, habits: HabitRepository, skip_predictor: WorkoutSkipPredictor | None = None):
        self.habits = habits
        self.skip_predictor = skip_predictor or WorkoutSkipPredictor()

    async def create(self, user_id: str, payload: HabitCreate) -> Habit:
        streak = 1 if payload.completed else 0
        return await self.habits.create(user_id, {**payload.model_dump(mode="json"), "streak_count": streak})

    async def list(self, user_id: str, limit: int) -> list[Habit]:
        return await self.habits.list(user_id, limit)

    async def update(self, user_id: str, habit_id: str, payload: HabitUpdate) -> Habit | None:
        data = payload.model_dump(exclude_none=True)
        if data.get("completed") is True:
            data["streak_count"] = 1
        return await self.habits.update(user_id, habit_id, data)

    async def streaks(self, user_id: str) -> StreakSummary:
        habits = await self.habits.list(user_id, 100)
        streaks = [habit.streak_count for habit in habits]
        return StreakSummary(
            current_streak=max(streaks) if streaks else 0,
            longest_streak=max(streaks) if streaks else 0,
            completed_habits=await self.habits.completion_count(user_id),
        )

    async def predict(self, user_id: str) -> HabitPrediction:
        completed = await self.habits.completion_count(user_id)
        probability = min(0.95, 0.45 + completed * 0.03)
        return HabitPrediction(
            completion_probability=round(probability, 2),
            missed_workout_risk=round(1 - probability, 2),
            best_notification_time="18:30",
            motivation_style="direct_encouragement",
        )

    async def predict_workout_skip(
        self,
        user_id: str,
        payload: WorkoutSkipPredictionRequest,
    ) -> WorkoutSkipPredictionResponse:
        model_prediction = self.skip_predictor.predict(payload)
        risk_factors = self.skip_predictor.predict_risk_factors(payload)
        response = WorkoutSkipPredictionResponse(
            prediction_date=payload.prediction_date,
            likely_to_skip=model_prediction.skip_probability >= 0.5,
            skip_probability=model_prediction.skip_probability,
            confidence_score=round(abs(model_prediction.skip_probability - 0.5) * 2, 3),
            model_used=model_prediction.model_used,
            metrics=model_prediction.metrics,
            motivation_recommendation=self._motivation(payload, model_prediction.skip_probability, risk_factors),
            risk_factors=risk_factors,
        )
        await self.habits.save_skip_prediction(user_id, payload.model_dump(mode="json"), response)
        return response

    async def skip_prediction_history(self, user_id: str, limit: int) -> list[WorkoutSkipPredictionHistory]:
        return await self.habits.list_skip_predictions(user_id, limit)

    def _motivation(
        self,
        payload: WorkoutSkipPredictionRequest,
        skip_probability: float,
        risk_factors: list[str],
    ) -> str:
        if skip_probability >= 0.7:
            if payload.sleep_hours < 6:
                return "Do a 15-minute low-intensity session today. Keep the promise small: mobility, walking, and one easy set."
            if payload.working_hours >= 10:
                return "Schedule a short workout before dinner. Ten focused minutes count and protects your streak."
            return "Start with only the warm-up. Once you begin, decide whether to continue for the full session."
        if skip_probability >= 0.4:
            return "You are at moderate skip risk. Put workout clothes ready and commit to the first exercise only."
        if risk_factors:
            return "Risk is low, but remove friction: hydrate, pick a fixed time, and start with your easiest set."
        return "You are likely to show up today. Keep the plan steady and log the workout right after finishing."
