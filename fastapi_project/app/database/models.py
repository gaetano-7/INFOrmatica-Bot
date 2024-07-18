from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.config import Base
from datetime import datetime
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

    chat_histories = relationship("ChatVerified", back_populates="user")

class Schedule(Base):
    __tablename__ = 'schedules'

    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, index=True)
    room = Column(String)
    teacher_name = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)

class ChatVerified(Base):
    __tablename__ = 'chat_verified'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    question = Column(String)
    ai_response = Column(String)
    verified_response = Column(String, nullable=True)

    user = relationship("User", back_populates="chat_histories")
