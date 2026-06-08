from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import User
from schemas import InboxResponse
from services import get_inboxes, delete_inbox, get_unread_count


router = APIRouter(prefix="/api/inbox")

@router.get("/unread")
def read_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = get_unread_count(db, current_user.id)
    return {"count": count}


@router.get("", response_model=List[InboxResponse])
def read_inboxes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inboxes = get_inboxes(db, current_user.id)
    results = []
    for inbox in inboxes:
        todo_info = None
        if inbox.todo:
            todo_info = {
                "id": inbox.todo.id,
                "name": inbox.todo.name,
                "team_name": inbox.todo.team.name if inbox.todo.team else None
            }
        results.append({
            "id": inbox.id,
            "target_user_id": inbox.target_user_id,
            "todo_id": inbox.todo_id,
            "type": inbox.type,
            "message": inbox.message,
            "is_read": inbox.is_read,
            "created_at": inbox.created_at,
            "todo": todo_info
        })
    return results

@router.delete("/{inbox_id}")
def remove_inbox(
    inbox_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_inbox(db, inbox_id, current_user.id)
    return {"success": True}
