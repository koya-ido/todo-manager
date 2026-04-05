from datetime import datetime, timezone

from sqlalchemy.orm import Session

from auth import (
    decode_token,
    is_token_expired_error,
    is_token_invalid_error,
    verify_password,
)
from exceptions import APIException
from models import RevokedToken, User


def parse_expiration(exp_timestamp) -> datetime:
    if isinstance(exp_timestamp, datetime):
        return exp_timestamp

    return datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)


def authenticate_user(db: Session, username: str, password: str) -> User:
    user = db.query(User).filter(
        User.display_user_id == username,
        User.delete_flag.is_(False),
    ).first()
    if not user:
        dummy_hash = "$2b$12$R9h/cIPz0gi.URNNGHQ1KuYzK5hKmRqD0Q0jLJ6q3J6F8MzN4Wnxe"
        verify_password(password, dummy_hash)
        raise APIException(
            status_code=401,
            title="認証エラー",
            detail="IDまたはパスワードが正しくありません",
            code="INVALID_CREDENTIALS",
            errors=[{
                "code": "INVALID_CREDENTIALS",
                "pointer": "login-form",
            }],
        )

    if not verify_password(password, user.password):
        raise APIException(
            status_code=401,
            title="認証エラー",
            detail="IDまたはパスワードが正しくありません",
            code="INVALID_CREDENTIALS",
            errors=[{
                "code": "INVALID_CREDENTIALS",
                "pointer": "login-form",
            }],
        )

    return user


def revoke_access_token(db: Session, token: str | None) -> None:
    if not token:
        return

    try:
        payload = decode_token(token)
    except Exception as error:
        if is_token_expired_error(error) or is_token_invalid_error(error):
            return
        raise

    jti = payload.get("jti")
    subject = payload.get("sub")
    exp_timestamp = payload.get("exp")
    if not (jti and subject and exp_timestamp):
        return

    already_revoked = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    if already_revoked:
        return

    db.add(
        RevokedToken(
            jti=jti,
            subject=subject,
            expires_at=parse_expiration(exp_timestamp),
            is_manual_logout=True,
        )
    )
    db.commit()
