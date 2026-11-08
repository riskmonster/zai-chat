from fastapi import APIRouter, Request

from app.api.deps import CurrentUserDep
from app.core.request_context import get_request_id
from app.schemas.common import ApiEnvelope
from app.schemas.user import UserOut

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=ApiEnvelope[UserOut])
async def get_current_user_profile(
    request: Request,
    current_user: CurrentUserDep,
) -> ApiEnvelope[UserOut]:
    return ApiEnvelope(
        data=UserOut.model_validate(current_user),
        request_id=get_request_id(request),
    )
