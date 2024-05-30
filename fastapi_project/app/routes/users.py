#app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routes import schemas
from app.database.config import get_db
from app.services.auth import get_current_active_user
from app.database import crud
from typing import List
from app.services import anythingLLM
from app.settings import settings

router = APIRouter()

@router.get("/me", response_model=schemas.User)
async def get_my_profile(current_user: schemas.User = Depends(get_current_active_user)):
    return current_user

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_user)):
    user = crud.get_user_by_id(db, user_id=user_id)
    # Solo admin può vedere utenti
    if current_user.role != schemas.Role.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_user)):
    # Solo admin può vedere tutti gli utenti
    if current_user.role != schemas.Role.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    users = crud.get_users(db)
    return users

@router.delete("/{user_id}", response_model=schemas.User)
def delete_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_user)):
    user = crud.get_user_by_id(db, user_id=user_id)
    # Solo admin può cancellare utenti
    if current_user.role != schemas.Role.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    llm_id = crud.get_llmId_by_user_id(db, user_id)
    if llm_id is not None:
        anythingLLM.remove_user(llm_id, settings.API_KEY)

        crud.delete_user_by_id(db, user_id=user_id)

        return user
