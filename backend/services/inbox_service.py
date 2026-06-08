from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from exceptions import APIException
import models

def generate_due_reminders(db: Session, user_id: int) -> None:
    jst = timezone(timedelta(hours=9))
    now_jst = datetime.now(jst)
    today = now_jst.date()
    tomorrow = (now_jst + timedelta(days=1)).date()
    
    from services.todo_service import accessible_todo_query
    
    # 未完了で期限が今日または明日のTODOを取得
    todos = accessible_todo_query(db, user_id).filter(
        models.Todo.status_id != 3,
        models.Todo.delete_flag.is_(False),
        models.Todo.due_date.in_([today, tomorrow])
    ).all()
    
    for todo in todos:
        is_today = todo.due_date == today
        inbox_type = "todo_today" if is_today else "todo_tomorrow"
        
        # すでに登録済みかチェック
        exists = db.query(models.Inbox).filter(
            models.Inbox.target_user_id == user_id,
            models.Inbox.todo_id == todo.id,
            models.Inbox.type == inbox_type
        ).first()
        
        if not exists:
            new_inbox = models.Inbox(
                target_user_id=user_id,
                todo_id=todo.id,
                type=inbox_type,
                message=todo.name,
                is_read=False
            )
            db.add(new_inbox)
            
    try:
        db.commit()
    except Exception:
        db.rollback()

def get_inboxes(db: Session, user_id: int) -> list[models.Inbox]:
    generate_due_reminders(db, user_id)
    inboxes = db.query(models.Inbox).filter(
        models.Inbox.target_user_id == user_id
    ).order_by(models.Inbox.created_at.desc()).all()
    
    # 取得したお知らせを既読にする
    updated = False
    for inbox in inboxes:
        if not inbox.is_read:
            inbox.is_read = True
            updated = True
            
    if updated:
        try:
            db.commit()
        except Exception:
            db.rollback()
            
    return inboxes

def get_unread_count(db: Session, user_id: int) -> int:
    generate_due_reminders(db, user_id)
    return db.query(models.Inbox).filter(
        models.Inbox.target_user_id == user_id,
        models.Inbox.is_read.is_(False)
    ).count()


def delete_inbox(db: Session, inbox_id: int, user_id: int) -> None:
    inbox = db.query(models.Inbox).filter(models.Inbox.id == inbox_id).first()
    if not inbox:
        raise APIException(
            status_code=404,
            title="削除エラー",
            detail="指定されたお知らせが存在しません",
            code="INBOX_NOT_FOUND",
        )
    if inbox.target_user_id != user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="このお知らせを削除する権限がありません",
            code="INBOX_DELETE_FORBIDDEN",
        )
    db.delete(inbox)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise APIException(
            status_code=500,
            title="削除エラー",
            detail="お知らせの削除に失敗しました",
            code="INBOX_DELETE_FAILED",
        )
