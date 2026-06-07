from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import User
from schemas import (
    TeamApplicantResponse,
    TeamApplyingResponse,
    TeamApplyRequest,
    TeamJoinedResponse,
    TeamSearchResponse,
)
from services import (
    search_team_by_display_id,
    get_joined_teams,
    get_applying_teams,
    apply_to_team,
    cancel_application,
    get_applicants,
    approve_applicant,
    reject_applicant,
)

router = APIRouter(prefix="/api/team")


@router.get("/search", response_model=TeamSearchResponse)
def read_team_search(
    display_teams_id: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return search_team_by_display_id(db, display_teams_id, current_user.id)


@router.get("/joined", response_model=List[TeamJoinedResponse])
def read_joined_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_joined_teams(db, current_user.id)


@router.get("/applying", response_model=List[TeamApplyingResponse])
def read_applying_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_applying_teams(db, current_user.id)


@router.post("/{team_id}/apply")
def submit_team_apply(
    team_id: int,
    request: TeamApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apply_to_team(db, team_id, current_user.id, request.password)
    return {"success": True}


@router.delete("/{team_id}/apply")
def delete_team_apply(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cancel_application(db, team_id, current_user.id)
    return {"success": True}


@router.get("/{team_id}/applicants", response_model=List[TeamApplicantResponse])
def read_team_applicants(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_applicants(db, team_id, current_user.id)


@router.post("/{team_id}/applicants/{user_id}/approve")
def approve_team_applicant(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approve_applicant(db, team_id, user_id, current_user.id)
    return {"success": True}


@router.post("/{team_id}/applicants/{user_id}/reject")
def reject_team_applicant(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reject_applicant(db, team_id, user_id, current_user.id)
    return {"success": True}
