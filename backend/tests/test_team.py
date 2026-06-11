import models

def test_team_crud_and_search(client_with_auth, test_user):
    # 1. チームを作成
    payload = {
        "display_teams_id": "new_team",
        "name": "New Team Name",
        "password": "teampassword"
    }
    create_res = client_with_auth.post("/api/team", json=payload)
    assert create_res.status_code == 201
    created_team = create_res.json()
    team_id = created_team["id"]
    display_teams_id = created_team["display_teams_id"]
    assert created_team["name"] == "New Team Name"

    # 2. チーム詳細を取得
    detail_res = client_with_auth.get(f"/api/team/{team_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["display_teams_id"] == display_teams_id

    # 3. チームを検索
    search_res = client_with_auth.get(f"/api/team/search?display_teams_id={display_teams_id}")
    assert search_res.status_code == 200
    assert search_res.json()["id"] == team_id

    # 4. チームを更新
    update_payload = {
        "name": "Updated Team Name",
        "password": "newteampassword"
    }
    update_res = client_with_auth.put(f"/api/team/{team_id}", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Team Name"

    # 5. 参加申請受付フラグをパッチ更新
    patch_payload = {"accepting_applications": False}
    patch_res = client_with_auth.patch(f"/api/team/{team_id}/accepting-applications", json=patch_payload)
    assert patch_res.status_code == 200
    
    # 6. チームを削除
    delete_res = client_with_auth.delete(f"/api/team/{team_id}")
    assert delete_res.status_code == 200


def test_team_join_workflow(client_with_auth, test_user, db):
    # 別のユーザー（Owner）によって作成されたチームをセットアップ
    owner = models.User(
        display_user_id="owneru",
        password="ownerpassword",
        user_name="Owner User",
        delete_flag=False
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    from auth import encrypt_password

    team = models.Team(
        created_user_id=owner.id,
        display_teams_id="other_team",
        name="Other Team",
        password=encrypt_password("otherteampassword"),
        accepting_applications=True
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    # 1. チームに参加申請
    apply_payload = {"password": "otherteampassword"}
    apply_res = client_with_auth.post(f"/api/team/{team.id}/apply", json=apply_payload)
    assert apply_res.status_code == 200

    # 2. 申請中チーム一覧を取得
    applying_res = client_with_auth.get("/api/team/applying")
    assert applying_res.status_code == 200
    assert any(t["id"] == team.id for t in applying_res.json())

    # 3. 申請をキャンセル
    cancel_res = client_with_auth.delete(f"/api/team/{team.id}/apply")
    assert cancel_res.status_code == 200

    # 申請中一覧から消えていることを確認
    applying_after_res = client_with_auth.get("/api/team/applying")
    assert not any(t["id"] == team.id for t in applying_after_res.json())

    # 4. 承認ワークフローのテストのため再度申請
    client_with_auth.post(f"/api/team/{team.id}/apply", json=apply_payload)

    # 申請を承認するためOwnerにIDを切り替え
    from dependencies.auth import get_current_user
    from main import app
    
    app.dependency_overrides[get_current_user] = lambda: owner

    # 申請者一覧を取得 (Ownerとして)
    applicants_res = client_with_auth.get(f"/api/team/{team.id}/applicants")
    assert applicants_res.status_code == 200
    assert any(a["id"] == test_user.id for a in applicants_res.json())

    # 申請を承認 (Ownerとして)
    approve_res = client_with_auth.post(f"/api/team/{team.id}/applicants/{test_user.id}/approve")
    assert approve_res.status_code == 200

    # テストユーザーにIDを戻す
    app.dependency_overrides[get_current_user] = lambda: test_user

    # 加入済みチーム一覧を検証
    joined_res = client_with_auth.get("/api/team/joined")
    assert joined_res.status_code == 200
    assert any(t["id"] == team.id for t in joined_res.json())

    # チームメンバー一覧を取得
    members_res = client_with_auth.get(f"/api/team/{team.id}/members")
    assert members_res.status_code == 200
    assert any(m["id"] == test_user.id for m in members_res.json())

    # 5. メンバーをキックアウト (Ownerとして)
    app.dependency_overrides[get_current_user] = lambda: owner
    kick_res = client_with_auth.delete(f"/api/team/{team.id}/members/{test_user.id}")
    assert kick_res.status_code == 200

    # テストユーザーにIDを戻す
    app.dependency_overrides[get_current_user] = lambda: test_user

    # 加入済み一覧から消えていることを確認
    joined_after_res = client_with_auth.get("/api/team/joined")
    assert not any(t["id"] == team.id for t in joined_after_res.json())
