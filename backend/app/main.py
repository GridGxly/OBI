from fastapi import FastAPI
from routers import embed, search

app = FastAPI(title="Obi Backend")

app.include_router(embed.router, prefix="/embed", tags=["embed"])
app.include_router(search.router, prefix="/search", tags=["search"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}

