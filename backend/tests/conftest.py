import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# backendディレクトリをPythonパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, get_db
from dependencies.auth import get_current_user
from main import app
from seeders.master_data import seed_masters
from sqlalchemy.pool import StaticPool
import models

# テスト用のインメモリSQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    # テーブルを作成
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()

    # マスタデータ（優先度、ステータス）を投入
    seed_masters(db_session)

    yield db_session

    db_session.close()
    # テーブルを削除
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db):
    # テストユーザーを作成
    user = models.User(
        display_user_id="test_u",
        password="hashed_password_placeholder",
        user_name="Test User",
        delete_flag=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def client_with_auth(client, test_user):
    # トークン検証をバイパスするためget_current_userの依存関係をオーバーライド
    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]
