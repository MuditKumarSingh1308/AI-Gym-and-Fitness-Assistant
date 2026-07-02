from __future__ import annotations

from pydantic import BaseModel, EmailStr

from app.common.models import MongoModel


class UserInDB(MongoModel):
    email: EmailStr | None = None
    full_name: str | None = None
    role: str = "user"


class PublicUser(BaseModel):
    id: str | None = None
    email: EmailStr | None = None
    full_name: str | None = None
    role: str = "user"

