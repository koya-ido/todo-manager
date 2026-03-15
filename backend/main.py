import logging
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User
from auth import verify_password, create_access_token, get_password_hash
from schemas import LoginRequest, LoginResponse, ErrorResponse, FieldError

logger = logging.getLogger(__name__)

# テーブル作成
Base.metadata.create_all(bind=engine)

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
            detail="ユーザー名またはパスワードが正しくありません",
            code="INVALID_CREDENTIALS"
        )

    if not verify_password(request.password, user.password):
        raise APIException(
            status_code=401,
            title="認証エラー",
            detail="ユーザー名またはパスワードが正しくありません",
            code="INVALID_CREDENTIALS"
        )
    
    # アクセストークンを生成
    access_token = create_access_token(data={"sub": user.display_user_id})
    
    return LoginResponse(access_token=access_token)