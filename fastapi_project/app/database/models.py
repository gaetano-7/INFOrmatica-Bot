# app/database/models.py
from sqlalchemy import Column, Integer, String, DateTime, Enum
from app.database.config import Base
import enum

class Role(str, enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    llm_id = Column(Integer, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(Role), default=Role.user)

class Schedule(Base):
    __tablename__ = 'schedules'

    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, index=True)
    room = Column(String)
    teacher_name = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)


