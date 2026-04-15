from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import embed, search, auth, upload, users
from core.database import init_db

app = FastAPI(title="Obi Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(embed.router, prefix="/embed", tags=["embed"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(auth.router)   # prefix already defined in router
app.include_router(users.router)  # prefix already defined in router
app.include_router(upload.router, prefix="/upload", tags=["upload"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}