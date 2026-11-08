from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(part.capitalize() for part in tail)


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
        from_attributes=True,
    )


class ApiEnvelope(CamelModel, Generic[T]):
    code: int = 0
    message: str = "ok"
    request_id: str
    data: T


class ApiErrorResponse(CamelModel):
    code: str
    message: str
    request_id: str = Field(min_length=1)
