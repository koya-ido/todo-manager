from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SignupRequest(BaseModel):
    username: str
    password: str


class SignupResponse(BaseModel):
    id: int
    display_id: str
    username: str
