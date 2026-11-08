from dataclasses import dataclass
from functools import lru_cache
from typing import Protocol

import httpx

from app.core.config import get_settings
from app.core.errors import ApiError


@dataclass(frozen=True, slots=True)
class WechatSession:
    openid: str
    unionid: str | None


class WechatSessionClient(Protocol):
    async def exchange_code(self, code: str) -> WechatSession: ...


class HttpWechatSessionClient:
    async def exchange_code(self, code: str) -> WechatSession:
        settings = get_settings()
        if not settings.wx_app_id or not settings.wx_app_secret.get_secret_value():
            raise ApiError(503, "WECHAT_NOT_CONFIGURED", "微信登录尚未完成服务端配置")

        params = {
            "appid": settings.wx_app_id,
            "secret": settings.wx_app_secret.get_secret_value(),
            "js_code": code,
            "grant_type": "authorization_code",
        }
        try:
            async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
                response = await client.get(
                    "https://api.weixin.qq.com/sns/jscode2session",
                    params=params,
                )
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise ApiError(502, "WECHAT_UPSTREAM_UNAVAILABLE", "微信登录服务暂时不可用") from error

        errcode = payload.get("errcode")
        if errcode not in (None, 0):
            raise ApiError(400, "WX_CODE_INVALID", "微信登录凭证无效或已过期")

        openid = payload.get("openid")
        if not isinstance(openid, str) or not openid:
            raise ApiError(502, "WECHAT_RESPONSE_INVALID", "微信登录服务返回的数据无效")

        unionid = payload.get("unionid")
        return WechatSession(
            openid=openid,
            unionid=unionid if isinstance(unionid, str) and unionid else None,
        )


@lru_cache
def get_wechat_client() -> WechatSessionClient:
    return HttpWechatSessionClient()
