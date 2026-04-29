from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from exceptions import APIException
from models import Tag, Team, TeamUser, User


def validate_tag_name(name: str) -> str:
    if not name.strip():
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="タグ名を入力してください",
            code="TAG_NAME_REQUIRED",
        )

    return name.strip()


def validate_tag_owner(
    db: Session,
    user_id: int | None = None,
    team_id: int | None = None,
) -> None:
    if (user_id is None and team_id is None) or (
        user_id is not None and team_id is not None
    ):
        raise APIException(
            status_code=400,
            title="入力エラー",
            detail="user_id または team_id のどちらか一方を指定してください",
            code="TAG_OWNER_REQUIRED",
        )

    if user_id is not None:
        user_exists = db.query(User.id).filter(User.id == user_id).first()
        if not user_exists:
            raise APIException(
                status_code=404,
                title="登録エラー",
                detail="指定されたユーザーが存在しません",
                code="USER_NOT_FOUND",
            )

    if team_id is not None:
        team_exists = db.query(Team.id).filter(Team.id == team_id).first()
        if not team_exists:
            raise APIException(
                status_code=404,
                title="登録エラー",
                detail="指定されたチームが存在しません",
                code="TEAM_NOT_FOUND",
            )


def validate_team_member(db: Session, team_id: int, user_id: int) -> None:
    team_user_exists = db.query(TeamUser.id).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == user_id,
    ).first()
    if not team_user_exists:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="指定されたチームのタグを操作する権限がありません",
            code="TEAM_TAG_FORBIDDEN",
        )


def get_active_tag(
    db: Session,
    tag_id: int,
    user_id: int | None = None,
    team_id: int | None = None,
) -> Tag:
    validate_tag_owner(db, user_id=user_id, team_id=team_id)

    query = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.delete_flag.is_(False),
    )
    if user_id is not None:
        query = query.filter(Tag.user_id == user_id)
    if team_id is not None:
        query = query.filter(Tag.team_id == team_id)

    tag = query.first()
    if not tag:
        raise APIException(
            status_code=404,
            title="取得エラー",
            detail="指定されたタグが存在しません",
            code="TAG_NOT_FOUND",
        )

    return tag


def get_tags(
    db: Session,
    user_id: int | None = None,
    team_id: int | None = None,
) -> list[Tag]:
    validate_tag_owner(db, user_id=user_id, team_id=team_id)

    query = db.query(Tag).filter(Tag.delete_flag.is_(False))
    if user_id is not None:
        query = query.filter(Tag.user_id == user_id)
    if team_id is not None:
        query = query.filter(Tag.team_id == team_id)

    return query.all()


def get_deleted_tag_by_name(
    db: Session,
    name: str,
    user_id: int | None = None,
    team_id: int | None = None,
) -> Tag | None:
    query = db.query(Tag).filter(
        Tag.name == name,
        Tag.delete_flag.is_(True),
    )
    if user_id is not None:
        query = query.filter(Tag.user_id == user_id)
    if team_id is not None:
        query = query.filter(Tag.team_id == team_id)

    return query.first()


def create_tag(
    db: Session,
    name: str,
    user_id: int | None = None,
    team_id: int | None = None,
) -> Tag:
    tag_name = validate_tag_name(name)
    validate_tag_owner(db, user_id=user_id, team_id=team_id)

    deleted_tag = get_deleted_tag_by_name(
        db,
        tag_name,
        user_id=user_id,
        team_id=team_id,
    )
    if deleted_tag:
        deleted_tag.delete_flag = False
        try:
            db.commit()
            db.refresh(deleted_tag)
            return deleted_tag
        except IntegrityError:
            db.rollback()
            raise APIException(
                status_code=409,
                title="登録エラー",
                detail="同じ名前のタグがすでに存在します",
                code="TAG_ALREADY_EXISTS",
            )

    tag = Tag(
        name=tag_name,
        user_id=user_id,
        team_id=team_id,
    )
    db.add(tag)

    try:
        db.commit()
        db.refresh(tag)
        return tag
    except IntegrityError:
        db.rollback()
        raise APIException(
            status_code=409,
            title="登録エラー",
            detail="同じ名前のタグがすでに存在します",
            code="TAG_ALREADY_EXISTS",
        )


def update_tag(
    db: Session,
    tag_id: int,
    name: str,
    user_id: int | None = None,
    team_id: int | None = None,
) -> Tag:
    tag_name = validate_tag_name(name)
    tag = get_active_tag(db, tag_id, user_id=user_id, team_id=team_id)
    tag.name = tag_name

    try:
        db.commit()
        db.refresh(tag)
        return tag
    except IntegrityError:
        db.rollback()
        raise APIException(
            status_code=409,
            title="更新エラー",
            detail="同じ名前のタグがすでに存在します",
            code="TAG_ALREADY_EXISTS",
        )


def delete_tag(
    db: Session,
    tag_id: int,
    user_id: int | None = None,
    team_id: int | None = None,
) -> Tag:
    tag = get_active_tag(db, tag_id, user_id=user_id, team_id=team_id)
    tag.delete_flag = True

    db.commit()
    db.refresh(tag)
    return tag
