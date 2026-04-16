from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from core.config import settings

# Strip inline comments and the ?ssl=require query param —
# asyncpg handles SSL via connect_args, not the URL query string
_db_url = settings.DATABASE_URL.split("#")[0].strip()
if "?ssl=" in _db_url:
    _db_url = _db_url.split("?ssl=")[0]
elif "&ssl=" in _db_url:
    _db_url = _db_url.replace("&ssl=require", "").replace("&ssl=true", "")

# Ensure the URL uses the asyncpg driver — Railway may provide plain postgresql://
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    _db_url,
    echo=False,
    connect_args={"statement_cache_size": 0, "ssl": "require"},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Create all tables. Call on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)