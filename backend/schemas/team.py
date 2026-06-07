from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TeamSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_teams_id: str
    name: str
    created_user_name: str
    created_user_display_id: str
    is_member: bool
    is_applying: bool


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
