def test_auth_workflow(client):
    # 1. サインアップ（新規ユーザー作成）
    signup_payload = {
        "username": "newusr",
        "password": "testpassword123"
    }
    signup_res = client.post("/api/signup", json=signup_payload)
    assert signup_res.status_code == 201
    signup_data = signup_res.json()
    assert signup_data["username"] == "newusr"
    assert "display_id" in signup_data

    # 2. ログイン（ユーザー認証とJWTトークン取得）
    display_id = signup_data["display_id"]
    login_payload = {
        "username": display_id,
        "password": "testpassword123"
    }
    login_res = client.post("/api/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # 3. プロフィール取得（JWTをヘッダーにセット）
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user_name"] == "newusr"
    assert me_data["display_user_id"] == signup_data["display_id"]

    # 4. ログアウト（JWTトークンの無効化）
    logout_res = client.post("/api/logout", headers=headers)
    assert logout_res.status_code == 200

    # 5. ログアウト後のチェック（無効化されたトークンが401を返すことを検証）
    me_after_res = client.get("/api/me", headers=headers)
    assert me_after_res.status_code == 401
    assert me_after_res.json()["code"] == "TOKEN_REVOKED"
