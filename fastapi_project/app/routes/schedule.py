#routes/schedule
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.routes import schemas
from app.database.config import get_db
from app.services.auth import get_current_active_user
from app.services.ical_parser import parse_ical
from app.services.anythingLLM import upload_document, add_embeddings
from app.database import crud
import os
import tempfile
import json

router = APIRouter()

@router.post("/import-ical/")
def import_ical(url: str = Query(..., alias="url"), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_active_user)):
    if current_user.role != schemas.Role.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    events = parse_ical(url)
    for event in events:
        schedule_data = schemas.ScheduleCreate(
            course_name=event['summary'],
            room=event.get('location', 'Unknown'),
            teacher_name=event.get('description', 'Unknown'),
            start_time=event['dtstart'],
            end_time=event['dtend']
        )
        existing_schedule = crud.get_schedule_by_details(
            db=db,
            course_name=schedule_data.course_name,
            room=schedule_data.room,
            teacher_name=schedule_data.teacher_name,
            start_time=schedule_data.start_time,
            end_time=schedule_data.end_time
        )
        if existing_schedule:
            raise HTTPException(status_code=400, detail=f"Calendario già presente nel database")

        crud.create_schedule(db=db, schedule=schedule_data)
    return {"msg": "iCal imported successfully"}

@router.post("/import-ical-and-upload/")
async def import_ical_and_upload(url: str = Query(..., alias="url"), api_key: str = Query(...), filename: str = Query(default="calendar.json"), current_user: schemas.User = Depends(get_current_active_user)):
    if current_user.role != schemas.Role.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    events = parse_ical(url)
    formatted_events = [
        {
            "course_name": event['summary'],
            "room": event.get('location', 'Unknown'),
            "teacher_name": event.get('description', 'Unknown'),
            "start_time": event['dtstart'],
            "end_time": event['dtend']
        }
        for event in events
    ]

    # Create a temporary file
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False) as temp_file:
        json.dump(formatted_events, temp_file, indent=4)
        temp_file.seek(0)
        
        # Open the temporary file and create an UploadFile object
        upload_file = UploadFile(filename=filename, file=temp_file)
        document_location = upload_document(api_key, upload_file)
        response = add_embeddings(api_key, document_location)

    # The temporary file is automatically deleted when closed
    return {"msg": "iCal imported and uploaded successfully", "response": response}

@router.get("/", response_model=list[schemas.Schedule])
def read_schedule(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    schedules = crud.get_schedules(db, skip=skip, limit=limit)
    return schedules