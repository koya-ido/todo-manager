from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from exceptions import APIException
from models import User
from schemas import DeleteUserResponse, UserResponse
from services import delete_user_by_display_id, get_team_members, get_all_teams_members

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
