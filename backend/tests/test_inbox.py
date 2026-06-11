import models

def test_inbox_crud(client_with_auth, test_user, db):
    # 1. 未読通知カウントが0から開始されることを確認
    res_unread = client_with_auth.get("/api/inbox/unread")
    assert res_unread.status_code == 200
    assert res_unread.json()["count"] == 0

    # 2. DBにダミーの通知を挿入
    inbox = models.Inbox(
        target_user_id=test_user.id,
        type="test_notification",
        message="Hello World",
        is_read=False
    )
    db.add(inbox)
    db.commit()
    db.refresh(inbox)

    # 3. 未読通知カウントが1になったことを確認
    res_unread_after = client_with_auth.get("/api/inbox/unread")
    assert res_unread_after.json()["count"] == 1

    # 4. 通知一覧を取得
    res_list = client_with_auth.get("/api/inbox")
    assert res_list.status_code == 200
    data = res_list.json()
    assert len(data) == 1
    assert data[0]["message"] == "Hello World"
    assert data[0]["id"] == inbox.id

    # 5. 通知を削除
    res_del = client_with_auth.delete(f"/api/inbox/{inbox.id}")
    assert res_del.status_code == 200

    # 未読通知カウントが0に戻ったことを確認
    res_unread_final = client_with_auth.get("/api/inbox/unread")
    assert res_unread_final.json()["count"] == 0


def test_inbox_assignments_and_comments(client_with_auth, test_user, db):
    # 他ユーザーがTODOをアサインするか、自分のTODOにコメントした際の通知作成を検証
    other_user = models.User(
        display_user_id="otheru",
        password="otherpassword",
        user_name="Other User",
        delete_flag=False
    )
    db.add(other_user)
    db.commit()
    db.refresh(other_user)

    # 両ユーザーが参加するチームをセットアップ
    team = models.Team(
        created_user_id=other_user.id,
        display_teams_id="team_in",
        name="Team Inbox",
        password="teampassword"
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    db.add(models.TeamUser(team_id=team.id, user_id=other_user.id))
    db.add(models.TeamUser(team_id=team.id, user_id=test_user.id))
    db.commit()

    # 1. 「other_user」としてログイン状態を切り替え、TODOを「test_user」にアサイン
    from dependencies.auth import get_current_user
    from main import app

    app.dependency_overrides[get_current_user] = lambda: other_user

    payload = {
        "name": "Team assigned Todo",
        "priority_id": 1,
        "status_id": 1,
        "team_id": team.id,
        "manager_id": test_user.id,
        "tasks": [{"title": "Task 1"}]
    }
    create_res = client_with_auth.post("/api/todo", json=payload)
    assert create_res.status_code == 200
    todo_id = create_res.json()["id"]

    # 2. 「other_user」としてそのTODOにコメントを追加
    comment_payload = {"comment": "Please do this"}
    comment_res = client_with_auth.post(f"/api/todo/{todo_id}/comments", json=comment_payload)
    assert comment_res.status_code == 200

    # テストユーザーにIDを戻す
    app.dependency_overrides[get_current_user] = lambda: test_user

    # 3. テストユーザーが2つの通知（アサイン、コメント）を受け取ったことを確認
    unread_res = client_with_auth.get("/api/inbox/unread")
    assert unread_res.json()["count"] == 2

    # 4. 通知の詳細を確認
    inboxes_res = client_with_auth.get("/api/inbox")
    assert inboxes_res.status_code == 200
    types = [i["type"] for i in inboxes_res.json()]
    assert "team_todo_assigned" in types
    assert "todo_comment" in types
