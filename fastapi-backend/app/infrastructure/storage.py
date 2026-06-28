from dataclasses import dataclass
from urllib.parse import quote

from app.core.config import settings

@dataclass
class StorageObject:
    key: str
    url: str


class StorageClient:
    async def create_presigned_upload_url(self, key: str) -> StorageObject:
        encoded_key = quote(key, safe="")
        if settings.STORAGE_PROVIDER.lower() == "s3":
            url = f"https://{settings.STORAGE_BUCKET}.s3.{settings.STORAGE_REGION}.amazonaws.com/{encoded_key}"
        elif settings.STORAGE_PROVIDER.lower() == "firebase":
            url = f"https://firebasestorage.googleapis.com/v0/b/{settings.STORAGE_BUCKET}/o?name={encoded_key}&uploadType=resumable"
        else:
            url = f"https://storage.example.local/upload/{encoded_key}"
        return StorageObject(key=key, url=url)
