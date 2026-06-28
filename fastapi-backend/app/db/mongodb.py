import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings
from app.db.local import LocalMongoClient

mongo_client: AsyncIOMotorClient | None = None
logger = logging.getLogger(__name__)


async def connect_to_mongo() -> None:
    global mongo_client
    try:
        mongo_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=1500,
            connectTimeoutMS=1500,
            socketTimeoutMS=1500,
        )
        await mongo_client.admin.command("ping")
    except Exception as exc:  # pragma: no cover - local fallback path
        if settings.ENVIRONMENT.lower() == "production":
            logger.exception("MongoDB Atlas connection failed in production")
            raise
        logger.warning("MongoDB unavailable, using in-memory local database: %s", exc)
        mongo_client = LocalMongoClient()


async def close_mongo_connection() -> None:
    global mongo_client
    if mongo_client is not None:
        mongo_client.close()
        mongo_client = None


def get_database() -> AsyncIOMotorDatabase:
    if mongo_client is None:
        raise RuntimeError("MongoDB client is not initialized")
    return mongo_client[settings.MONGODB_DB_NAME]
