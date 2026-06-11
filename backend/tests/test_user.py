import models

def test_check_username(client_with_auth, test_user):
    # 1. 存在するユーザー名が使用不可であることを検証
    res = client_with_auth.get(f"/api/user/check-username?username={test_user.user_name}")
    assert res.status_code == 200
    assert res.json()["available"] is False

    # 2. 存在しないユーザー名が使用可能であることを検証
    res_avail = client_with_auth.get("/api/user/check-username?username=new_avail_user")
    assert res_avail.status_code == 200
    assert res_avail.json()["available"] is True


def test_update_user_info(client_with_auth, test_user, db):
    # 1. ユーザー情報の更新成功を検証
    payload = {
        "username": "updt_u",
        "password": "newpassword123"
    }
    res = client_with_auth.put("/api/user/me", json=payload)
    assert res.status_code == 200
    assert res.json()["user_name"] == "updt_u"

    # 2. 重複するユーザー名による更新失敗を検証
    # DBに別のユーザーを作成
    other_user = models.User(
        display_user_id="otheru",
        password="otherpassword",
        user_name="othername",
        delete_flag=False,
    )
    db.add(other_user)
    db.commit()

    # 現在のユーザーのユーザー名を「othername」に更新試行
    conflict_payload = {
        "username": "othername",
        "password": "newpassword123"
    }
    res_conflict = client_with_auth.put("/api/user/me", json=conflict_payload)
    assert res_conflict.status_code == 400
    assert res_conflict.json()["code"] == "USERNAME_ALREADY_EXISTS"


def test_delete_user_permissions(client_with_auth, test_user):
    # 1. 他のユーザーを削除しようとすると403 Forbiddenが返ることを検証
    res = client_with_auth.delete("/api/user/other_id")
    assert res.status_code == 403
    assert res.json()["code"] == "FORBIDDEN_USER_DELETION"

    # 2. 自身のアカウント削除（論理削除）が成功することを検証
    res_self = client_with_auth.delete(f"/api/user/{test_user.display_user_id}")
    assert res_self.status_code == 200
    assert res_self.json()["success"] is True


def test_read_team_members(client_with_auth, test_user, db):
    # 1. チームを作成して加入
    team = models.Team(
        created_user_id=test_user.id,
        display_teams_id="team_a",
        name="Team A",
        password="teampassword"
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    team_user = models.TeamUser(
        team_id=team.id,
        user_id=test_user.id
    )
    db.add(team_user)
    db.commit()

    # 2. 特定チームのメンバー一覧を取得
    res = client_with_auth.get(f"/api/user/team/{team.id}/members")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["display_user_id"] == test_user.display_user_id

    # 3. 所属する全チーム of メンバー一覧を取得
    res_all = client_with_auth.get("/api/user/teams/members")
    assert res_all.status_code == 200
    assert len(res_all.json()) == 1
