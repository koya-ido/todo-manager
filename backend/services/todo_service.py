from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from exceptions import APIException
from models import Comment, Priority, Status, Task, Team, TeamUser, Todo, User, TodoTag
from schemas import TaskCreate, TodoCreate, TodoUpdate


def validate_todo_name(name: str) -> str:
    if not name.strip():
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="TODO名を入力してください",
            code="TODO_NAME_REQUIRED",
        )

    return name.strip()


def validate_task_title(title: str) -> str:
    if not title.strip():
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="タスク名を入力してください",
            code="TASK_TITLE_REQUIRED",
        )

    return title.strip()


def validate_tasks(tasks: list[TaskCreate]) -> list[TaskCreate]:
    if len(tasks) == 0:
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="TODOには1件以上のタスクが必要です",
            code="TODO_TASK_REQUIRED",
        )

    for task in tasks:
        task.title = validate_task_title(task.title)

    return tasks


def create_task_models(tasks: list[TaskCreate]) -> list[Task]:
    return [
        Task(
            position=index,
            title=task.title,
            content=task.content,
            completion_flag=task.completion_flag,
        )
        for index, task in enumerate(tasks, start=1)
    ]


def validate_priority(db: Session, priority_id: int) -> None:
    priority_exists = db.query(Priority.id).filter(Priority.id == priority_id).first()
    if not priority_exists:
        raise APIException(
            status_code=404,
            title="登録エラー",
            detail="指定された優先度が存在しません",
            code="PRIORITY_NOT_FOUND",
        )


def validate_status(db: Session, status_id: int) -> None:
    status_exists = db.query(Status.id).filter(Status.id == status_id).first()
    if not status_exists:
        raise APIException(
            status_code=404,
            title="登録エラー",
            detail="指定されたステータスが存在しません",
            code="STATUS_NOT_FOUND",
        )


def validate_active_user(db: Session, user_id: int) -> None:
    user_exists = db.query(User.id).filter(
        User.id == user_id,
        User.delete_flag.is_(False),
    ).first()
    if not user_exists:
        raise APIException(
            status_code=404,
            title="登録エラー",
            detail="指定された担当者が存在しません",
            code="MANAGER_NOT_FOUND",
        )


def get_member_team_ids(db: Session, user_id: int) -> list[int]:
    return [
        team_id
        for (team_id,) in db.query(TeamUser.team_id)
        .filter(TeamUser.user_id == user_id)
        .all()
    ]


def validate_team_scope(db: Session, team_id: int | None, current_user_id: int) -> None:
    if team_id is None:
        return

    team_exists = db.query(Team.id).filter(Team.id == team_id).first()
    if not team_exists:
        raise APIException(
            status_code=404,
            title="登録エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    membership_exists = db.query(TeamUser.id).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == current_user_id,
    ).first()
    if not membership_exists:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="指定されたチームのTODOを操作する権限がありません",
            code="TEAM_TODO_FORBIDDEN",
        )


def validate_manager_scope(
    db: Session,
    manager_id: int | None,
    team_id: int | None,
    current_user_id: int,
) -> int:
    if team_id is None:
        return current_user_id

    if manager_id is None:
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="チームTODOの担当者を指定してください",
            code="TEAM_TODO_MANAGER_REQUIRED",
        )

    validate_active_user(db, manager_id)

    manager_is_member = db.query(TeamUser.id).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == manager_id,
    ).first()
    if not manager_is_member:
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="担当者は指定されたチームのメンバーである必要があります",
            code="TEAM_TODO_MANAGER_REQUIRED",
        )

    return manager_id


def accessible_todo_query(db: Session, current_user_id: int, delete_flag: bool = False):
    member_team_ids = get_member_team_ids(db, current_user_id)

    private_condition = and_(
        Todo.team_id.is_(None),
        or_(
            Todo.manager_id == current_user_id,
            Todo.created_by == current_user_id,
            Todo.updated_by == current_user_id,
        ),
    )

    query = db.query(Todo).filter(Todo.delete_flag.is_(delete_flag))
    if member_team_ids:
        return query.filter(
            or_(
                private_condition,
                Todo.team_id.in_(member_team_ids),
            )
        )

    return query.filter(private_condition)


def get_todos(
    db: Session,
    current_user_id: int,
    mode: str | None = None,
    is_delete_only: bool = False,
    keyword: str | None = None,
    status_ids: list[int] | None = None,
    priority_ids: list[int] | None = None,
    manager_id: int | None = None,
    team_id: int | None = None,
    sort: str | None = None,
    offset: int | None = None,
    limit: int | None = None,
) -> tuple[list[Todo], int]:
    query = accessible_todo_query(db, current_user_id, delete_flag=is_delete_only)

    if mode == "team":
        query = query.filter(Todo.team_id.isnot(None))
    elif mode == "private":
        query = query.filter(Todo.team_id.is_(None))

    if keyword:
        keyword = keyword.strip()
        if keyword:
            query = query.filter(
                or_(
                    Todo.name.ilike(f"%{keyword}%"),
                    Todo.remarks.ilike(f"%{keyword}%"),
                    Todo.tasks.any(Task.title.ilike(f"%{keyword}%")),
                    Todo.tasks.any(Task.content.ilike(f"%{keyword}%")),
                    Todo.comments.any(Comment.comment.ilike(f"%{keyword}%")),
                )
            )

    if status_ids:
        query = query.filter(Todo.status_id.in_(status_ids))

    if priority_ids:
        query = query.filter(Todo.priority_id.in_(priority_ids))

    if manager_id is not None:
        query = query.filter(Todo.manager_id == manager_id)

    if team_id is not None:
        query = query.filter(Todo.team_id == team_id)

    total = query.count()

    order_clauses = []
    if sort == "create-date-desc":
        order_clauses.append(Todo.created_at.desc())
    elif sort == "create-date-asc":
        order_clauses.append(Todo.created_at.asc())
    elif sort == "end-date-desc":
        order_clauses.append(Todo.due_date.desc())
    elif sort == "end-date-asc":
        order_clauses.append(Todo.due_date.asc())
    elif sort == "start-date-desc":
        order_clauses.append(Todo.created_at.desc())
    elif sort == "start-date-asc":
        order_clauses.append(Todo.created_at.asc())

    order_clauses.append(Todo.id)
    query = query.order_by(*order_clauses)

    if offset is not None:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    return query.all(), total


def get_todo(db: Session, todo_id: int, current_user_id: int) -> Todo:
    todo = accessible_todo_query(db, current_user_id).filter(Todo.id == todo_id).first()
    if not todo:
        raise APIException(
            status_code=404,
            title="取得エラー",
            detail="指定されたTODOが存在しません",
            code="TODO_NOT_FOUND",
        )

    return todo


def create_todo(db: Session, request: TodoCreate, current_user_id: int) -> Todo:
    todo_name = validate_todo_name(request.name)
    tasks = validate_tasks(request.tasks)
    validate_priority(db, request.priority_id)
    validate_status(db, request.status_id)
    validate_team_scope(db, request.team_id, current_user_id)
    manager_id = validate_manager_scope(
        db,
        request.manager_id,
        request.team_id,
        current_user_id,
    )

    todo = Todo(
        priority_id=request.priority_id,
        status_id=request.status_id,
        team_id=request.team_id,
        manager_id=manager_id,
        created_by=current_user_id,
        updated_by=current_user_id,
        name=todo_name,
        due_date=request.due_date,
        remarks=request.remarks,
        delete_flag=request.delete_flag,
        tasks=create_task_models(tasks),
        todo_tags=[TodoTag(tag_id=tag_id) for tag_id in request.tag_ids] if request.tag_ids else [],
    )
    db.add(todo)
    
    print("DEBUG: Adding TODO to session:", todo)  # デバッグ用ログ

    try:
        db.commit()
        db.refresh(todo)
        return todo
    except IntegrityError:
        db.rollback()
        print("DEBUG: Failed to add TODO to session:", todo)  # デバッグ用ログ
        raise APIException(
            status_code=409,
            title="登録エラー",
            detail="TODOの登録に失敗しました",
            code="TODO_CREATE_FAILED",
        )


def update_todo(
    db: Session,
    todo_id: int,
    request: TodoUpdate,
    current_user_id: int,
) -> Todo:
    todo = get_todo(db, todo_id, current_user_id)
    update_data = request.model_dump(exclude_unset=True)
    task_requests = update_data.pop("tasks", None)
    tasks = None
    tag_ids = update_data.pop("tag_ids", None)

    new_team_id = update_data.get("team_id", todo.team_id)
    validate_team_scope(db, new_team_id, current_user_id)

    if "priority_id" in update_data:
        validate_priority(db, update_data["priority_id"])
    if "status_id" in update_data:
        validate_status(db, update_data["status_id"])

    manager_id = validate_manager_scope(
        db,
        update_data.get("manager_id", todo.manager_id),
        new_team_id,
        current_user_id,
    )
    update_data["manager_id"] = manager_id

    if "name" in update_data and update_data["name"] is not None:
        update_data["name"] = validate_todo_name(update_data["name"])

    if task_requests is not None:
        tasks = validate_tasks([TaskCreate(**task) for task in task_requests])
    elif len(todo.tasks) == 0:
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="TODOには1件以上のタスクが必要です",
            code="TODO_TASK_REQUIRED",
        )

    for field, value in update_data.items():
        setattr(todo, field, value)
    todo.updated_by = current_user_id

    if tasks is not None:
        todo.tasks.clear()
        db.flush()
        todo.tasks.extend(create_task_models(tasks))

    if tag_ids is not None:
        todo.todo_tags.clear()
        db.flush()
        todo.todo_tags.extend([TodoTag(tag_id=tag_id) for tag_id in tag_ids])

    try:
        db.commit()
        db.refresh(todo)
        return todo
    except IntegrityError:
        db.rollback()
        raise APIException(
            status_code=409,
            title="更新エラー",
            detail="TODOの更新に失敗しました",
            code="TODO_UPDATE_FAILED",
        )


def create_comment(db: Session, todo_id: int, comment_text: str, user_id: int) -> Comment:
    # Verify todo accessibility
    get_todo(db, todo_id, user_id)

    if not comment_text.strip():
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="コメントを入力してください",
            code="COMMENT_REQUIRED",
        )

    if len(comment_text) > 800:
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="コメントは800文字以内で入力してください",
            code="COMMENT_TOO_LONG",
        )

    comment = Comment(
        user_id=user_id,
        todo_id=todo_id,
        comment=comment_text.strip(),
    )
    db.add(comment)
    try:
        db.commit()
        db.refresh(comment)
        return comment
    except Exception:
        db.rollback()
        raise APIException(
            status_code=500,
            title="登録エラー",
            detail="コメントの登録に失敗しました",
            code="COMMENT_CREATE_FAILED",
        )


def delete_comment(db: Session, comment_id: int, user_id: int) -> None:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise APIException(
            status_code=404,
            title="削除エラー",
            detail="指定されたコメントが存在しません",
            code="COMMENT_NOT_FOUND",
        )

    if comment.user_id != user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="このコメントを削除する権限がありません",
            code="COMMENT_DELETE_FORBIDDEN",
        )

    db.delete(comment)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise APIException(
            status_code=500,
            title="削除エラー",
            detail="コメントの削除に失敗しました",
            code="COMMENT_DELETE_FAILED",
        )


def update_task_completion(
    db: Session,
    todo_id: int,
    task_id: int,
    completion_flag: bool,
    user_id: int,
) -> Todo:
    todo = get_todo(db, todo_id, user_id)

    task = db.query(Task).filter(Task.id == task_id, Task.todo_id == todo_id).first()
    if not task:
        raise APIException(
            status_code=404,
            title="更新エラー",
            detail="指定されたタスクが存在しません",
            code="TASK_NOT_FOUND",
        )

    task.completion_flag = completion_flag
    todo.updated_by = user_id

    if all(t.completion_flag for t in todo.tasks):
        todo.status_id = 3

    try:
        db.commit()
        db.refresh(todo)
        return todo
    except Exception:
        db.rollback()
        raise APIException(
            status_code=500,
            title="更新エラー",
            detail="タスクの更新に失敗しました",
            code="TASK_UPDATE_FAILED",
        )


def delete_todo(db: Session, todo_id: int, current_user_id: int) -> Todo:
    todo = get_todo(db, todo_id, current_user_id)
    todo.delete_flag = True
    todo.updated_by = current_user_id
    try:
        db.commit()
        db.refresh(todo)
        return todo
    except Exception:
        db.rollback()
        raise APIException(
            status_code=500,
            title="削除エラー",
            detail="TODOの削除に失敗しました",
            code="TODO_DELETE_FAILED",
        )


def update_comment(
    db: Session,
    comment_id: int,
    comment_text: str,
    user_id: int,
) -> Comment:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise APIException(
            status_code=404,
            title="更新エラー",
            detail="指定されたコメントが存在しません",
            code="COMMENT_NOT_FOUND",
        )

    if comment.user_id != user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="このコメントを編集する権限がありません",
            code="COMMENT_UPDATE_FORBIDDEN",
        )

    if not comment_text.strip():
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="コメントを入力してください",
            code="COMMENT_REQUIRED",
        )

    if len(comment_text) > 800:
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="コメントは800文字以内で入力してください",
            code="COMMENT_TOO_LONG",
        )

    comment.comment = comment_text.strip()
    try:
        db.commit()
        db.refresh(comment)
        return comment
    except Exception:
        db.rollback()
        raise APIException(
            status_code=500,
            title="更新エラー",
            detail="コメントの更新に失敗しました",
            code="COMMENT_UPDATE_FAILED",
        )

