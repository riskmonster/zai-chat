from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import decode_access_token
from app.db.models.user import User
from app.db.session import get_session
from app.repositories.users import get_user_by_id

bearer_scheme = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CredentialsDep = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]


async def get_current_user(
    credentials: CredentialsDep,
    session: SessionDep,
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise ApiError(401, "AUTH_EXPIRED", "请先登录")
    user_id, token_version = decode_access_token(credentials.credentials)
    user = await get_user_by_id(session, user_id)
    if user is None or user.status != "active" or user.token_version != token_version:
        raise ApiError(401, "TOKEN_REVOKED", "登录已失效，请重新登录")
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
