from sqlalchemy.orm import Session

import models


def seed_masters(db: Session) -> None:
    for priority_id, name in ((1, "高"), (2, "中"), (3, "低")):
        priority = db.query(models.Priority).filter(models.Priority.id == priority_id).first()
        if not priority:
            db.add(models.Priority(id=priority_id, name=name))

    for status_id, name in ((1, "未着手"), (2, "着手中"), (3, "完了"), (4, "保留中")):
        status = db.query(models.Status).filter(models.Status.id == status_id).first()
        if not status:
            db.add(models.Status(id=status_id, name=name))

    db.flush()
