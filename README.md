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
