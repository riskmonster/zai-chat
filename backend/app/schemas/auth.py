from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.common import CamelModel
from app.schemas.user import UserOut


class WxLoginRequest(CamelModel):
    code: str = Field(min_length=1, max_length=512)
    privacy_version: str = Field(min_length=1, max_length=32)


class RefreshTokenRequest(CamelModel):
    refresh_token: str = Field(min_length=1, max_length=512)


class AuthSessionOut(CamelModel):
    access_token: str
    access_token_expires_in: int
    refresh_token: str
    refresh_token_expires_in: int
    user: UserOut


class IssuedSession(CamelModel):
    access_token: str
    access_token_expires_in: int
    refresh_token: str
    refresh_token_expires_at: datetime
    refresh_token_expires_in: int
    user_id: UUID
    user_nickname: str
    user_avatar_url: str | None
    user_status: Literal["active", "disabled"]
    user_created_at: datetime
