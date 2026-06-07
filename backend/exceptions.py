from typing import List, Optional

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from schemas import ErrorResponse, FieldError


class APIException(Exception):
    """APIレスポンス形式でエラーを返す例外"""

    def __init__(
        self,
        status_code: int,
        title: str,
        detail: str,
        code: str,
        errors: Optional[List[FieldError]] = None,
    ):
        self.status_code = status_code
        self.title = title
        self.detail = detail
        self.code = code
        self.errors = errors


async def api_exception_handler(request, exc: APIException):
    error_response = ErrorResponse(
        status=exc.status_code,
        title=exc.title,
        detail=exc.detail,
        code=exc.code,
        errors=exc.errors,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(exclude_none=True),
    )


async def validation_exception_handler(request, exc: RequestValidationError):
    field_errors = []
    for error in exc.errors():
        loc = error.get("loc", [])
        # Format JSON Pointer (skipping body request parameter root)
        if len(loc) > 1 and loc[0] == "body":
            pointer = "/" + "/".join(str(x) for x in loc[1:])
        elif len(loc) > 0:
            pointer = "/" + "/".join(str(x) for x in loc)
        else:
            pointer = "/"

        error_type = error.get("type", "")
        ctx = error.get("ctx", {})

        # Default code & parameters
        code = "validate.invalid"
        param = {}

        if error_type == "missing":
            code = "validate.required"
        elif "too_long" in error_type or "length" in error_type:
            code = "validate.maxLength"
            max_len = ctx.get("max_length") or ctx.get("limit_value") or ""
            param = {"max": max_len}
        elif "date" in error_type or "time" in error_type:
            code = "validate.invalidDate"

        field_errors.append(
            FieldError(
                code=code,
                pointer=pointer,
                param=param,
            )
        )

    error_response = ErrorResponse(
        status=422,
        title="バリデーションエラー",
        detail="入力内容に誤りがあります",
        code="VALIDATION_ERROR",
        errors=field_errors,
    )
    return JSONResponse(
        status_code=422,
        content=error_response.model_dump(exclude_none=True),
    )


async def http_exception_handler(request, exc: StarletteHTTPException):
    error_response = ErrorResponse(
        status=exc.status_code,
        title="エラー",
        detail=str(exc.detail),
        code="HTTP_ERROR",
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(exclude_none=True),
    )


async def general_exception_handler(request, exc: Exception):
    error_response = ErrorResponse(
        status=500,
        title="システムエラー",
        detail="サーバーで予期しないエラーが発生しました。",
        code="INTERNAL_SERVER_ERROR",
    )
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump(exclude_none=True),
    )


def unauthorized_exception(code: str, detail: str) -> APIException:
    return APIException(
        status_code=401,
        title="認証エラー",
        detail=detail,
        code=code,
    )
