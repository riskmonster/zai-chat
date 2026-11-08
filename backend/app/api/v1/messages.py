from typing import Annotated

from fastapi import APIRouter, Query, Request, status
from fastapi.responses import JSONResponse

from app.api.deps import CurrentUserDep, SessionDep
from app.core.request_context import get_request_id
from app.schemas.common import ApiEnvelope
from app.schemas.message import (
    CreatePersistedMessageRequest,
    PersistedMessageData,
    PersistedMessageOut,
    PersistedMessagePage,
)
from app.services.message import get_message_page, persist_message

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post(
    "",
    response_model=ApiEnvelope[PersistedMessageData],
    status_code=status.HTTP_201_CREATED,
)
async def create_persisted_message(
    request: Request,
    payload: CreatePersistedMessageRequest,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> JSONResponse:
    request_id = get_request_id(request)
    message, is_created = await persist_message(
        session,
        user_id=current_user.id,
        client_message_id=payload.client_message_id,
        text=payload.content.text,
        request_id=request_id,
    )
    await session.commit()
    envelope = ApiEnvelope(
        data=PersistedMessageData(message=PersistedMessageOut.model_validate(message)),
        request_id=request_id,
    )
    status_code = status.HTTP_201_CREATED if is_created else status.HTTP_200_OK
    return JSONResponse(
        status_code=status_code,
        content=envelope.model_dump(mode="json", by_alias=True),
    )


@router.get("", response_model=ApiEnvelope[PersistedMessagePage])
async def list_persisted_messages(
    request: Request,
    current_user: CurrentUserDep,
    session: SessionDep,
    cursor: Annotated[str | None, Query(max_length=512)] = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> ApiEnvelope[PersistedMessagePage]:
    messages, next_cursor = await get_message_page(
        session,
        user_id=current_user.id,
        cursor=cursor,
        limit=limit,
    )
    return ApiEnvelope(
        data=PersistedMessagePage(
            items=[PersistedMessageOut.model_validate(message) for message in messages],
            next_cursor=next_cursor,
        ),
        request_id=get_request_id(request),
    )
