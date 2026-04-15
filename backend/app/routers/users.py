from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from core.database import get_db
from core.deps import get_current_user
from models.user import User, SavedSound

router = APIRouter(prefix="/users", tags=["users"])


# ---------- Schemas ----------

class SaveSoundRequest(BaseModel):
    title: str
    bpm: float | None = None
    tags: list[str] | None = None
    year: int | None = None
    match_percent: float | None = None


class SavedSoundResponse(BaseModel):
    id: int
    title: str
    bpm: float | None
    tags: list[str] | None
    year: int | None
    match_percent: float | None

    class Config:
        from_attributes = True


# ---------- Routes ----------

@router.get("/sounds", response_model=list[SavedSoundResponse])
async def get_saved_sounds(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedSound).where(SavedSound.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/sounds", response_model=SavedSoundResponse, status_code=201)
async def save_sound(
    body: SaveSoundRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sound = SavedSound(user_id=current_user.id, **body.model_dump())
    db.add(sound)
    await db.commit()
    await db.refresh(sound)
    return sound


@router.delete("/sounds/{sound_id}", status_code=204)
async def delete_sound(
    sound_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedSound).where(
            SavedSound.id == sound_id,
            SavedSound.user_id == current_user.id,
        )
    )
    sound = result.scalar_one_or_none()
    if not sound:
        raise HTTPException(status_code=404, detail="Sound not found")

    await db.delete(sound)
    await db.commit()