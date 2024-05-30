# app/routes/schemas.py

from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
import re
from typing import Optional
from datetime import datetime

class UserLLM(BaseModel):
    username: str
    password: str

class TokenRequest(BaseModel):
    username: str
    password: str

class AddUserToWorkspaceRequest(BaseModel):
    user_id: int
    api_key: str

class RemoveUserRequest(BaseModel):
    user_id: int
    api_key: str

class QuestionRequest(BaseModel):
    message: str
    api_key: str

class DeleteWorkspaceChatRequest(BaseModel):
    chat_id: int
    api_key: str


# Enum per il ruolo dell'utente
class Role(str, Enum):
    user = "user"
    admin = "admin"

# Modello base per l'utente
class UserBase(BaseModel):
    email: EmailStr
    username: str

# Modello per la creazione di un utente
class UserCreate(UserBase):
    first_name: str
    last_name: str
    password: str = Field(..., min_length=8)

    @classmethod
    @field_validator('password')
    def password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#\$%\^&\*_]', v):
            raise ValueError('Password must contain at least one special character')
        return v

# Modello per rappresentare un utente completo
class User(UserBase):
    id: int
    first_name: str
    last_name: str
    role: Role

    class Config:
        from_attributes = True

# Modelli per i token di autenticazione
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: int | None = None
    role: str | None = None

# Modello base per Schedule
class ScheduleBase(BaseModel):
    course_name: str
    start_time: datetime
    end_time: datetime
    teacher_name: Optional[str] = None
    room: Optional[str] = None

# Modello per la creazione di un Schedule
class ScheduleCreate(ScheduleBase):
    pass

# Modello per rappresentare un Schedule completo
class Schedule(ScheduleBase):
    id: int

    @classmethod
    @field_validator('id')
    def validate_id(cls, value):
        if value < 0:
            raise ValueError('ID must be a positive integer')
        return value

    class Config:
        from_attributes = True
