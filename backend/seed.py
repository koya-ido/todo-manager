import logging
import os
import sys

sys.path.append(os.getcwd())

from database import SessionLocal
from seeders import seed_masters, seed_sample_data

logger = logging.getLogger(__name__)


def seed_data() -> None:
    db = SessionLocal()
    try:
        seed_masters(db)
        seed_sample_data(db)
        db.commit()
        logger.info("Seed data completed successfully")
    except Exception as exc:
        logger.error("Error occurred: %s", exc)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
