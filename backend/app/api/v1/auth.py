from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response

from app.api.deps import CurrentUserDep, SessionDep
from app.core.request_context import get_request_id
from app.schemas.auth import AuthSessionOut, RefreshTokenRequest, WxLoginRequest
from app.schemas.common import ApiEnvelope
from app.schemas.user import UserOut
from app.services.auth import login_with_wechat, logout_user, refresh_session
from app.services.wechat import WechatSessionClient, get_wechat_client

router = APIRouter(prefix="/auth", tags=["Auth"])
WechatClientDep = Annotated[WechatSessionClient, Depends(get_wechat_client)]


@router.post("/wx-login", response_model=ApiEnvelope[AuthSessionOut])
async def wx_login(
    request: Request,
    payload: WxLoginRequest,
    session: SessionDep,
    wechat_client: WechatClientDep,
) -> ApiEnvelope[AuthSessionOut]:
    issued = await login_with_wechat(
        session,
        wechat_client,
        code=payload.code,
        privacy_version=payload.privacy_version,
    )
    auth_session = AuthSessionOut(
        access_token=issued.access_token,
        access_token_expires_in=issued.access_token_expires_in,
        refresh_token=issued.refresh_token,
        refresh_token_expires_in=issued.refresh_token_expires_in,
        user=UserOut(
            id=issued.user_id,
            nickname=issued.user_nickname,
            avatar_url=issued.user_avatar_url,
            status=issued.user_status,
            created_at=issued.user_created_at,
        ),
    )
    return ApiEnvelope(data=auth_session, request_id=get_request_id(request))


@router.post("/refresh", response_model=ApiEnvelope[AuthSessionOut])
async def refresh_auth_session(
    request: Request,
    payload: RefreshTokenRequest,
    session: SessionDep,
) -> ApiEnvelope[AuthSessionOut]:
    issued = await refresh_session(session, refresh_token=payload.refresh_token)
    auth_session = AuthSessionOut(
        access_token=issued.access_token,
        access_token_expires_in=issued.access_token_expires_in,
        refresh_token=issued.refresh_token,
        refresh_token_expires_in=issued.refresh_token_expires_in,
        user=UserOut(
            id=issued.user_id,
            nickname=issued.user_nickname,
            avatar_url=issued.user_avatar_url,
            status=issued.user_status,
            created_at=issued.user_created_at,
        ),
    )
    return ApiEnvelope(data=auth_session, request_id=get_request_id(request))


@router.post("/logout", status_code=204)
async def logout(
    current_user: CurrentUserDep,
    session: SessionDep,
) -> Response:
    await logout_user(session, current_user.id)
    await session.commit()
    return Response(status_code=204)
