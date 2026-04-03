import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, RevokedToken, User
from auth import (
    create_access_token,
    decode_token,
    extract_token_from_request,
    is_token_expired_error,
    is_token_invalid_error,
    verify_password,
)
from schemas import (
    CurrentUserResponse,
    ErrorResponse,
    FieldError,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
)

logger = logging.getLogger(__name__)

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# カスタム例外
class APIException(Exception):
    """APIレスポンス形式でエラーを返す例外"""
    def __init__(self, status_code: int, title: str, detail: str, code: str, errors: Optional[List[FieldError]] = None):
        self.status_code = status_code
        self.title = title
        self.detail = detail
        self.code = code
        self.errors = errors

# 例外ハンドラー
@app.exception_handler(APIException)
async def api_exception_handler(request, exc: APIException):
    error_response = ErrorResponse(
        status=exc.status_code,
        title=exc.title,
        detail=exc.detail,
        code=exc.code,
        errors=exc.errors
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(exclude_none=True)
    )

@app.get("/")
def read_root():
    return {"Hello": "World"}


def unauthorized_exception(code: str, detail: str) -> APIException:
    return APIException(
        status_code=401,
        title="認証エラー",
        detail=detail,
        code=code,
    )


def parse_expiration(exp_timestamp) -> datetime:
    if isinstance(exp_timestamp, datetime):
        return exp_timestamp

    return datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = extract_token_from_request(request)
    if not token:
        raise unauthorized_exception(
            code="AUTHENTICATION_REQUIRED",
            detail="認証が必要です",
        )

    try:
        payload = decode_token(token)
    except Exception as error:
        if is_token_expired_error(error):
            raise unauthorized_exception(
                code="TOKEN_EXPIRED",
                detail="セッションの有効期限が切れました。ログインしなおしてください。",
            )
        if is_token_invalid_error(error):
            raise unauthorized_exception(
                code="INVALID_TOKEN",
                detail="認証情報が無効です。再度ログインしてください。",
            )
        raise

    subject = payload.get("sub")
    jti = payload.get("jti")
    exp_timestamp = payload.get("exp")
    if not subject or not jti or not exp_timestamp:
        raise unauthorized_exception(
            code="INVALID_TOKEN",
            detail="認証情報が無効です。再度ログインしてください。",
        )

    revoked_token = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    if revoked_token:
        raise unauthorized_exception(
            code="TOKEN_REVOKED",
            detail="ログイン状態が無効になりました。再度ログインしてください。",
        )

    user = db.query(User).filter(User.display_user_id == subject).first()
    if not user:
        raise unauthorized_exception(
            code="INVALID_TOKEN",
            detail="認証情報が無効です。再度ログインしてください。",
        )

    return user

@app.post("/api/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    ユーザーログイン
    
    リクエスト例:
    {
        "username": "user123",
        "password": "password123"
    }
    """
    # ユーザー名でデータベースから検索
    # ダミー検証でタイミングを均等化
    user = db.query(User).filter(User.display_user_id == request.username).first()
    # ユーザーが存在しないまたはパスワードが間違っている場合
    if not user:
        # ダミーハッシュ検証
        dummy_hash = "$2b$12$R9h/cIPz0gi.URNNGHQ1KuYzK5hKmRqD0Q0jLJ6q3J6F8MzN4Wnxe"  # bcrypt hash
        verify_password(request.password, dummy_hash)
        raise APIException(
            status_code=401,
            title="認証エラー",
            detail="IDまたはパスワードが正しくありません",
            code="INVALID_CREDENTIALS",
            errors=[{
                "code": "INVALID_CREDENTIALS",
                "pointer": "login-form",
            }]
        )

    if not verify_password(request.password, user.password):
        raise APIException(
            status_code=401,
            title="認証エラー",
            detail="IDまたはパスワードが正しくありません",
            code="INVALID_CREDENTIALS",
            errors=[{
                "code": "INVALID_CREDENTIALS",
                "pointer": "login-form",
            }]
        )
    
    # アクセストークンを生成
    access_token = create_access_token(data={"sub": user.display_user_id})
    
    return LoginResponse(access_token=access_token)


@app.get("/api/me", response_model=CurrentUserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return CurrentUserResponse(
        display_user_id=current_user.display_user_id,
        user_name=current_user.user_name,
    )


@app.post("/api/logout", response_model=LogoutResponse)
def logout(request: Request, db: Session = Depends(get_db)):
    token = extract_token_from_request(request)
    if not token:
        return LogoutResponse()

    try:
        payload = decode_token(token)
    except Exception as error:
        if is_token_expired_error(error) or is_token_invalid_error(error):
            return LogoutResponse()
        raise

    jti = payload.get("jti")
    subject = payload.get("sub")
    exp_timestamp = payload.get("exp")

    if jti and subject and exp_timestamp:
        already_revoked = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
        if not already_revoked:
            db.add(
                RevokedToken(
                    jti=jti,
                    subject=subject,
                    expires_at=parse_expiration(exp_timestamp),
                    is_manual_logout=True,
                )
            )
            db.commit()

    return LogoutResponse()

