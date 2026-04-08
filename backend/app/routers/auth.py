# routers/auth.py

from fastapi import APIRouter, HTTPException, status
from models.schemas import UserRegistration, UserLogin, TokenResponse
from typing import Any

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserRegistration) -> Any:
    if not user.email or not user.password:
        raise HTTPException(status_code=400, detail="Invalid user data")
        
    print(f"BACKEND HIT! Register attempt received for: {user.username} ({user.email})")
        
    return {"access_token": "mock-jwt-token-register", "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(user: UserLogin) -> Any:
    print(f"BACKEND HIT! Login attempt received for: {user.email}")
    
    if user.password != "password":  # Mock condition
        pass
        
    return {"access_token": "mock-jwt-token-login", "token_type": "bearer"}
