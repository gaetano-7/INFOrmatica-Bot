#app/database/crud.py
from sqlalchemy.orm import Session
from app.routes import schemas
from passlib.context import CryptContext
from app.database.models import User, Schedule

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(db: Session, user: schemas.UserCreate, llm_id: int):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        llm_id = llm_id, first_name=user.first_name, last_name=user.last_name, email=user.email,
        username=user.username, hashed_password=hashed_password, role=schemas.Role.user
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session):
    return db.query(User).all()

def delete_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user

def get_llmId_by_user_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        return user.llm_id
    else:
        return None  # Or handle the case however you see fit


def create_schedule(db: Session, schedule: schemas.ScheduleCreate):
    db_schedule = Schedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def get_schedules(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Schedule).offset(skip).limit(limit).all()

def get_schedule_by_details(db: Session, course_name: str, room: str, teacher_name: str, start_time: str, end_time: str):
    return db.query(Schedule).filter(
        Schedule.course_name == course_name,
        Schedule.room == room,
        Schedule.teacher_name == teacher_name,
        Schedule.start_time == start_time,
        Schedule.end_time == end_time
    ).first()