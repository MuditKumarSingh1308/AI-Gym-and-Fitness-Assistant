from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase


class AnalyticsRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def workout_summary(self, user_id: str) -> dict:
        sessions = await self.db.workout_sessions.count_documents({"user_id": user_id})
        frames = await self.db.workout_frame_history.count_documents({"user_id": user_id})
        calories_total = 0.0
        form_scores: list[float] = []
        cursor = self.db.workout_sessions.find({"user_id": user_id})
        documents = await cursor.to_list(length=1000)
        for document in documents:
            calories_total += float(document.get("calories_burned", 0) or 0)
            form_score = document.get("form_score")
            if isinstance(form_score, (int, float)):
                form_scores.append(float(form_score))
        average_form_score = round(sum(form_scores) / len(form_scores), 2) if form_scores else 0.0
        return {
            "sessions": sessions,
            "frames": frames,
            "calories_burned": round(calories_total, 2),
            "form_score": average_form_score,
            "avg_form_score": average_form_score,
        }

    async def nutrition_summary(self, user_id: str) -> dict:
        diet_plans = await self.db.diet_plans.count_documents({"user_id": user_id})
        nutrition_logs = await self.db.nutrition_logs.count_documents({"user_id": user_id})
        total_water = 0.0
        cursor = self.db.nutrition_logs.find({"user_id": user_id})
        documents = await cursor.to_list(length=1000)
        for document in documents:
            total_water += float(document.get("water_intake", 0) or 0)
        return {
            "diet_plans": diet_plans,
            "protein_logs": nutrition_logs,
            "water_intake": round(total_water, 2),
        }

    async def habit_summary(self, user_id: str) -> dict:
        habits = await self.db.habits.count_documents({"user_id": user_id})
        completed = await self.db.habits.count_documents({"user_id": user_id, "completed": True})
        completion_rate = round(completed / habits, 2) if habits else 0.0
        streak = 0
        cursor = self.db.habits.find({"user_id": user_id})
        documents = await cursor.to_list(length=1000)
        if documents:
            streak = max(int(document.get("streak_count", 0) or 0) for document in documents)
        return {
            "current_streak": streak,
            "completion_rate": completion_rate,
        }

