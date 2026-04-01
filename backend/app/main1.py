from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import embed, search
from app.middleware.rate_limit import RateLimitMiddleware

app = FastAPI(title="Obi Backend")

# CORS (you’ll refine this later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.add_middleware(RateLimitMiddleware)

# Versioned routes
app.include_router(embed.router, prefix="/api/v1/embed", tags=["embed"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
