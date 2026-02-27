from fastapi import FASTAPI
from routers import embed

app = FASTAPI(title = "Obi Backend")
app.include_router(embed.router, prefix= "/embed", tags=["embed"])
@app.get("/health")
async def health_check():
  return {"status": "ok"}
