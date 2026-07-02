from __future__ import annotations

from collections import defaultdict
from copy import deepcopy
from typing import Any

from bson import ObjectId


def _matches(document: dict[str, Any], query: dict[str, Any]) -> bool:
    for key, expected in query.items():
        if key == "$or" and isinstance(expected, list):
            if any(_matches(document, clause) for clause in expected):
                continue
            return False
        if document.get(key) != expected:
            return False
    return True


class LocalInsertResult:
    def __init__(self, inserted_id: ObjectId):
        self.inserted_id = inserted_id


class LocalCursor:
    def __init__(self, documents: list[dict[str, Any]]):
        self._documents = documents

    def sort(self, key: str, direction: int):
        reverse = direction < 0
        self._documents.sort(key=lambda item: item.get(key), reverse=reverse)
        return self

    def skip(self, offset: int):
        self._documents = self._documents[offset:]
        return self

    def limit(self, limit: int):
        self._documents = self._documents[:limit]
        return self

    async def to_list(self, length: int | None = None):
        return deepcopy(self._documents[:length] if length is not None else self._documents)


class LocalCollection:
    def __init__(self):
        self._documents: list[dict[str, Any]] = []

    async def insert_one(self, document: dict[str, Any]):
        stored = deepcopy(document)
        stored.setdefault("_id", ObjectId())
        self._documents.append(stored)
        return LocalInsertResult(stored["_id"])

    async def find_one(self, query: dict[str, Any], sort: list[tuple[str, int]] | None = None):
        documents = [doc for doc in self._documents if _matches(doc, query)]
        if sort:
            for key, direction in reversed(sort):
                documents.sort(key=lambda item, field=key: item.get(field), reverse=direction < 0)
        return deepcopy(documents[0]) if documents else None

    def find(self, query: dict[str, Any]):
        documents = [deepcopy(doc) for doc in self._documents if _matches(doc, query)]
        return LocalCursor(documents)

    async def update_one(self, query: dict[str, Any], update: dict[str, Any]):
        for document in self._documents:
            if _matches(document, query):
                if "$set" in update:
                    document.update(deepcopy(update["$set"]))
                return

    async def count_documents(self, query: dict[str, Any]):
        return sum(1 for document in self._documents if _matches(document, query))


class LocalAdmin:
    async def command(self, name: str):
        if name == "ping":
            return {"ok": 1}
        return {"ok": 1, "command": name}


class LocalDatabase:
    def __init__(self):
        self._collections: dict[str, LocalCollection] = defaultdict(LocalCollection)
        self.admin = LocalAdmin()

    def __getattr__(self, item: str) -> LocalCollection:
        if item.startswith("_"):
            raise AttributeError(item)
        return self._collections[item]

    def __getitem__(self, item: str) -> LocalCollection:
        return self._collections[item]


class LocalMongoClient:
    def __init__(self):
        self._databases: dict[str, LocalDatabase] = defaultdict(LocalDatabase)
        self.admin = LocalAdmin()

    def __getitem__(self, item: str) -> LocalDatabase:
        return self._databases[item]

    def close(self):
        self._databases.clear()

