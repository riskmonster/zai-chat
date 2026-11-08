from collections.abc import AsyncIterator

import httpx
import pytest_asyncio

from app.main import app
from app.services.wechat import WechatSession, get_wechat_client


class FakeWechatSessionClient:
    async def exchange_code(self, code: str) -> WechatSession:
        if not code.startswith("code:"):
            raise RuntimeError("unexpected test code")
        return WechatSession(openid=code.removeprefix("code:"), unionid=None)


@pytest_asyncio.fixture
async def client() -> AsyncIterator[httpx.AsyncClient]:
    app.dependency_overrides[get_wechat_client] = lambda: FakeWechatSessionClient()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client
    app.dependency_overrides.clear()
