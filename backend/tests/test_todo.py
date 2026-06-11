def test_create_todo_success(client_with_auth):
    # 正常なTODO作成テスト
    payload = {
        "name": "Test Todo Name",
        "priority_id": 2,  # 中
        "status_id": 1,    # 未着手
        "remarks": "Test remarks",
        "due_date": "2026-12-31",
        "tasks": [
            {"title": "Task 1", "content": "Content 1", "completion_flag": False},
            {"title": "Task 2", "content": "Content 2", "completion_flag": False}
        ],
        "tag_ids": []
    }
    response = client_with_auth.post("/api/todo", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Todo Name"
    assert len(data["tasks"]) == 2
    assert data["priority_id"] == 2
    assert data["status_id"] == 1
    assert data["delete_flag"] is False


def test_create_todo_validation_error(client_with_auth):
    # タスクが空の場合のバリデーションエラーを検証
    payload = {
        "name": "Invalid Todo",
        "priority_id": 2,
        "status_id": 1,
        "tasks": []
    }
    response = client_with_auth.post("/api/todo", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_get_todos(client_with_auth):
    # TODO一覧の取得テスト
    # 事前にTODOを1件作成
    payload = {
        "name": "Todo for Listing",
        "priority_id": 1,
        "status_id": 1,
        "tasks": [{"title": "Task 1"}]
    }
    client_with_auth.post("/api/todo", json=payload)

    response = client_with_auth.get("/api/todo")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(item["name"] == "Todo for Listing" for item in data["items"])


def test_get_todo_detail(client_with_auth):
    # TODO詳細の取得テスト
    payload = {
        "name": "Todo for Detail",
        "priority_id": 1,
        "status_id": 1,
        "tasks": [{"title": "Task 1"}]
    }
    create_res = client_with_auth.post("/api/todo", json=payload)
    todo_id = create_res.json()["id"]

    # 詳細を取得
    response = client_with_auth.get(f"/api/todo/{todo_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Todo for Detail"

    # 存在しないIDを指定
    response_404 = client_with_auth.get("/api/todo/99999")
    assert response_404.status_code == 404
    assert response_404.json()["code"] == "TODO_NOT_FOUND"


def test_update_todo(client_with_auth):
    # TODOの更新テスト
    payload = {
        "name": "Original Todo",
        "priority_id": 1,
        "status_id": 1,
        "tasks": [{"title": "Task 1"}]
    }
    create_res = client_with_auth.post("/api/todo", json=payload)
    todo_id = create_res.json()["id"]

    update_payload = {
        "name": "Updated Todo Name",
        "priority_id": 2,
        "status_id": 2,
        "tasks": [{"title": "Task 1 Updated", "completion_flag": True}]
    }
    response = client_with_auth.put(f"/api/todo/{todo_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Todo Name"
    assert data["priority_id"] == 2
    assert data["status_id"] == 2
    assert data["tasks"][0]["title"] == "Task 1 Updated"


def test_delete_todo_logical_and_physical(client_with_auth):
    # 論理削除とその後の物理削除の連動テスト
    payload = {
        "name": "Todo to Delete",
        "priority_id": 1,
        "status_id": 1,
        "tasks": [{"title": "Task 1"}]
    }
    create_res = client_with_auth.post("/api/todo", json=payload)
    todo_id = create_res.json()["id"]

    # 1回目の削除（論理削除）
    response = client_with_auth.delete(f"/api/todo/{todo_id}")
    assert response.status_code == 200
    assert response.json()["delete_flag"] is True

    # 通常のアクティブ一覧には含まれないことを検証
    list_res = client_with_auth.get("/api/todo")
    assert not any(item["id"] == todo_id for item in list_res.json()["items"])

    # 削除済みのみの一覧には含まれていることを検証
    list_deleted_res = client_with_auth.get("/api/todo?is_delete_only=true")
    assert any(item["id"] == todo_id for item in list_deleted_res.json()["items"])

    # 2回目の削除（物理削除）
    response_physical = client_with_auth.delete(f"/api/todo/{todo_id}")
    assert response_physical.status_code == 200

    # 詳細取得で404が返ることを検証
    get_res = client_with_auth.get(f"/api/todo/{todo_id}")
    assert get_res.status_code == 404


def test_todo_comments_crud(client_with_auth):
    # 1. TODOを作成
    payload = {
        "name": "Todo for Comments",
        "priority_id": 1,
        "status_id": 1,
        "tasks": [{"title": "Task 1"}]
    }
    create_res = client_with_auth.post("/api/todo", json=payload)
    todo_id = create_res.json()["id"]

    # 2. コメントを追加
    comment_payload = {"comment": "This is a comment"}
    comment_res = client_with_auth.post(f"/api/todo/{todo_id}/comments", json=comment_payload)
    assert comment_res.status_code == 200
    comment_id = comment_res.json()["id"]
    assert comment_res.json()["comment"] == "This is a comment"

    # 3. コメントを更新
    update_comment_payload = {"comment": "Updated comment content"}
    update_res = client_with_auth.put(f"/api/todo/{todo_id}/comments/{comment_id}", json=update_comment_payload)
    assert update_res.status_code == 200
    assert update_res.json()["comment"] == "Updated comment content"

    # 4. コメントを削除
    delete_res = client_with_auth.delete(f"/api/todo/{todo_id}/comments/{comment_id}")
    assert delete_res.status_code == 200


def test_patch_task_completion(client_with_auth):
    # 1. 2つのタスクを持つTODOを作成
    payload = {
        "name": "Todo for Task Patching",
        "priority_id": 1,
        "status_id": 1,
        "tasks": [
            {"title": "Task A", "completion_flag": False},
            {"title": "Task B", "completion_flag": False}
        ]
    }
    create_res = client_with_auth.post("/api/todo", json=payload)
    todo = create_res.json()
    todo_id = todo["id"]
    task_a_id = todo["tasks"][0]["id"]
    task_b_id = todo["tasks"][1]["id"]

    # 2. 1つ目のタスクを完了にする
    patch_payload = {"completion_flag": True}
    patch_res = client_with_auth.patch(f"/api/todo/{todo_id}/tasks/{task_a_id}", json=patch_payload)
    assert patch_res.status_code == 200
    # インデックスが順不同の可能性を考慮し、IDで検索
    tasks = patch_res.json()["tasks"]
    task_a = next(t for t in tasks if t["id"] == task_a_id)
    assert task_a["completion_flag"] is True
    # タスクBが未完了のため、TODOステータスはまだ未着手(1)であるべき
    assert patch_res.json()["status_id"] == 1

    # 3. 2つ目のタスクを完了にする（すべて完了なので自動で完了(3)ステータスに遷移）
    patch_res_all = client_with_auth.patch(f"/api/todo/{todo_id}/tasks/{task_b_id}", json=patch_payload)
    assert patch_res_all.status_code == 200
    tasks_all = patch_res_all.json()["tasks"]
    task_b = next(t for t in tasks_all if t["id"] == task_b_id)
    assert task_b["completion_flag"] is True
    # TODOのstatus_idが3（完了）であることを検証
    assert patch_res_all.json()["status_id"] == 3

