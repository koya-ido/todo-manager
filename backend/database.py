from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
# docker-compose.ymlで設定した環境変数に合わせてください
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "your-fallback-database-url")

if not SQLALCHEMY_DATABASE_URL or SQLALCHEMY_DATABASE_URL == "your-fallback-database-url":
    raise ValueError("DATABASE_URL is not set or invalid")
    
# 接続プール設定も検討
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # 接続有効性確認
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DBセッションを取得するためのDependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()