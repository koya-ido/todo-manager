import models

def test_my_tags_crud(client_with_auth):
    # 1. 個人タグを作成
    payload = {"name": "Personal Tag"}
    create_res = client_with_auth.post("/api/tags/me", json=payload)
    assert create_res.status_code == 200
    tag_id = create_res.json()["id"]
    assert create_res.json()["name"] == "Personal Tag"

    # 2. 個人タグ一覧を取得
    list_res = client_with_auth.get("/api/tags/me")
    assert list_res.status_code == 200
    assert any(tag["id"] == tag_id for tag in list_res.json())

    # 3. 個人タグを更新
    update_payload = {"name": "Updated Tag"}
    update_res = client_with_auth.put(f"/api/tags/me/{tag_id}", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Tag"

    # 4. 個人タグを削除
    delete_res = client_with_auth.delete(f"/api/tags/me/{tag_id}")
    assert delete_res.status_code == 200
    
    # 削除されたタグが存在しないことを確認
    list_after_res = client_with_auth.get("/api/tags/me")
    # 一覧取得APIで除外されるか、削除フラグが立っていることを確認
    assert not any(tag["id"] == tag_id and not tag["delete_flag"] for tag in list_after_res.json())


def test_team_tags_crud(client_with_auth, test_user, db):
    # チームタグの管理権限を得るためにチームをセットアップして加入
    team = models.Team(
        created_user_id=test_user.id,
        display_teams_id="team_tag",
        name="Team Tag",
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

    # 1. チームタグを作成
    payload = {"name": "Team Tag A"}
    create_res = client_with_auth.post(f"/api/tags/team/{team.id}", json=payload)
    assert create_res.status_code == 200
    tag_id = create_res.json()["id"]
    assert create_res.json()["name"] == "Team Tag A"

    # 2. チームタグ一覧を取得
    list_res = client_with_auth.get(f"/api/tags/team/{team.id}")
    assert list_res.status_code == 200
    assert any(tag["id"] == tag_id for tag in list_res.json())

    # 3. チームタグを更新
    update_payload = {"name": "Updated Team Tag"}
    update_res = client_with_auth.put(f"/api/tags/team/{team.id}/{tag_id}", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Team Tag"

    # 4. チームタグを削除
    delete_res = client_with_auth.delete(f"/api/tags/team/{team.id}/{tag_id}")
    assert delete_res.status_code == 200
