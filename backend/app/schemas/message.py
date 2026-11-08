from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field, field_validator

from app.schemas.common import CamelModel


class MessageContent(CamelModel):
    type: Literal["text"] = "text"
    text: str = Field(min_length=1, max_length=2000)

    @field_validator("text")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("message text must not be blank")
        return normalized


class CreatePersistedMessageRequest(CamelModel):
    client_message_id: UUID
    content: MessageContent


class PersistedMessageOut(CamelModel):
    id: UUID
    client_message_id: UUID
    conversation_id: UUID
    role: Literal["user"]
    content: MessageContent
    status: Literal["completed"]
    created_at: datetime
    completed_at: datetime


class PersistedMessageData(CamelModel):
    message: PersistedMessageOut


class PersistedMessagePage(CamelModel):
    items: list[PersistedMessageOut]
    next_cursor: str | None = None
