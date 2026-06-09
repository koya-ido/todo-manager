from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InboxBase(BaseModel):
    target_user_id: int
    todo_id: Optional[int] = None
    type: str
    message: str
    is_read: bool = False


class InboxCreate(InboxBase):
    pass


class InboxTodoInfo(BaseModel):
    id: int
    name: str
    team_name: Optional[str] = None
    team_id: Optional[int] = None


class InboxResponse(InboxBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    todo: Optional[InboxTodoInfo] = None

