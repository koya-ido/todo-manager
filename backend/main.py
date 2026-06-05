from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from exceptions import APIException, api_exception_handler
from routers import auth_router, user_router, tag_router, todo_router

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


@app.get("/")
def read_root():
    return {"Hello": "World"}


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(tag_router)
app.include_router(todo_router)
