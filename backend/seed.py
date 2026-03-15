import sys
import os
import logging

# カレントディレクトリをパスに追加（インポートエラー対策）
sys.path.append(os.getcwd())

from database import SessionLocal, engine
import models
import auth

logger = logging.getLogger(__name__)

# 1. 念のためテーブルが存在することを確認（MetaDataから作成を試みる）
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        target_id = "user001"
        # 1. 既存ユーザーを探す
        user = db.query(models.User).filter(models.User.display_user_id == target_id).first()
        
        if user:
            # 2. 存在する場合は値を上書き (Update)
            logger.info(f"Updating existing user: {target_id}")
            user.user_name = "testuser"  # ここに新しい値を設定
            user.password = auth.get_password_hash("Password-123")
        else:
            # 3. 存在しない場合は新規作成 (Insert)
            logger.info(f"Creating new user: {target_id}")
            user = models.User(
                display_user_id=target_id,
                user_name="testuser",
                password=auth.get_password_hash("Password-123")
            )
            db.add(user)
        
        db.commit()
        logger.info("Seed data completed successfully!")
            
    except Exception as e:
        logger.error(f"Error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()