from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import User
from schemas import CommentCreate, CommentResponse, TaskPatch, TodoCreate, TodoResponse, TodoUpdate, TodosResponse
from services import (
    create_todo,
    get_todo,
    get_todos,
    update_todo,
    create_comment,
    delete_comment,
    update_task_completion,
    delete_todo,
    update_comment,
)

router = APIRouter(prefix="/api/todo")


@router.get("", response_model=TodosResponse)
def read_todos(
    mode: str | None = None,
    is_delete_only: bool = False,
    keyword: str | None = None,
    status: List[int] | None = Query(None),
    priority: List[int] | None = Query(None),
    sort: str | None = None,
    offset: int | None = None,
    limit: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todos, total = get_todos(
        db,
        current_user.id,
        mode=mode,
        is_delete_only=is_delete_only,
        keyword=keyword,
        status_ids=status,
        priority_ids=priority,
        sort=sort,
        offset=offset,
        limit=limit,
    )
    return {"total": total, "items": todos}


@router.post("", response_model=TodoResponse)
def create_todo_item(
    request: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_todo(db, request, current_user.id)


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo_item(
    todo_id: int,
    request: TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_todo(db, todo_id, request, current_user.id)


@router.get("/{todo_id}", response_model=TodoResponse)
def read_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_todo(db, todo_id, current_user.id)


@router.post("/{todo_id}/comments", response_model=CommentResponse)
def add_comment(
    todo_id: int,
    request: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_comment(db, todo_id, request.comment, current_user.id)


@router.delete("/{todo_id}/comments/{comment_id}")
def remove_comment(
    todo_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_comment(db, comment_id, current_user.id)
    return {"success": True}


@router.patch("/{todo_id}/tasks/{task_id}", response_model=TodoResponse)
def patch_task(
    todo_id: int,
    task_id: int,
    request: TaskPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task_completion(
        db, todo_id, task_id, request.completion_flag, current_user.id
    )


@router.delete("/{todo_id}", response_model=TodoResponse)
def remove_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_todo(db, todo_id, current_user.id)


@router.put("/{todo_id}/comments/{comment_id}", response_model=CommentResponse)
def modify_comment(
    todo_id: int,
    comment_id: int,
    request: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_comment(db, comment_id, request.comment, current_user.id)

