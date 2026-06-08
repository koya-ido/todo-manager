from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user, get_current_user_optional
from exceptions import APIException
from models import User
from schemas import DeleteUserResponse, UserResponse, UserUpdate, UsernameCheckResponse
from services import (
    delete_user_by_display_id,
    get_team_members,
    get_all_teams_members,
    update_user,
)

router = APIRouter(prefix="/api/user")




@router.get("/team/{team_id}/members", response_model=List[UserResponse])
def read_team_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_team_members(db, team_id, current_user.id)


@router.get("/teams/members", response_model=List[UserResponse])
def read_all_teams_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_teams_members(db, current_user.id)



@router.delete("/{display_user_id}", response_model=DeleteUserResponse)
def delete_user(
    display_user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.display_user_id != display_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="自分自身のユーザーのみ削除できます",
            code="FORBIDDEN_USER_DELETION",
        )

    return delete_user_by_display_id(db, display_user_id)


@router.put("/me", response_model=UserResponse)
def update_user_info(
    request: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_user = db.query(User).filter(
        User.user_name == request.username,
        User.id != current_user.id,
        User.delete_flag.is_(False),
    ).first()
    if existing_user:
        raise APIException(
            status_code=400,
            title="バリデーションエラー",
            detail="このユーザー名はすでに使用されています",
            code="USERNAME_ALREADY_EXISTS",
            errors=[{
                "code": "USERNAME_ALREADY_EXISTS",
                "pointer": "/username",
            }],
        )

    return update_user(db, current_user, request.username, request.password)


@router.get("/check-username", response_model=UsernameCheckResponse)
def check_username(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(User).filter(
        User.user_name == username,
        User.delete_flag.is_(False),
    )
    if current_user:
        query = query.filter(User.id != current_user.id)
    exists = query.first() is not None
    return UsernameCheckResponse(available=not exists)

