from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from auth import create_access_token, extract_token_from_request
from database import get_db
from dependencies import get_current_user
from models import User
from schemas import CurrentUserResponse, LoginRequest, LoginResponse, LogoutResponse, SignupRequest, SignupResponse
from services import authenticate_user, create_user, revoke_access_token

router = APIRouter(prefix="/api")


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.username, request.password)
    access_token = create_access_token(data={"sub": user.display_user_id})
    return LoginResponse(access_token=access_token)


@router.post("/signup", response_model=SignupResponse, status_code=201)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    return create_user(db, request.username, request.password)


@router.get("/me", response_model=CurrentUserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return CurrentUserResponse(
        display_user_id=current_user.display_user_id,
        user_name=current_user.user_name,
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(request: Request, db: Session = Depends(get_db)):
    revoke_access_token(db, extract_token_from_request(request))
    return LogoutResponse()
