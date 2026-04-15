from pydantic import BaseModel, EmailStr
from typing import List, Optional

class NearestNeighbor(BaseModel):
  id: str
  score: float

class EmbedResponse(BaseModel):
  embedding_id: str
  nearest_neighbors: List[NearestNeighbor]

class UserRegistration(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UploadResponse(BaseModel):
    filename: str
    saved_path: str
    status: str

class SearchResultDetail(BaseModel):
    id: str
    filename: Optional[str] = None
    path: Optional[str] = None
    score: Optional[float] = None
