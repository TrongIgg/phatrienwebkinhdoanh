from fastapi import APIRouter, HTTPException

from app.models.schemas import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    if payload.password == "wrong-password":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return LoginResponse(access_token=f"demo-token-for-{payload.email}")
