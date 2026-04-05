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


class CurrentUserResponse(BaseModel):
    display_user_id: str
    user_name: str


class LogoutResponse(BaseModel):
    success: bool = True


class DeleteUserResponse(BaseModel):
    success: bool = True
    display_id: str
    deletion_mode: str
