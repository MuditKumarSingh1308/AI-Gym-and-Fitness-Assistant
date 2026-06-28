from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.common.models import MongoModel

ExerciseType = Literal["squat", "pushup", "plank", "jumping_jack", "bicep_curl", "lunge", "shoulder_press"]


class WorkoutSessionCreate(BaseModel):
    exercise_type: ExerciseType
    target_reps: int | None = Field(default=None, ge=1, le=500)
    target_duration_seconds: int | None = Field(default=None, ge=10, le=10800)


class WorkoutFramePayload(BaseModel):
    frame_base64: str = Field(description="Base64 encoded image frame from webcam.")
    frame_timestamp: float = Field(ge=0)
    include_overlay: bool = Field(default=True, description="Return a base64 JPEG with skeleton overlay.")


class ExerciseFrameAnalysis(BaseModel):
    exercise_type: ExerciseType
    rep_count: int
    current_phase: str
    form_score: float = Field(ge=0, le=100)
    feedback: list[str]
    audio_feedback: str | None = None
    incorrect_form: bool = False
    form_errors: list[str] = Field(default_factory=list)
    joint_angles: dict[str, float]
    confidence: float = Field(ge=0, le=1)
    landmarks: dict[str, list[float]] = Field(default_factory=dict)
    overlay_frame_base64: str | None = None


class WorkoutFrameHistory(MongoModel):
    user_id: str
    session_id: str
    frame_timestamp: float
    analysis: ExerciseFrameAnalysis
    created_at: datetime


class WorkoutSessionComplete(BaseModel):
    total_reps: int = Field(ge=0)
    duration_seconds: int = Field(ge=0)
    calories_burned: float = Field(ge=0)
    form_score: float = Field(ge=0, le=100)
    motion_efficiency_score: float = Field(ge=0, le=100)
    notes: str | None = None


class WorkoutSession(MongoModel):
    user_id: str
    exercise_type: ExerciseType
    status: Literal["active", "completed"]
    target_reps: int | None = None
    target_duration_seconds: int | None = None
    total_reps: int = 0
    duration_seconds: int = 0
    calories_burned: float = 0
    form_score: float = 0
    motion_efficiency_score: float = 0
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
