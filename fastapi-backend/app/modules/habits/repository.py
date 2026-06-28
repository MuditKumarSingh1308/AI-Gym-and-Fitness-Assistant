from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.serialization import serialize_doc
from app.modules.habits.schemas import Habit, WorkoutSkipPredictionHistory, WorkoutSkipPredictionResponse


class HabitRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.habits
        self.predictions = db.workout_skip_predictions

    async def create(self, user_id: str, data: dict) -> Habit:
        now = datetime.now(timezone.utc)
        result = await self.collection.insert_one({**data, "user_id": user_id, "created_at": now, "updated_at": now})
        document = await self.collection.find_one({"_id": result.inserted_id})
        return Habit(**serialize_doc(document))

    async def list(self, user_id: str, limit: int = 50) -> list[Habit]:
        cursor = self.collection.find({"user_id": user_id}).sort("date", -1).limit(limit)
        documents = await cursor.to_list(length=limit)
        return [Habit(**serialize_doc(document)) for document in documents]

    async def update(self, user_id: str, habit_id: str, data: dict) -> Habit | None:
        if not ObjectId.is_valid(habit_id):
            return None
        await self.collection.update_one(
            {"_id": ObjectId(habit_id), "user_id": user_id},
            {"$set": {**data, "updated_at": datetime.now(timezone.utc)}},
        )
        document = await self.collection.find_one({"_id": ObjectId(habit_id), "user_id": user_id})
        return Habit(**serialize_doc(document)) if document else None

    async def completion_count(self, user_id: str) -> int:
        return await self.collection.count_documents({"user_id": user_id, "completed": True})

    async def save_skip_prediction(
        self,
        user_id: str,
        input_features: dict,
        prediction: WorkoutSkipPredictionResponse,
    ) -> WorkoutSkipPredictionHistory:
        now = datetime.now(timezone.utc)
        result = await self.predictions.insert_one(
            {
                "user_id": user_id,
                "prediction_date": prediction.prediction_date.isoformat(),
                "input_features": input_features,
                "prediction": prediction.model_dump(mode="json"),
                "created_at": now,
            }
        )
        document = await self.predictions.find_one({"_id": result.inserted_id})
        return WorkoutSkipPredictionHistory(**serialize_doc(document))

    async def list_skip_predictions(self, user_id: str, limit: int = 30) -> list[WorkoutSkipPredictionHistory]:
        cursor = self.predictions.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        documents = await cursor.to_list(length=limit)
        return [WorkoutSkipPredictionHistory(**serialize_doc(document)) for document in documents]
