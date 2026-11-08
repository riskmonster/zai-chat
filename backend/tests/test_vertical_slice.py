from typing import Any
from uuid import UUID, uuid4

import httpx
from sqlalchemy import delete

from app.db.models.user import User
from app.db.session import async_session_factory


async def cleanup_user(openid: str) -> None:
    async with async_session_factory() as session, session.begin():
        await session.execute(delete(User).where(User.openid == openid))


async def login(client: httpx.AsyncClient, openid: str) -> dict[str, Any]:
    response = await client.post(
        "/api/v1/auth/wx-login",
        json={
            "code": f"code:{openid}",
            "privacyVersion": "2026-11",
        },
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["code"] == 0
    assert payload["requestId"].startswith("req_")
    return payload["data"]


async def test_login_message_idempotency_refresh_and_logout(client: httpx.AsyncClient) -> None:
    openid = f"test-{uuid4().hex}"
    try:
        auth = await login(client, openid)
        user_id = auth["user"]["id"]
        headers = {"Authorization": f"Bearer {auth['accessToken']}"}

        profile = await client.get("/api/v1/users/me", headers=headers)
        assert profile.status_code == 200
        assert profile.json()["data"]["id"] == user_id

        client_message_id = str(uuid4())
        body = {
            "clientMessageId": client_message_id,
            "content": {"type": "text", "text": "  你好，落库测试  "},
        }
        created = await client.post("/api/v1/messages", headers=headers, json=body)
        assert created.status_code == 201, created.text
        created_message = created.json()["data"]["message"]
        assert created_message["conversationId"] == user_id
        assert created_message["content"]["text"] == "你好，落库测试"

        duplicate = await client.post("/api/v1/messages", headers=headers, json=body)
        assert duplicate.status_code == 200
        assert duplicate.json()["data"]["message"]["id"] == created_message["id"]

        conflicting = {
            **body,
            "content": {"type": "text", "text": "不同正文"},
        }
        conflict = await client.post("/api/v1/messages", headers=headers, json=conflicting)
        assert conflict.status_code == 409
        assert conflict.json()["code"] == "IDEMPOTENCY_KEY_REUSED"

        page = await client.get("/api/v1/messages", headers=headers)
        assert page.status_code == 200
        items = page.json()["data"]["items"]
        assert [item["id"] for item in items] == [created_message["id"]]

        refreshed = await client.post(
            "/api/v1/auth/refresh",
            json={"refreshToken": auth["refreshToken"]},
        )
        assert refreshed.status_code == 200
        refreshed_auth = refreshed.json()["data"]

        reused_refresh = await client.post(
            "/api/v1/auth/refresh",
            json={"refreshToken": auth["refreshToken"]},
        )
        assert reused_refresh.status_code == 401

        refreshed_headers = {
            "Authorization": f"Bearer {refreshed_auth['accessToken']}",
        }
        logout = await client.post("/api/v1/auth/logout", headers=refreshed_headers)
        assert logout.status_code == 204

        revoked = await client.get("/api/v1/users/me", headers=refreshed_headers)
        assert revoked.status_code == 401
        assert revoked.json()["code"] == "TOKEN_REVOKED"
    finally:
        await cleanup_user(openid)


async def test_messages_are_isolated_by_authenticated_user(client: httpx.AsyncClient) -> None:
    first_openid = f"test-{uuid4().hex}"
    second_openid = f"test-{uuid4().hex}"
    try:
        first_auth = await login(client, first_openid)
        second_auth = await login(client, second_openid)
        first_headers = {"Authorization": f"Bearer {first_auth['accessToken']}"}
        second_headers = {"Authorization": f"Bearer {second_auth['accessToken']}"}

        created = await client.post(
            "/api/v1/messages",
            headers=first_headers,
            json={
                "clientMessageId": str(uuid4()),
                "content": {"type": "text", "text": "只属于第一个用户"},
            },
        )
        assert created.status_code == 201
        assert UUID(created.json()["data"]["message"]["conversationId"]) == UUID(
            first_auth["user"]["id"],
        )

        second_page = await client.get("/api/v1/messages", headers=second_headers)
        assert second_page.status_code == 200
        assert second_page.json()["data"]["items"] == []
    finally:
        await cleanup_user(first_openid)
        await cleanup_user(second_openid)


async def test_rejects_missing_auth_and_invalid_message_body(client: httpx.AsyncClient) -> None:
    unauthorized = await client.post(
        "/api/v1/messages",
        json={
            "clientMessageId": str(uuid4()),
            "content": {"type": "text", "text": "hello"},
        },
    )
    assert unauthorized.status_code == 401

    openid = f"test-{uuid4().hex}"
    try:
        auth = await login(client, openid)
        headers = {"Authorization": f"Bearer {auth['accessToken']}"}
        invalid = await client.post(
            "/api/v1/messages",
            headers=headers,
            json={
                "clientMessageId": str(uuid4()),
                "content": {"type": "text", "text": "   "},
            },
        )
        assert invalid.status_code == 400
        assert invalid.json()["code"] == "VALIDATION_ERROR"
    finally:
        await cleanup_user(openid)
