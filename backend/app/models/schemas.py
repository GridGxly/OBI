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
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UploadResponse(BaseModel):
    filename: str
    saved_path: str
    status: str

class SearchResultDetail(BaseModel):
    id: str
    filename: Optional[str] = None
    path: Optional[str] = None
    score: Optional[float] = None
