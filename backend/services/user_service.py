import json
import secrets
import string
from datetime import datetime, timezone, timedelta

from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth import get_password_hash
from exceptions import APIException
from models import Comment, Inbox, RevokedToken, Tag, Team, TeamUser, Todo, User
from schemas import DeleteUserResponse, SignupResponse

DISPLAY_ID_CHARS = string.ascii_letters + string.digits
DISPLAY_ID_LENGTH = 6
DISPLAY_ID_MAX_RETRIES = 10


def generate_display_id(db: Session) -> str:
    for _ in range(DISPLAY_ID_MAX_RETRIES):
        display_id = "".join(
            secrets.choice(DISPLAY_ID_CHARS) for _ in range(DISPLAY_ID_LENGTH)
        )
        exists = db.query(User.id).filter(User.display_user_id == display_id).first()
        if not exists:
            return display_id

    raise APIException(
        status_code=500,
        title="サーバーエラー",
        detail="表示IDの採番に失敗しました",
        code="DISPLAY_ID_GENERATION_FAILED",
    )


def create_user(db: Session, username: str, password: str) -> SignupResponse:
    for _ in range(DISPLAY_ID_MAX_RETRIES):
        user = User(
            display_user_id=generate_display_id(db),
            user_name=username,
            password=get_password_hash(password),
        )
        db.add(user)

        try:
            db.commit()
            db.refresh(user)
            return SignupResponse(
                id=user.id,
                display_id=user.display_user_id,
                username=user.user_name,
            )
        except IntegrityError:
            db.rollback()

    raise APIException(
        status_code=500,
        title="サーバーエラー",
        detail="ユーザー登録に失敗しました",
        code="USER_REGISTRATION_FAILED",
    )


def delete_private_data_for_user(db: Session, user: User) -> None:
    private_todos = db.query(Todo).filter(
        Todo.team_id.is_(None),
        or_(
            Todo.manager_id == user.id,
            Todo.created_by == user.id,
            Todo.updated_by == user.id,
        ),
    ).all()
    for todo in private_todos:
        db.delete(todo)

    private_comments = db.query(Comment).join(Todo, Comment.todo_id == Todo.id).filter(
        Comment.user_id == user.id,
        Todo.team_id.is_(None),
    ).all()
    for comment in private_comments:
        db.delete(comment)

    db.query(Tag).filter(Tag.user_id == user.id).delete(synchronize_session=False)
    db.query(Inbox).filter(Inbox.target_user_id == user.id).delete(synchronize_session=False)
    db.query(RevokedToken).filter(RevokedToken.subject == user.display_user_id).delete(
        synchronize_session=False
    )


def cleanup_empty_teams(db: Session, team_ids: list[int]) -> None:
    for team_id in team_ids:
        member_exists = db.query(TeamUser.id).filter(TeamUser.team_id == team_id).first()
        if member_exists:
            continue

        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            continue

        team_todos = db.query(Todo).filter(Todo.team_id == team.id).all()
        for todo in team_todos:
            db.delete(todo)

        db.query(Tag).filter(Tag.team_id == team.id).delete(synchronize_session=False)
        db.delete(team)


def has_shared_data(db: Session, user: User) -> bool:
    if db.query(Team.id).filter(Team.created_user_id == user.id).first():
        return True

    if db.query(Todo.id).filter(
        Todo.team_id.is_not(None),
        or_(
            Todo.manager_id == user.id,
            Todo.created_by == user.id,
            Todo.updated_by == user.id,
        ),
    ).first():
        return True

    if db.query(Comment.id).join(Todo, Comment.todo_id == Todo.id).filter(
        Comment.user_id == user.id,
        Todo.team_id.is_not(None),
    ).first():
        return True

    return False


def finalize_user_deletion(db: Session, user: User) -> str:
    if has_shared_data(db, user):
        user.delete_flag = True
        user.deleted_at = datetime.now(timezone.utc)
        db.flush()
        return "logical"

    db.delete(user)
    db.flush()
    return "physical"


def delete_user_by_display_id(db: Session, display_user_id: str) -> DeleteUserResponse:
    user = db.query(User).filter(User.display_user_id == display_user_id).first()
    if not user:
        raise APIException(
            status_code=404,
            title="ユーザーが見つかりません",
            detail="指定されたユーザーは存在しません",
            code="USER_NOT_FOUND",
        )

    team_ids = [
        team_id
        for (team_id,) in db.query(TeamUser.team_id).filter(TeamUser.user_id == user.id).all()
    ]

    delete_private_data_for_user(db, user)

    # 自身が所属しているチームからメンバーが脱退したときのお知らせ
    teams_joined = db.query(TeamUser).filter(TeamUser.user_id == user.id).all()
    for tj in teams_joined:
        team = tj.team
        if not team:
            continue
        # 他の所属メンバーを取得
        other_members = db.query(TeamUser).filter(
            TeamUser.team_id == team.id,
            TeamUser.user_id != user.id
        ).all()
        
        msg_data = {
            "left_user_name": user.user_name,
            "left_user_display_id": user.display_user_id,
            "left_at": datetime.now(timezone(timedelta(hours=9))).isoformat(),
            "team_name": team.name,
            "team_display_id": team.display_teams_id,
            "team_id": team.id
        }
        
        for om in other_members:
            inbox = Inbox(
                target_user_id=om.user_id,
                type="team_member_left",
                message=json.dumps(msg_data, ensure_ascii=False),
                is_read=False
            )
            db.add(inbox)

    db.query(TeamUser).filter(TeamUser.user_id == user.id).delete(synchronize_session=False)
    cleanup_empty_teams(db, team_ids)
    deletion_mode = finalize_user_deletion(db, user)
    db.commit()

    return DeleteUserResponse(display_id=display_user_id, deletion_mode=deletion_mode)


def get_team_members(db: Session, team_id: int, current_user_id: int) -> list[User]:
    # 1. チームの存在確認
    team_exists = db.query(Team.id).filter(Team.id == team_id).first()
    if not team_exists:
        raise APIException(
            status_code=404,
            title="取得エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    # 2. 権限確認 (現在のユーザーがメンバーか)
    membership_exists = db.query(TeamUser.id).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == current_user_id,
    ).first()
    if not membership_exists:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="指定されたチームの情報を操作・閲覧する権限がありません",
            code="TEAM_FORBIDDEN",
        )

    # 3. メンバー一覧の取得
    members = (
        db.query(User)
        .join(TeamUser, User.id == TeamUser.user_id)
        .filter(TeamUser.team_id == team_id, User.delete_flag.is_(False))
        .all()
    )
    return members


def get_all_teams_members(db: Session, current_user_id: int) -> list[User]:
    team_ids = [
        team_id
        for (team_id,) in db.query(TeamUser.team_id)
        .filter(TeamUser.user_id == current_user_id)
        .all()
    ]
    if not team_ids:
        return db.query(User).filter(User.id == current_user_id, User.delete_flag.is_(False)).all()

    members = (
        db.query(User)
        .join(TeamUser, User.id == TeamUser.user_id)
        .filter(TeamUser.team_id.in_(team_ids), User.delete_flag.is_(False))
        .distinct()
        .all()
    )
    return members

