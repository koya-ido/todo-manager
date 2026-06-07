from sqlalchemy.orm import Session
from sqlalchemy import func

from auth import verify_password
from exceptions import APIException
from models import Team, TeamUser, User, TeamApplication
from schemas import (
    TeamApplicantResponse,
    TeamApplyingResponse,
    TeamJoinedResponse,
    TeamSearchResponse,
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

    # 4. パスワード検証
    if not verify_password(password, team.password):
        raise APIException(
            status_code=400,
            title="認証エラー",
            detail="チームパスワードが正しくありません",
            code="INVALID_TEAM_PASSWORD",
        )

    # 5. 申請を作成
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
