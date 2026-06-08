from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from exceptions import (
    APIException,
    api_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler,
)
from routers import auth_router, user_router, tag_router, todo_router, team_router, inbox_router


app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(APIException)
async def handle_api_exception(request, exc: APIException):
    return await api_exception_handler(request, exc)


@app.exception_handler(RequestValidationError)
async def handle_validation_exception(request, exc: RequestValidationError):
    return await validation_exception_handler(request, exc)


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(request, exc: StarletteHTTPException):
    return await http_exception_handler(request, exc)


@app.exception_handler(Exception)
async def handle_general_exception(request, exc: Exception):
    return await general_exception_handler(request, exc)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(tag_router)
app.include_router(todo_router)
app.include_router(team_router)
app.include_router(inbox_router)

