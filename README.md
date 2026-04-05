# TODO Manager App

## Docker操作

- 初回/再ビルド: `docker compose up --build`
- 起動: `docker compose up -d`
- 停止: `docker compose down`
- 起動中コンテナ確認: `docker compose ps`
- イメージ削除: `docker image prune`
- コンテナ削除: `docker container prune`
- ボリューム削除: `docker volume prune`
- ネットワーク削除: `docker network prune`
- 全て削除: `docker system prune`
- すべて削除(volumesも含む): `docker system prune -a --volumes`

### Dockerでのlogの確認

- frontend: `docker compose logs frontend`
- backend: `docker compose logs backend`

## 構成

- todo-manager
  - frontend
  - backend

### frontend

#### 言語

- typescript
- css

#### ライブラリ

- next.js
- storybook
- shadcn ui

#### storybook

##### 起動方法

1. `docker-compose exec frontend npm run dev` を実行する。
2. [localhost:6006](http://localhost:6006)にアクセスする。

### backend

#### 言語

- python

#### ライブラリ

- FastAPI
  - uvicorn
- SQLAlchemy
- alembic

#### DB

- postgreSQL

#### 起動手順

- 詳細は [backend/README.md](todo-manager/backend/README.md) を参照

#### 実装運用

バックエンドは `main.py` に処理を増やさず、責務ごとに分割して実装する方針です。

- `backend/main.py`
  - FastAPI アプリ生成、ミドルウェア設定、例外ハンドラ登録、router 登録のみを置く
- `backend/routers/`
  - エンドポイント定義を置く
  - `auth.py` はログイン、サインアップ、ログアウト、`me` など認証系
  - `user.py` はユーザー削除などユーザー系
- `backend/services/`
  - DB 更新を含む業務ロジックを置く
  - router から直接長い処理を書かず、service 関数を呼ぶ
- `backend/dependencies/`
  - `get_current_user` のような FastAPI dependency を置く
- `backend/exceptions.py`
  - API 共通の例外定義と例外ハンドラを置く

新しい API を追加する場合は、まず対応する router を選び、必要な処理を service に切り出してから router から呼ぶようにしてください。
