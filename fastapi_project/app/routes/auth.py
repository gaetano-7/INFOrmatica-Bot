#app/routes/auth.py 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.services.auth import authenticate_user, create_access_token
from app.routes import schemas
from app.database.config import get_db
from app.database import crud
from app.settings import settings
from app.services import anythingLLM

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"id": user.id, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, 
            "token_type": "bearer"
            }


@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user_email = crud.get_user_by_email(db, email=user.email)
    db_user_username = crud.get_user_by_username(db, username=user.username)
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    llm_id = anythingLLM.create_user(settings.API_KEY, user.username, user.password)
    users_ids = anythingLLM.get_users_ids(settings.API_KEY)
    if users_ids:
        anythingLLM.add_user_to_workspace(users_ids, settings.API_KEY)
    
    db_user = crud.create_user(db=db, user=user, llm_id=llm_id)
    return db_user


@router.post("/forgot-password")
async def forgot_password(email: schemas.UserBase, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=email.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"msg": "Password reset email sent"}
