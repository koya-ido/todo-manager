# Backend

## 起動方針

バックエンドは Alembic migration 前提で起動します。`main.py` では `create_all()` を実行しません。

## Docker での起動手順

1. DB コンテナを起動します。

```bash
docker compose up -d db
```

2. migration を適用します。

```bash
docker compose exec backend alembic upgrade head
```

3. 必要なら確認用の仮データを投入します。

```bash
docker compose exec backend python seed.py
```

4. バックエンドを起動します。

```bash
docker compose up -d backend
```

通常の `docker compose up` / `docker compose up -d` でも、backend 起動時に `alembic upgrade head` が自動実行されます。

5. ログを確認します。

```bash
docker compose logs backend -f
```

## 初回セットアップをまとめて行う場合

```bash
docker compose up -d db backend
docker compose exec backend python seed.py
```

`seed.py` は冪等に近い動きにしているため、同じサンプルデータの重複投入は避けるようにしています。

## DB を作り直す場合

ボリュームごと初期化する場合:

```bash
docker compose down -v
docker compose up -d db backend
docker compose exec backend python seed.py
```

## ユーザー削除仕様

`DELETE /api/user/{display_user_id}` は、削除対象ユーザーが他ユーザーと共有しているデータの有無に応じて、物理削除と論理削除を切り替えます。

- 認証が必要です。
- 自分自身の `display_user_id` を指定した場合のみ削除できます。
- 他ユーザーの `display_user_id` を指定した場合は `403 FORBIDDEN_USER_DELETION` を返します。

- 共有データが残らない場合は物理削除します。
- 共有データが残る場合は `users.delete_flag = true` と `users.deleted_at` を設定して論理削除します。
- 論理削除済みユーザーはログインできません。
- API レスポンスの `deletion_mode` は `physical` または `logical` を返します。

削除時の関連データの扱いは以下です。

- `team_id IS NULL` の private todo は削除します。
- private todo に紐づく削除ユーザーのコメントは削除します。
- `tags.user_id = 削除ユーザー` の個人タグは削除します。
- `inboxes.target_user_id = 削除ユーザー` の通知は削除します。
- `team_user` の所属レコードは削除します。
- ユーザー脱退後に所属メンバーが 0 人になった team は削除します。
- 上記で削除される team に紐づく team todo / team tag もあわせて削除します。
- team に紐づく todo や comment が残る場合、それらを参照するユーザー本体は論理削除で残します。

現時点で「共有データあり」とみなす対象は以下です。

- `teams.created_user_id`
- `todos.manager_id`
- `todos.created_by`
- `todos.updated_by`
- team todo 上の `comments.user_id`

将来 team や team todo を別 API から削除する場合は、その完了時にも同じ物理削除判定を呼び直す前提です。
