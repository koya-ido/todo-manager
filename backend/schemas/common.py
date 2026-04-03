from typing import List, Optional

from pydantic import BaseModel


class FieldError(BaseModel):
    """フィールド単位のエラー情報"""

    code: str
    pointer: str
    param: dict = {}


class ErrorResponse(BaseModel):
    """統一したエラーレスポンス形式"""

    status: int
    title: str
    detail: str
    code: str
    errors: Optional[List[FieldError]] = None
