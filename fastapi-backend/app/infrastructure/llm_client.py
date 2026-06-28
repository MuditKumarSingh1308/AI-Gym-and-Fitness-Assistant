from __future__ import annotations

from google import genai
from google.genai import types

from app.core.config import settings


class LLMClient:
    """Google Gemini 2.5 Flash client used by the chatbot service."""

    def __init__(self, api_key: str | None = None, model_name: str | None = None, temperature: float | None = None):
        resolved_key = api_key or settings.GEMINI_API_KEY
        if not resolved_key:
            raise ValueError("GEMINI_API_KEY must be configured")

        self.model_name = model_name or settings.GEMINI_MODEL
        self.temperature = settings.GEMINI_TEMPERATURE if temperature is None else temperature
        self._client = genai.Client(api_key=resolved_key)

    async def complete(self, system_prompt: str, user_message: str) -> str:
        response = await self._client.aio.models.generate_content(
            model=self.model_name,
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=self.temperature,
            ),
        )
        return self._extract_text(response)

    def _extract_text(self, response) -> str:
        text = getattr(response, "text", None)
        if isinstance(text, str) and text.strip():
            return text.strip()

        candidates = getattr(response, "candidates", []) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", []) or []
            for part in parts:
                part_text = getattr(part, "text", None)
                if isinstance(part_text, str) and part_text.strip():
                    return part_text.strip()

        return ""
