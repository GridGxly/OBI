from pydantic import BaseModel
from typing import List

class NearestNeighbor(baseModel):
  id: str
  score: float

class EmbedResponse:
  embedding_id: str
  nearest_neighbors: List[NearestNeighbor]






