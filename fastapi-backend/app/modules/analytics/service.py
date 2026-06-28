from __future__ import annotations

from app.modules.analytics.repository import AnalyticsRepository
from app.modules.analytics.schemas import AnalyticsDashboard, ChartSeries
from app.modules.analytics.reports import build_pose_performance_pdf


class AnalyticsService:
    def __init__(self, analytics: AnalyticsRepository):
        self.analytics = analytics

    async def dashboard(self, user_id: str) -> AnalyticsDashboard:
        workout = await self.analytics.workout_summary(user_id)
        nutrition = await self.analytics.nutrition_summary(user_id)
        habits = await self.analytics.habit_summary(user_id)
        score = min(100, (workout.get("avg_form_score") or 0) * 0.6 + habits["completion_rate"] * 40)
        workout.pop("_id", None)
        nutrition.pop("_id", None)
        return AnalyticsDashboard(workout=workout, nutrition=nutrition, habits=habits, performance_score=round(score, 2))

    async def progress_series(self, _: str) -> ChartSeries:
        return ChartSeries(
            labels=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            calories_burned=[180, 220, 0, 260, 300, 120, 240],
            form_score=[78, 82, 0, 85, 88, 80, 87],
            habit_completion=[0.6, 0.8, 0.5, 0.9, 1.0, 0.7, 0.9],
        )

    async def pose_performance_report(self, user_id: str) -> bytes:
        dashboard = await self.dashboard(user_id)
        series = await self.progress_series(user_id)
        return build_pose_performance_pdf(user_id, dashboard, series)
