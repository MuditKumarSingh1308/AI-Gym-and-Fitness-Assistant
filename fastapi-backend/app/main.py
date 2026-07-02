from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db import mongodb
from app.db.mongodb import close_mongo_connection, connect_to_mongo

try:
    from app.modules.analytics.router import router as analytics_router
except Exception:  # pragma: no cover - optional module wiring
    analytics_router = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    database_status = "unknown"
    if mongodb.mongo_client is not None:
        try:
            await mongodb.mongo_client.admin.command("ping")
            database_status = "connected"
        except Exception:  # pragma: no cover - health fallback
            database_status = "unhealthy"
    return {
        "status": "ok",
        "backend": "running",
        "database": database_status,
    }


if analytics_router is not None:
    app.include_router(analytics_router, prefix=f"{settings.API_V1_PREFIX}/analytics", tags=["analytics"])
