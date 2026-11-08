from datetime import UTC, datetime
from typing import Literal, cast
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import ApiError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
)
from app.db.models.user import User
from app.repositories.users import (
    get_user_by_id,
    get_user_by_refresh_hash_for_update,
    upsert_wechat_user,
)
from app.schemas.auth import IssuedSession
from app.services.wechat import WechatSessionClient


async def login_with_wechat(
    session: AsyncSession,
    wechat_client: WechatSessionClient,
    *,
    code: str,
    privacy_version: str,
) -> IssuedSession:
    wechat_session = await wechat_client.exchange_code(code)
    async with session.begin():
        user = await upsert_wechat_user(
            session,
            openid=wechat_session.openid,
            unionid=wechat_session.unionid,
            privacy_version=privacy_version,
        )
        if user.status != "active":
            raise ApiError(403, "ACCOUNT_DISABLED", "当前账号已停用")
        return await issue_session(session, user)


async def refresh_session(
    session: AsyncSession,
    *,
    refresh_token: str,
) -> IssuedSession:
    async with session.begin():
        user = await get_user_by_refresh_hash_for_update(
            session,
            hash_refresh_token(refresh_token),
        )
        now = datetime.now(UTC)
        if user is None or user.refresh_token_expires_at is None:
            raise ApiError(401, "REFRESH_TOKEN_INVALID", "登录已失效，请重新登录")
        if user.refresh_token_expires_at <= now:
            raise ApiError(401, "REFRESH_TOKEN_INVALID", "登录已失效，请重新登录")
        if user.status != "active":
            raise ApiError(403, "ACCOUNT_DISABLED", "当前账号已停用")
        return await issue_session(session, user)


async def issue_session(session: AsyncSession, user: User) -> IssuedSession:
    settings = get_settings()
    access_token, access_expires_in = create_access_token(user.id, user.token_version)
    refresh_token, refresh_hash, refresh_expires_at = create_refresh_token()
    user.refresh_token_hash = refresh_hash
    user.refresh_token_expires_at = refresh_expires_at
    await session.flush()
    return IssuedSession(
        access_token=access_token,
        access_token_expires_in=access_expires_in,
        refresh_token=refresh_token,
        refresh_token_expires_at=refresh_expires_at,
        refresh_token_expires_in=settings.refresh_token_ttl_seconds,
        user_id=user.id,
        user_nickname=user.nickname,
        user_avatar_url=user.avatar_url,
        user_status=cast(Literal["active", "disabled"], user.status),
        user_created_at=user.created_at,
    )


async def logout_user(session: AsyncSession, user_id: UUID) -> None:
    user = await get_user_by_id(session, user_id)
    if user is None:
        raise ApiError(401, "AUTH_EXPIRED", "登录已失效，请重新登录")
    user.token_version += 1
    user.refresh_token_hash = None
    user.refresh_token_expires_at = None
    await session.flush()
