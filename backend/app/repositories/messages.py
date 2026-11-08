from datetime import datetime
from uuid import UUID

from sqlalchemy import and_, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.message import Message


async def insert_user_message(
    session: AsyncSession,
    *,
    user_id: UUID,
    conversation_id: UUID,
    client_message_id: UUID,
    content: dict[str, str],
    request_id: str,
    now: datetime,
) -> tuple[Message, bool]:
    statement = (
        insert(Message)
        .values(
            user_id=user_id,
            conversation_id=conversation_id,
            client_message_id=client_message_id,
            role="user",
            content=content,
            status="completed",
            request_id=request_id,
            created_at=now,
            completed_at=now,
        )
        .on_conflict_do_nothing(
            index_elements=[
                Message.user_id,
                Message.conversation_id,
                Message.client_message_id,
            ],
        )
        .returning(Message)
    )
    inserted = (await session.execute(statement)).scalar_one_or_none()
    if inserted is not None:
        return inserted, True

    existing = await session.scalar(
        select(Message).where(
            Message.user_id == user_id,
            Message.conversation_id == conversation_id,
            Message.client_message_id == client_message_id,
        ),
    )
    if existing is None:
        raise RuntimeError("idempotent message conflict could not be reconciled")
    return existing, False


async def list_user_messages(
    session: AsyncSession,
    *,
    user_id: UUID,
    conversation_id: UUID,
    limit: int,
    before_created_at: datetime | None,
    before_id: UUID | None,
) -> tuple[list[Message], bool]:
    statement = select(Message).where(
        Message.user_id == user_id,
        Message.conversation_id == conversation_id,
    )
    if before_created_at is not None and before_id is not None:
        statement = statement.where(
            or_(
                Message.created_at < before_created_at,
                and_(
                    Message.created_at == before_created_at,
                    Message.id < before_id,
                ),
            ),
        )
    statement = statement.order_by(Message.created_at.desc(), Message.id.desc()).limit(limit + 1)
    rows = list((await session.scalars(statement)).all())
    has_more = len(rows) > limit
    return rows[:limit], has_more
