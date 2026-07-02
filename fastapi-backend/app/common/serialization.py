from __future__ import annotations

from datetime import date, datetime
from typing import Any

from bson import ObjectId


def serialize_doc(document: dict[str, Any] | None) -> dict[str, Any]:
    if not document:
        return {}

    def convert(value: Any) -> Any:
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, datetime):
            return value
        if isinstance(value, date):
            return value
        if isinstance(value, dict):
            return {key: convert(item) for key, item in value.items()}
        if isinstance(value, list):
            return [convert(item) for item in value]
        return value

    data = {key: convert(value) for key, value in document.items()}
    if "_id" in data and "id" not in data:
        data["id"] = data.pop("_id")
    return data

