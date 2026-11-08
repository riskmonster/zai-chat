import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID, uuid4

import jwt
from jwt import InvalidTokenError

from app.core.config import get_settings
from app.core.errors import ApiError


def create_access_token(user_id: UUID, token_version: int) -> tuple[str, int]:
    settings = get_settings()
    now = datetime.now(UTC)
    expires_in = settings.access_token_ttl_seconds
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "tokenVersion": token_version,
        "type": "access",
        "jti": str(uuid4()),
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }
    token = jwt.encode(  # pyright: ignore[reportUnknownMemberType]
        payload,
        settings.jwt_secret.get_secret_value(),
        algorithm="HS256",
    )
    return token, expires_in


def decode_access_token(token: str) -> tuple[UUID, int]:
    settings = get_settings()
    try:
        payload = jwt.decode(  # pyright: ignore[reportUnknownMemberType]
            token,
            settings.jwt_secret.get_secret_value(),
            algorithms=["HS256"],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
            options={"require": ["sub", "tokenVersion", "type", "jti", "iat", "exp"]},
        )
    except InvalidTokenError as error:
        raise ApiError(401, "AUTH_EXPIRED", "登录已失效，请重新登录") from error

    if payload.get("type") != "access":
        raise ApiError(401, "AUTH_EXPIRED", "登录凭证类型无效")

    try:
        user_id = UUID(str(payload["sub"]))
        token_version = int(payload["tokenVersion"])
    except (KeyError, TypeError, ValueError) as error:
        raise ApiError(401, "AUTH_EXPIRED", "登录凭证无效") from error
    return user_id, token_version


def create_refresh_token() -> tuple[str, str, datetime]:
    token = secrets.token_urlsafe(48)
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(seconds=settings.refresh_token_ttl_seconds)
    return token, hash_refresh_token(token), expires_at


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
