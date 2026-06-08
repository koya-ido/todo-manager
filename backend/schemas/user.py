from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    display_user_id: str
    user_name: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    username: str
    password: str


class UsernameCheckResponse(BaseModel):
    available: bool

