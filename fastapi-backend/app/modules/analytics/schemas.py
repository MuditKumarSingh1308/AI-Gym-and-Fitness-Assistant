from __future__ import annotations

from pydantic import BaseModel, Field


class AnalyticsSummary(BaseModel):
    sessions: int = 0
    calories_burned: float = 0
    form_score: float = 0


class NutritionSummary(BaseModel):
    diet_plans: int = 0
    protein_logs: int = 0
    water_intake: float = 0


class HabitSummary(BaseModel):
    current_streak: int = 0
    completion_rate: float = 0


class AnalyticsDashboard(BaseModel):
    workout: AnalyticsSummary = Field(default_factory=AnalyticsSummary)
    nutrition: NutritionSummary = Field(default_factory=NutritionSummary)
    habits: HabitSummary = Field(default_factory=HabitSummary)
    performance_score: float = 0


class ChartSeries(BaseModel):
    labels: list[str] = Field(default_factory=list)
    calories_burned: list[float] = Field(default_factory=list)
    form_score: list[float] = Field(default_factory=list)
    habit_completion: list[float] = Field(default_factory=list)

