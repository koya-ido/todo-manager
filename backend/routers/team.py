from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import User
from models import Team
from exceptions import APIException
from schemas import (
    TeamApplicantResponse,
    TeamApplyingResponse,
    TeamApplyRequest,
    TeamJoinedResponse,
    TeamSearchResponse,
    TeamDetailResponse,
    TeamAcceptingApplicationsUpdate,
    TeamMemberResponse,
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
    get_team_details,
    update_accepting_applications,
    delete_team,
    kick_member,
    get_team_members,
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


@router.get("/{team_id}", response_model=TeamDetailResponse)
def read_team_details(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_team_details(db, team_id, current_user.id)


@router.patch("/{team_id}/accepting-applications")
def update_team_accepting_applications(
    team_id: int,
    request: TeamAcceptingApplicationsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_accepting_applications(db, team_id, request.accepting_applications, current_user.id)
    return {"success": True}


@router.delete("/{team_id}")
def delete_team_endpoint(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_team(db, team_id, current_user.id)
    return {"success": True}


@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
def read_team_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="取得エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    members = get_team_members(db, team_id, current_user.id)
    return [
        TeamMemberResponse(
            id=m.id,
            display_user_id=m.display_user_id,
            user_name=m.user_name,
            is_owner=(m.id == team.created_user_id),
        )
        for m in members
    ]


@router.delete("/{team_id}/members/{user_id}")
def kick_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kick_member(db, team_id, user_id, current_user.id)
    return {"success": True}
