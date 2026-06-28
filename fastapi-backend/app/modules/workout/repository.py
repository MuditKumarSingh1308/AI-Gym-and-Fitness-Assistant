from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.serialization import serialize_doc
from app.modules.workout.schemas import ExerciseFrameAnalysis, WorkoutFrameHistory, WorkoutSession


class WorkoutRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.workout_sessions
        self.history_collection = db.workout_frame_history

    async def create(self, user_id: str, data: dict) -> WorkoutSession:
        now = datetime.now(timezone.utc)
        payload = {**data, "user_id": user_id, "created_at": now, "updated_at": now, "status": "active"}
        result = await self.collection.insert_one(payload)
        return await self.get(user_id, str(result.inserted_id))

    async def get(self, user_id: str, session_id: str) -> WorkoutSession | None:
        if not ObjectId.is_valid(session_id):
            return None
        document = await self.collection.find_one({"_id": ObjectId(session_id), "user_id": user_id})
        return WorkoutSession(**serialize_doc(document)) if document else None

    async def list(self, user_id: str, limit: int = 20, offset: int = 0) -> list[WorkoutSession]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).skip(offset).limit(limit)
        documents = await cursor.to_list(length=limit)
        return [WorkoutSession(**serialize_doc(document)) for document in documents]

    async def complete(self, user_id: str, session_id: str, data: dict) -> WorkoutSession | None:
        if not ObjectId.is_valid(session_id):
            return None
        await self.collection.update_one(
            {"_id": ObjectId(session_id), "user_id": user_id},
            {"$set": {**data, "status": "completed", "updated_at": datetime.now(timezone.utc)}},
        )
        return await self.get(user_id, session_id)

    async def update_live_metrics(
        self,
        user_id: str,
        session_id: str,
        rep_count: int,
        form_score: float,
        motion_efficiency_score: float,
    ) -> None:
        if not ObjectId.is_valid(session_id):
            return
        await self.collection.update_one(
            {"_id": ObjectId(session_id), "user_id": user_id},
            {
                "$set": {
                    "total_reps": rep_count,
                    "form_score": form_score,
                    "motion_efficiency_score": motion_efficiency_score,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

    async def save_frame_analysis(
        self,
        user_id: str,
        session_id: str,
        frame_timestamp: float,
        analysis: ExerciseFrameAnalysis,
    ) -> WorkoutFrameHistory:
        now = datetime.now(timezone.utc)
        payload = {
            "user_id": user_id,
            "session_id": session_id,
            "frame_timestamp": frame_timestamp,
            "analysis": analysis.model_dump(mode="json"),
            "created_at": now,
        }
        result = await self.history_collection.insert_one(payload)
        document = await self.history_collection.find_one({"_id": result.inserted_id})
        return WorkoutFrameHistory(**serialize_doc(document))

    async def latest_frame_analysis(self, user_id: str, session_id: str) -> WorkoutFrameHistory | None:
        document = await self.history_collection.find_one(
            {"user_id": user_id, "session_id": session_id},
            sort=[("frame_timestamp", -1), ("created_at", -1)],
        )
        return WorkoutFrameHistory(**serialize_doc(document)) if document else None

    async def frame_history(self, user_id: str, session_id: str, limit: int = 100) -> list[WorkoutFrameHistory]:
        cursor = (
            self.history_collection.find({"user_id": user_id, "session_id": session_id})
            .sort("frame_timestamp", -1)
            .limit(limit)
        )
        documents = await cursor.to_list(length=limit)
        return [WorkoutFrameHistory(**serialize_doc(document)) for document in documents]
