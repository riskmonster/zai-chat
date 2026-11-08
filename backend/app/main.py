import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from app.api.v1.router import router as v1_router
from app.core.errors import ApiError
from app.core.logging import configure_logging
from app.core.request_context import create_request_id, get_request_id
from app.db.session import engine
from app.schemas.common import ApiErrorResponse

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    configure_logging()
    application = FastAPI(
        title="Zai WP Chat API",
        version="0.1.0",
        lifespan=lifespan,
    )

    @application.middleware("http")
    async def request_context_middleware(
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        request.state.request_id = create_request_id(request.headers.get("X-Request-ID"))
        response = await call_next(request)
        response.headers["X-Request-ID"] = get_request_id(request)
        return response

    @application.exception_handler(ApiError)
    async def api_error_handler(request: Request, error: ApiError) -> JSONResponse:
        payload = ApiErrorResponse(
            code=error.code,
            message=error.message,
            request_id=get_request_id(request),
        )
        return JSONResponse(
            status_code=error.status_code,
            content=payload.model_dump(mode="json", by_alias=True),
            headers=error.headers,
        )

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request,
        _error: RequestValidationError,
    ) -> JSONResponse:
        payload = ApiErrorResponse(
            code="VALIDATION_ERROR",
            message="请求参数无效",
            request_id=get_request_id(request),
        )
        return JSONResponse(
            status_code=400,
            content=payload.model_dump(mode="json", by_alias=True),
        )

    @application.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, _error: Exception) -> JSONResponse:
        request_id = get_request_id(request)
        logger.exception("Unhandled request error request_id=%s", request_id)
        payload = ApiErrorResponse(
            code="INTERNAL_ERROR",
            message="服务暂时不可用",
            request_id=request_id,
        )
        return JSONResponse(
            status_code=500,
            content=payload.model_dump(mode="json", by_alias=True),
        )

    application.include_router(v1_router)
    return application


app = create_app()
