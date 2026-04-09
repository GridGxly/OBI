from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, ARRAY, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    saved_sounds: Mapped[list["SavedSound"]] = relationship(
        "SavedSound", back_populates="owner", cascade="all, delete-orphan"
    )


class SavedSound(Base):
    __tablename__ = "saved_sounds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    bpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)  # stored as JSON array
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    match_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped["User"] = relationship("User", back_populates="saved_sounds")