from .auth import router as auth_router
from .user import router as user_router
from .tag import router as tag_router
from .todo import router as todo_router
from .team import router as team_router
from .inbox import router as inbox_router

__all__ = ["auth_router", "user_router", "tag_router", "todo_router", "team_router", "inbox_router"]

