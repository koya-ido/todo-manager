from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .tag import TagResponse
from .user import UserResponse



class TaskBase(BaseModel):
    title: str = Field(max_length=50)
    content: Optional[str] = Field(default=None, max_length=800)
    completion_flag: bool = False


class TaskCreate(TaskBase):
    pass


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    position: int


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    todo_id: int
    comment: str = Field(max_length=800)
    created_at: datetime
    updated_at: datetime
    delete_flag: bool
    user: Optional[UserResponse] = None


class CommentCreate(BaseModel):
    comment: str = Field(max_length=800)


class TaskPatch(BaseModel):
    completion_flag: bool


class TodoBase(BaseModel):
    priority_id: int
    status_id: int
    team_id: Optional[int] = None
    manager_id: Optional[int] = None
    name: str
    due_date: Optional[date] = None
    remarks: Optional[str] = None
    delete_flag: bool = False


class TodoCreate(TodoBase):
    tasks: list[TaskCreate] = Field(min_length=1)
    tag_ids: Optional[list[int]] = None


class TodoUpdate(BaseModel):
    priority_id: Optional[int] = None
    status_id: Optional[int] = None
    team_id: Optional[int] = None
    manager_id: Optional[int] = None
    name: Optional[str] = None
    due_date: Optional[date] = None
    remarks: Optional[str] = None
    delete_flag: Optional[bool] = None
    tasks: Optional[list[TaskCreate]] = None
    tag_ids: Optional[list[int]] = None


class TodoResponse(TodoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int
    updated_by: int
    created_at: datetime
    updated_at: datetime
    tasks: list[TaskResponse] = Field(default_factory=list)
    comments: list[CommentResponse] = Field(default_factory=list)
    tags: list[TagResponse] = Field(default_factory=list)
    manager: Optional[UserResponse] = None


class TodosResponse(BaseModel):
    total: int
    items: list[TodoResponse]
