from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class TeamUser(Base):
    __tablename__ = "team_user"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    team = relationship("Team", back_populates="team_users")
    user = relationship("User", back_populates="team_users")

    __table_args__ = (
        UniqueConstraint("team_id", "user_id", name="uq_team_user_team_id_user_id"),
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    display_user_id = Column(String(6), unique=True, index=True, nullable=False)
    user_name = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    delete_flag = Column(Boolean, nullable=False, default=False, server_default="false")
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    created_teams = relationship("Team", back_populates="created_user")
    team_users = relationship("TeamUser", back_populates="user", cascade="all, delete-orphan")
    team_applications = relationship("TeamApplication", back_populates="user", cascade="all, delete-orphan")
    managed_todos = relationship(
        "Todo",
        foreign_keys="Todo.manager_id",
        back_populates="manager",
    )
    created_todos = relationship(
        "Todo",
        foreign_keys="Todo.created_by",
        back_populates="creator",
    )
    updated_todos = relationship(
        "Todo",
        foreign_keys="Todo.updated_by",
        back_populates="updater",
    )
    comments = relationship("Comment", back_populates="user")
    tags = relationship("Tag", back_populates="user")
    inboxes = relationship("Inbox", back_populates="target_user")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    created_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    display_teams_id = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    accepting_applications = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    created_user = relationship("User", back_populates="created_teams")
    team_users = relationship("TeamUser", back_populates="team", cascade="all, delete-orphan")
    team_applications = relationship("TeamApplication", back_populates="team", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="team")
    todos = relationship("Todo", back_populates="team")


class TeamApplication(Base):
    __tablename__ = "team_applications"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    team = relationship("Team", back_populates="team_applications")
    user = relationship("User", back_populates="team_applications")

    __table_args__ = (
        UniqueConstraint("team_id", "user_id", name="uq_team_applications_team_id_user_id"),
    )

