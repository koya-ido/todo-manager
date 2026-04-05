from typing import List, Optional

from fastapi.responses import JSONResponse

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


def unauthorized_exception(code: str, detail: str) -> APIException:
    return APIException(
        status_code=401,
        title="認証エラー",
        detail=detail,
        code=code,
    )
