import secrets
import string
from sqlalchemy.orm import Session
from sqlalchemy import func

from auth import verify_password, get_password_hash
from exceptions import APIException
from models import Team, TeamUser, User, TeamApplication, Todo, Tag
from schemas import (
    TeamApplicantResponse,
    TeamApplyingResponse,
    TeamJoinedResponse,
    TeamSearchResponse,
    TeamDetailResponse,
    TeamCreate,
    TeamUpdate,
)


def search_team_by_display_id(db: Session, display_teams_id: str, current_user_id: int) -> TeamSearchResponse:
    # 1. チームを検索
    team = db.query(Team).filter(Team.display_teams_id == display_teams_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="取得エラー",
            detail="指定された表示IDのチームは存在しません",
            code="TEAM_NOT_FOUND",
        )

    # 2. 所属状態および申請中状態を確認
    is_member = db.query(TeamUser.id).filter(
        TeamUser.team_id == team.id,
        TeamUser.user_id == current_user_id,
    ).first() is not None

    is_applying = db.query(TeamApplication.id).filter(
        TeamApplication.team_id == team.id,
        TeamApplication.user_id == current_user_id,
    ).first() is not None

    # 3. 作成者(管理者)の情報を取得
    owner = db.query(User).filter(User.id == team.created_user_id).first()
    owner_name = owner.user_name if owner else "Unknown"
    owner_display_id = owner.display_user_id if owner else "------"

    return TeamSearchResponse(
        id=team.id,
        display_teams_id=team.display_teams_id,
        name=team.name,
        created_user_name=owner_name,
        created_user_display_id=owner_display_id,
        is_member=is_member,
        is_applying=is_applying,
        accepting_applications=team.accepting_applications,
    )


def get_joined_teams(db: Session, user_id: int) -> list[TeamJoinedResponse]:
    # ユーザーが所属しているすべてのチームを取得
    team_users = db.query(TeamUser).filter(TeamUser.user_id == user_id).all()
    results = []

    for tu in team_users:
        team = tu.team
        if not team:
            continue

        # メンバー数のカウント
        member_count = db.query(func.count(TeamUser.id)).filter(TeamUser.team_id == team.id).scalar() or 0

        # 管理者(作成者)の情報
        owner = db.query(User).filter(User.id == team.created_user_id).first()
        owner_name = owner.user_name if owner else "Unknown"
        owner_display_id = owner.display_user_id if owner else "------"

        is_owner = team.created_user_id == user_id

        results.append(
            TeamJoinedResponse(
                id=team.id,
                display_teams_id=team.display_teams_id,
                name=team.name,
                created_user_id=team.created_user_id,
                created_user_name=owner_name,
                created_user_display_id=owner_display_id,
                member_count=member_count,
                is_owner=is_owner,
            )
        )

    return results


def get_applying_teams(db: Session, user_id: int) -> list[TeamApplyingResponse]:
    # ユーザーが申請中のすべてのチームを取得
    applications = db.query(TeamApplication).filter(TeamApplication.user_id == user_id).all()
    results = []

    for app in applications:
        team = app.team
        if not team:
            continue

        # 管理者(作成者)の情報
        owner = db.query(User).filter(User.id == team.created_user_id).first()
        owner_name = owner.user_name if owner else "Unknown"
        owner_display_id = owner.display_user_id if owner else "------"

        results.append(
            TeamApplyingResponse(
                id=team.id,
                display_teams_id=team.display_teams_id,
                name=team.name,
                created_user_name=owner_name,
                created_user_display_id=owner_display_id,
                applied_at=app.created_at,
            )
        )

    return results


def apply_to_team(db: Session, team_id: int, user_id: int, password: str) -> None:
    # 1. チームの存在確認
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="申請エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    # 2. すでに所属していないか確認
    is_member = db.query(TeamUser.id).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == user_id,
    ).first() is not None
    if is_member:
        raise APIException(
            status_code=400,
            title="申請エラー",
            detail="すでにこのチームのメンバーです",
            code="ALREADY_MEMBER",
        )

    # 3. すでに申請中でないか確認
    is_applying = db.query(TeamApplication.id).filter(
        TeamApplication.team_id == team_id,
        TeamApplication.user_id == user_id,
    ).first() is not None
    if is_applying:
        raise APIException(
            status_code=400,
            title="申請エラー",
            detail="すでにこのチームに申請中です",
            code="ALREADY_APPLYING",
        )

    # 4. 申請受付状態の確認
    if not team.accepting_applications:
        raise APIException(
            status_code=400,
            title="申請エラー",
            detail="このチームは現在申請を受け付けていません",
            code="TEAM_NOT_ACCEPTING_APPLICATIONS",
        )

    # 5. パスワード検証
    if not verify_password(password, team.password):
        raise APIException(
            status_code=400,
            title="認証エラー",
            detail="チームパスワードが正しくありません",
            code="INVALID_TEAM_PASSWORD",
        )

    # 6. 申請を作成
    app = TeamApplication(team_id=team_id, user_id=user_id)
    db.add(app)
    db.commit()


def cancel_application(db: Session, team_id: int, user_id: int) -> None:
    app = db.query(TeamApplication).filter(
        TeamApplication.team_id == team_id,
        TeamApplication.user_id == user_id,
    ).first()
    if not app:
        raise APIException(
            status_code=404,
            title="取消エラー",
            detail="申請データが見つかりません",
            code="APPLICATION_NOT_FOUND",
        )

    db.delete(app)
    db.commit()


def get_applicants(db: Session, team_id: int, current_user_id: int) -> list[TeamApplicantResponse]:
    # 1. チームの存在と権限確認
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="取得エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    if team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="チーム管理者のみが申請者一覧を閲覧できます",
            code="TEAM_FORBIDDEN",
        )

    # 2. 申請中のユーザーを取得
    apps = db.query(TeamApplication).filter(TeamApplication.team_id == team_id).all()
    results = []

    for app in apps:
        u = app.user
        if not u or u.delete_flag:
            continue

        results.append(
            TeamApplicantResponse(
                id=u.id,
                display_user_id=u.display_user_id,
                user_name=u.user_name,
                applied_at=app.created_at,
            )
        )

    return results


def approve_applicant(db: Session, team_id: int, user_id: int, current_user_id: int) -> None:
    # 1. チームの存在と権限確認
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="承認エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    if team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="チーム管理者のみが申請を承認できます",
            code="TEAM_FORBIDDEN",
        )

    # 2. 申請の存在確認
    app = db.query(TeamApplication).filter(
        TeamApplication.team_id == team_id,
        TeamApplication.user_id == user_id,
    ).first()
    if not app:
        raise APIException(
            status_code=404,
            title="承認エラー",
            detail="申請が見つかりませんでした",
            code="APPLICATION_NOT_FOUND",
        )

    # 3. メンバーとして追加
    # すでにメンバーになっているか念のためチェック
    existing_member = db.query(TeamUser.id).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == user_id,
    ).first() is not None

    if not existing_member:
        new_member = TeamUser(team_id=team_id, user_id=user_id)
        db.add(new_member)

    # 4. 申請を削除
    db.delete(app)
    db.commit()


def reject_applicant(db: Session, team_id: int, user_id: int, current_user_id: int) -> None:
    # 1. チームの存在と権限確認
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="却下エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    if team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="チーム管理者のみが申請を却下できます",
            code="TEAM_FORBIDDEN",
        )

    # 2. 申請の存在確認
    app = db.query(TeamApplication).filter(
        TeamApplication.team_id == team_id,
        TeamApplication.user_id == user_id,
    ).first()
    if not app:
        raise APIException(
            status_code=404,
            title="却下エラー",
            detail="申請が見つかりませんでした",
            code="APPLICATION_NOT_FOUND",
        )

    # 3. 申請を削除
    db.delete(app)
    db.commit()


def get_team_details(db: Session, team_id: int, current_user_id: int) -> TeamDetailResponse:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="取得エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    # メンバーであるか、あるいは管理者(作成者)であるか確認
    is_member = db.query(TeamUser.id).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == current_user_id,
    ).first() is not None

    if not is_member and team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="指定されたチームの情報を閲覧する権限がありません",
            code="TEAM_FORBIDDEN",
        )

    owner = db.query(User).filter(User.id == team.created_user_id).first()
    owner_name = owner.user_name if owner else "Unknown"
    owner_display_id = owner.display_user_id if owner else "------"
    is_owner = team.created_user_id == current_user_id

    return TeamDetailResponse(
        id=team.id,
        display_teams_id=team.display_teams_id,
        name=team.name,
        created_user_id=team.created_user_id,
        created_user_name=owner_name,
        created_user_display_id=owner_display_id,
        is_owner=is_owner,
        accepting_applications=team.accepting_applications,
    )


def update_accepting_applications(db: Session, team_id: int, accepting: bool, current_user_id: int) -> None:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="更新エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    if team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="チーム管理者のみが申請受付状態を更新できます",
            code="TEAM_FORBIDDEN",
        )

    team.accepting_applications = accepting
    db.commit()


def delete_team(db: Session, team_id: int, current_user_id: int) -> None:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="削除エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    if team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="チーム管理者のみがチームを削除できます",
            code="TEAM_FORBIDDEN",
        )

    # 1. チームに紐づくすべてのTODOを削除 (タスク、コメント、インボックス通知などもカスケード削除される)
    todos = db.query(Todo).filter(Todo.team_id == team.id).all()
    for todo in todos:
        db.delete(todo)

    # 2. チームのタグを削除
    db.query(Tag).filter(Tag.team_id == team.id).delete(synchronize_session=False)

    # 3. チーム自体を削除
    db.delete(team)
    db.commit()


def kick_member(db: Session, team_id: int, member_user_id: int, current_user_id: int) -> None:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="退場エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    if team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="チーム管理者のみがメンバーを退場させることができます",
            code="TEAM_FORBIDDEN",
        )

    if member_user_id == current_user_id:
        raise APIException(
            status_code=400,
            title="退場エラー",
            detail="管理者は強制退場できません",
            code="CANNOT_KICK_OWNER",
        )

    tu = db.query(TeamUser).filter(
        TeamUser.team_id == team_id,
        TeamUser.user_id == member_user_id,
    ).first()

    if not tu:
        raise APIException(
            status_code=404,
            title="退場エラー",
            detail="指定されたユーザーはチームメンバーではありません",
            code="MEMBER_NOT_FOUND",
        )

    db.delete(tu)
    db.commit()


DISPLAY_TEAMS_ID_CHARS = string.ascii_letters + string.digits
DISPLAY_TEAMS_ID_LENGTH = 6
DISPLAY_TEAMS_ID_MAX_RETRIES = 10


def generate_display_teams_id(db: Session) -> str:
    for _ in range(DISPLAY_TEAMS_ID_MAX_RETRIES):
        display_id = "".join(
            secrets.choice(DISPLAY_TEAMS_ID_CHARS) for _ in range(DISPLAY_TEAMS_ID_LENGTH)
        )
        exists = db.query(Team.id).filter(Team.display_teams_id == display_id).first() is not None
        if not exists:
            return display_id

    raise APIException(
        status_code=500,
        title="サーバーエラー",
        detail="チームIDの採番に失敗しました",
        code="DISPLAY_ID_GENERATION_FAILED",
    )


def create_team(db: Session, team_in: TeamCreate, creator_id: int) -> TeamDetailResponse:
    display_teams_id = generate_display_teams_id(db)

    # チームの作成
    team = Team(
        created_user_id=creator_id,
        display_teams_id=display_teams_id,
        name=team_in.name,
        password=get_password_hash(team_in.password),
    )
    db.add(team)
    db.flush()

    # 作成者をチームのメンバーに自動追加
    team_user = TeamUser(
        team_id=team.id,
        user_id=creator_id,
    )
    db.add(team_user)
    db.commit()
    db.refresh(team)

    owner = db.query(User).filter(User.id == creator_id).first()
    owner_name = owner.user_name if owner else "Unknown"
    owner_display_id = owner.display_user_id if owner else "------"

    return TeamDetailResponse(
        id=team.id,
        display_teams_id=team.display_teams_id,
        name=team.name,
        created_user_id=creator_id,
        created_user_name=owner_name,
        created_user_display_id=owner_display_id,
        is_owner=True,
        accepting_applications=team.accepting_applications,
    )


def update_team(db: Session, team_id: int, team_in: TeamUpdate, current_user_id: int) -> TeamDetailResponse:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise APIException(
            status_code=404,
            title="更新エラー",
            detail="指定されたチームが存在しません",
            code="TEAM_NOT_FOUND",
        )

    if team.created_user_id != current_user_id:
        raise APIException(
            status_code=403,
            title="権限エラー",
            detail="チーム管理者のみがチーム情報を更新できます",
            code="TEAM_FORBIDDEN",
        )

    # フィールドの更新
    team.name = team_in.name
    if team_in.password:
        team.password = get_password_hash(team_in.password)

    db.commit()
    db.refresh(team)

    owner = db.query(User).filter(User.id == team.created_user_id).first()
    owner_name = owner.user_name if owner else "Unknown"
    owner_display_id = owner.display_user_id if owner else "------"

    return TeamDetailResponse(
        id=team.id,
        display_teams_id=team.display_teams_id,
        name=team.name,
        created_user_id=team.created_user_id,
        created_user_name=owner_name,
        created_user_display_id=owner_display_id,
        is_owner=True,
        accepting_applications=team.accepting_applications,
    )
