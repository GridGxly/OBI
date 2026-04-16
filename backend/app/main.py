import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import embed, search, auth, upload, users
from core.database import init_db

app = FastAPI(title="Obi Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve audio files written by database_loader.py at /static/<filename>
_STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(_STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=_STATIC_DIR), name="static")

@app.on_event("startup")
async def startup():
    import logging
    logger = logging.getLogger("uvicorn.error")
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

app.include_router(embed.router, prefix="/embed", tags=["embed"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(auth.router)   # prefix already defined in router
app.include_router(users.router)  # prefix already defined in router
app.include_router(upload.router, prefix="/upload", tags=["upload"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}