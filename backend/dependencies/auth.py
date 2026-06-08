from typing import Optional

from fastapi import Depends, Request
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer

from auth import (
    decode_token,
    extract_token_from_request,
    is_token_expired_error,
    is_token_invalid_error,
)
from database import get_db
from exceptions import unauthorized_exception
from models import RevokedToken, User

auth_scheme = HTTPBearer(auto_error=False)


def get_current_user(request: Request, db: Session = Depends(get_db), _token_obj: Optional[object] = Depends(auth_scheme)) -> User:
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

    user = db.query(User).filter(
        User.display_user_id == subject,
        User.delete_flag.is_(False),
    ).first()
    if not user:
        raise unauthorized_exception(
            code="INVALID_TOKEN",
            detail="認証情報が無効です。再度ログインしてください。",
        )

    return user


def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    token = extract_token_from_request(request)
    if not token:
        return None

    try:
        payload = decode_token(token)
    except Exception:
        return None

    subject = payload.get("sub")
    jti = payload.get("jti")
    exp_timestamp = payload.get("exp")
    if not subject or not jti or not exp_timestamp:
        return None

    revoked_token = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    if revoked_token:
        return None

    user = db.query(User).filter(
        User.display_user_id == subject,
        User.delete_flag.is_(False),
    ).first()
    return user

