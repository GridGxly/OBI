from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    QDRANT_API_KEY: str = ""
    QDRANT_URL: str = ""
    HF_TOKEN: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()