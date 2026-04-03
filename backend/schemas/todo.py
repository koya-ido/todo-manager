from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TodoBase(BaseModel):
    priority_id: int
    status_id: int
    manager_id: int
    name: str
    due_date: Optional[date] = None
    remarks: Optional[str] = None
    delete_flag: bool = False


class TodoCreate(TodoBase):
    created_by: int
    updated_by: int


class TodoUpdate(BaseModel):
    priority_id: Optional[int] = None
    status_id: Optional[int] = None
    manager_id: Optional[int] = None
    updated_by: int
    name: Optional[str] = None
    due_date: Optional[date] = None
    remarks: Optional[str] = None
    delete_flag: Optional[bool] = None


class TodoResponse(TodoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int
    updated_by: int
    created_at: datetime
    updated_at: datetime
