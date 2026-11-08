from datetime import datetime
from typing import Literal
from uuid import UUID

from app.schemas.common import CamelModel


class UserOut(CamelModel):
    id: UUID
    nickname: str
    avatar_url: str | None = None
    status: Literal["active", "disabled"]
    created_at: datetime
