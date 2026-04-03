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
