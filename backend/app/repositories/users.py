from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User


async def upsert_wechat_user(
    session: AsyncSession,
    *,
    openid: str,
    unionid: str | None,
    privacy_version: str,
    now: datetime | None = None,
) -> User:
    login_at = now if now is not None else datetime.now(UTC)
    statement = (
        insert(User)
        .values(
            openid=openid,
            unionid=unionid,
            privacy_version=privacy_version,
            privacy_accepted_at=login_at,
            last_login_at=login_at,
        )
        .on_conflict_do_update(
            index_elements=[User.openid],
            set_={
                "unionid": unionid,
                "privacy_version": privacy_version,
                "privacy_accepted_at": login_at,
                "last_login_at": login_at,
                "updated_at": func.now(),
            },
        )
        .returning(User)
    )
    result = await session.execute(statement)
    return result.scalar_one()


async def get_user_by_id(session: AsyncSession, user_id: UUID) -> User | None:
    return await session.scalar(select(User).where(User.id == user_id))


async def get_user_by_refresh_hash_for_update(
    session: AsyncSession,
    refresh_token_hash: str,
) -> User | None:
    statement = select(User).where(User.refresh_token_hash == refresh_token_hash).with_for_update()
    return await session.scalar(statement)
