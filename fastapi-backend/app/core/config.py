from functools import lru_cache
import json
import secrets

from pydantic import AnyHttpUrl
from pydantic import Field
from pydantic import field_validator
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI Gym Fitness Assistant API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "ai_gym_fitness"

    BACKEND_CORS_ORIGINS: list[AnyHttpUrl | str] = ["http://localhost:3000", "http://localhost:5173"]

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.6
    NEARBY_GYM_PROVIDER: str = "mock"
    STORAGE_PROVIDER: str = "firebase"
    STORAGE_BUCKET: str = "ai-gym-fitness-media"
    STORAGE_REGION: str = "us-central1"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("["):
                return json.loads(value)
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production" and not self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be set to a secure value in production")
        if self.ENVIRONMENT.lower() == "production" and not self.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY must be set in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
