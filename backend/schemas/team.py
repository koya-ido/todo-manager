from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TeamSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_teams_id: str
    name: str
    created_user_name: str
    created_user_display_id: str
    is_member: bool
    is_applying: bool
    accepting_applications: bool


class TeamApplyRequest(BaseModel):
    password: str


class TeamJoinedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_teams_id: str
    name: str
    created_user_id: int
    created_user_name: str
    created_user_display_id: str
    member_count: int
    is_owner: bool


class TeamApplyingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_teams_id: str
    name: str
    created_user_name: str
    created_user_display_id: str
    applied_at: datetime


class TeamApplicantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_user_id: str
    user_name: str
    applied_at: datetime


class TeamDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_teams_id: str
    name: str
    created_user_id: int
    created_user_name: str
    created_user_display_id: str
    is_owner: bool
    accepting_applications: bool
    password: Optional[str] = None


class TeamAcceptingApplicationsUpdate(BaseModel):
    accepting_applications: bool


class TeamMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_user_id: str
    user_name: str
    is_owner: bool


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8)


class TeamUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    password: Optional[str] = Field(None, min_length=8)

