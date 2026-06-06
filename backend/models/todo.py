from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class TodoTag(Base):
    __tablename__ = "todo_tag"

    todo_id = Column(Integer, ForeignKey("todos.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    todo = relationship("Todo", back_populates="todo_tags")
    tag = relationship("Tag", back_populates="todo_tags")


class Priority(Base):
    __tablename__ = "priorities"

    id = Column(Integer, primary_key=True)
    name = Column(String(20), nullable=False, unique=True)

    todos = relationship("Todo", back_populates="priority")


class Status(Base):
    __tablename__ = "statuses"

    id = Column(Integer, primary_key=True)
    name = Column(String(20), nullable=False, unique=True)

    todos = relationship("Todo", back_populates="status")


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    priority_id = Column(Integer, ForeignKey("priorities.id"), nullable=False)
    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    delete_flag = Column(Boolean, nullable=False, default=False, server_default="false")
    remarks = Column(Text, nullable=True)

    priority = relationship("Priority", back_populates="todos")
    status = relationship("Status", back_populates="todos")
    team = relationship("Team", back_populates="todos")
    manager = relationship("User", foreign_keys=[manager_id], back_populates="managed_todos")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_todos")
    updater = relationship("User", foreign_keys=[updated_by], back_populates="updated_todos")
    tasks = relationship("Task", back_populates="todo", order_by="Task.position", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="todo", cascade="all, delete-orphan")
    inboxes = relationship("Inbox", back_populates="todo", cascade="all, delete-orphan")
    todo_tags = relationship("TodoTag", back_populates="todo", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="todo_tag", back_populates="todos", viewonly=True)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    todo_id = Column(Integer, ForeignKey("todos.id", ondelete="CASCADE"), nullable=False, index=True)
    position = Column(SmallInteger, nullable=False)
    title = Column(String(50), nullable=False)
    content = Column(String(800), nullable=True)
    completion_flag = Column(Boolean, nullable=False, default=False, server_default="false")

    todo = relationship("Todo", back_populates="tasks")

    __table_args__ = (
        UniqueConstraint("todo_id", "position", name="uq_tasks_todo_id_position"),
    )


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    delete_flag = Column(Boolean, nullable=False, default=False, server_default="false")

    user = relationship("User", back_populates="tags")
    team = relationship("Team", back_populates="tags")
    todo_tags = relationship("TodoTag", back_populates="tag", cascade="all, delete-orphan")
    todos = relationship("Todo", secondary="todo_tag", back_populates="tags", viewonly=True)

    __table_args__ = (
        CheckConstraint(
            "(user_id IS NOT NULL AND team_id IS NULL) OR (user_id IS NULL AND team_id IS NOT NULL)",
            name="ck_tags_user_xor_team",
        ),
        UniqueConstraint("user_id", "name", name="uq_tags_user_id_name"),
        UniqueConstraint("team_id", "name", name="uq_tags_team_id_name"),
    )
