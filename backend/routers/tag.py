from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models import User
from schemas import TagResponse, TagRequest, TagUpdate
from services import (
    create_tag,
    delete_tag,
    get_tags,
    update_tag,
    validate_team_member,
)

router = APIRouter(prefix="/api/tags")


@router.get("/me", response_model=List[TagResponse])
def get_my_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tags(db, user_id=current_user.id)


@router.post("/me", response_model=TagResponse)
def create_my_tag(
    request: TagRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_tag(db, request.name, user_id=current_user.id)


@router.put("/me/{tag_id}", response_model=TagResponse)
def update_my_tag(
    tag_id: int,
    request: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_tag(db, tag_id, request.name, user_id=current_user.id)


@router.delete("/me/{tag_id}", response_model=TagResponse)
def delete_my_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_tag(db, tag_id, user_id=current_user.id)


@router.get("/team/{team_id}", response_model=List[TagResponse])
def get_team_tags(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_team_member(db, team_id, current_user.id)
    return get_tags(db, team_id=team_id)


@router.post("/team/{team_id}", response_model=TagResponse)
def create_team_tag(
    team_id: int,
    request: TagRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_team_member(db, team_id, current_user.id)
    return create_tag(db, request.name, team_id=team_id)


@router.put("/team/{team_id}/{tag_id}", response_model=TagResponse)
def update_team_tag(
    team_id: int,
    tag_id: int,
    request: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_team_member(db, team_id, current_user.id)
    return update_tag(db, tag_id, request.name, team_id=team_id)


@router.delete("/team/{team_id}/{tag_id}", response_model=TagResponse)
def delete_team_tag(
    team_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_team_member(db, team_id, current_user.id)
    return delete_tag(db, tag_id, team_id=team_id)
