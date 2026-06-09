from datetime import datetime, timedelta, timezone
from typing import Optional, TypedDict, cast
from uuid import uuid4
from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext
from fastapi import Request
import os
import base64
import hashlib
from cryptography.fernet import Fernet

# 本来は環境変数から取得
SECRET_KEY = os.getenv("SECRET_KEY", "your-fallback-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 360

def get_fernet_key(secret_key: str) -> bytes:
    """SECRET_KEYから32バイトのURL安全なbase64キーを生成"""
    h = hashlib.sha256(secret_key.encode()).digest()
    return base64.urlsafe_b64encode(h)

def encrypt_password(plain_password: str) -> str:
    """パスワードを対称暗号で暗号化"""
    key = get_fernet_key(SECRET_KEY)
    f = Fernet(key)
    return f.encrypt(plain_password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    """対称暗号化されたパスワードを復号"""
    key = get_fernet_key(SECRET_KEY)
    f = Fernet(key)
    return f.decrypt(encrypted_password.encode()).decode()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AccessTokenPayload(TypedDict, total=False):
    sub: str
    exp: datetime | int
    jti: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化"""
    return pwd_context.hash(password)

def create_access_token(data: AccessTokenPayload, expires_delta: Optional[timedelta] = None) -> str:
    """アクセストークンを生成
    
    Args:
        data: トークンに含めるデータ
        expires_delta: カスタム有効期限（指定ない場合はACCESS_TOKEN_EXPIRE_MINUTESを使用）
    
    Returns:
        JWT トークン文字列
    """
    to_encode: AccessTokenPayload = data.copy()
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "jti": str(uuid4())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> AccessTokenPayload:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return cast(AccessTokenPayload, payload)


def extract_token_from_request(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]

    return request.cookies.get("access_token")


def is_token_expired_error(error: Exception) -> bool:
    return isinstance(error, ExpiredSignatureError)


def is_token_invalid_error(error: Exception) -> bool:
    return isinstance(error, JWTError)
