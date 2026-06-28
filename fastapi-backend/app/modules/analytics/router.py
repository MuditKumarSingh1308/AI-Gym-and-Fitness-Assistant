from typing import Annotated

from fastapi import APIRouter, Depends, Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_current_user, get_db
from app.modules.analytics.repository import AnalyticsRepository
from app.modules.analytics.schemas import AnalyticsDashboard, ChartSeries
from app.modules.analytics.service import AnalyticsService
from app.modules.auth.schemas import UserInDB

router = APIRouter()


def get_analytics_service(db: Annotated[AsyncIOMotorDatabase, Depends(get_db)]) -> AnalyticsService:
    return AnalyticsService(AnalyticsRepository(db))


@router.get("/dashboard", response_model=AnalyticsDashboard)
async def dashboard(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    service: Annotated[AnalyticsService, Depends(get_analytics_service)],
):
    return await service.dashboard(current_user.id)


@router.get("/progress-series", response_model=ChartSeries)
async def progress_series(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    service: Annotated[AnalyticsService, Depends(get_analytics_service)],
):
    return await service.progress_series(current_user.id)


@router.get("/report", response_class=Response)
async def pose_performance_report(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    service: Annotated[AnalyticsService, Depends(get_analytics_service)],
):
    pdf_bytes = await service.pose_performance_report(current_user.id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="pose-performance-report.pdf"'},
    )
