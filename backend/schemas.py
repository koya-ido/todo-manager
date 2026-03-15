"""
APIリクエスト/レスポンススキーマ定義
"""
from pydantic import BaseModel
from typing import Optional, List


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


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
