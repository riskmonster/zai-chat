import base64
import json
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.db.models.message import Message
from app.repositories.messages import insert_user_message, list_user_messages


def encode_cursor(message: Message) -> str:
    payload = {
        "createdAt": message.created_at.isoformat(),
        "id": str(message.id),
    }
    encoded = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(encoded).decode("ascii").rstrip("=")


def decode_cursor(cursor: str | None) -> tuple[datetime | None, UUID | None]:
    if cursor is None or not cursor:
        return None, None
    try:
        padding = "=" * (-len(cursor) % 4)
        payload = json.loads(base64.urlsafe_b64decode(cursor + padding).decode("utf-8"))
        created_at = datetime.fromisoformat(str(payload["createdAt"]))
        message_id = UUID(str(payload["id"]))
    except (KeyError, ValueError, TypeError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ApiError(400, "CURSOR_INVALID", "分页游标无效") from error
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=UTC)
    return created_at, message_id


async def persist_message(
    session: AsyncSession,
    *,
    user_id: UUID,
    client_message_id: UUID,
    text: str,
    request_id: str,
) -> tuple[Message, bool]:
    content = {"type": "text", "text": text}
    message, is_created = await insert_user_message(
        session,
        user_id=user_id,
        conversation_id=user_id,
        client_message_id=client_message_id,
        content=content,
        request_id=request_id,
        now=datetime.now(UTC),
    )
    if message.content != content:
        raise ApiError(
            409,
            "IDEMPOTENCY_KEY_REUSED",
            "同一 clientMessageId 不能提交不同内容",
        )
    return message, is_created


async def get_message_page(
    session: AsyncSession,
    *,
    user_id: UUID,
    cursor: str | None,
    limit: int,
) -> tuple[list[Message], str | None]:
    before_created_at, before_id = decode_cursor(cursor)
    messages, has_more = await list_user_messages(
        session,
        user_id=user_id,
        conversation_id=user_id,
        limit=limit,
        before_created_at=before_created_at,
        before_id=before_id,
    )
    next_cursor = encode_cursor(messages[-1]) if has_more and messages else None
    return messages, next_cursor
