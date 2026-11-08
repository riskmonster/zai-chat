from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: Literal["development", "test", "production"] = "development"
    database_url: str
    wx_app_id: str
    wx_app_secret: SecretStr = SecretStr("")
    jwt_secret: SecretStr
    jwt_issuer: str = "zai-wp-chat-api"
    jwt_audience: str = "zai-wp-chat-mini-program"
    access_token_ttl_seconds: int = Field(default=900, ge=60, le=86400)
    refresh_token_ttl_seconds: int = Field(default=2_592_000, ge=3600)
    request_timeout_seconds: float = Field(default=5.0, gt=0, le=30)
    privacy_version: str = Field(default="2026-11", min_length=1, max_length=32)

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, value: SecretStr) -> SecretStr:
        secret = value.get_secret_value()
        if len(secret) < 32:
            raise ValueError("JWT_SECRET must contain at least 32 characters")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()  # pyright: ignore[reportCallIssue]
