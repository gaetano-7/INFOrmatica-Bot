#app/routes/anythingLLM.py
from fastapi import HTTPException, APIRouter, Query, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.database import crud
from app.database.config import get_db
from app.services.anythingLLM import *
from app.routes.schemas import TokenRequest, QuestionRequest, QuestionVerifiedRequest

router = APIRouter()

@router.post("/get_token")
def get_token_endpoint(user: TokenRequest):
    token = get_token(user.username, user.password)
    if token:
        return {"token": token}
    raise HTTPException(status_code=400, detail="Token request failed")

@router.post("/question")
def question_endpoint(request: QuestionRequest):
    try:
        response = question(request.message, request.api_key)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/chats")
def get_chats(api_key: str = Query(...)):
    try:
        response = get_chat_history(api_key)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get_documents")
def get_documents_endpoint(api_key: str = Query(...)):
    try:
        response = get_documents(api_key)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/deleteAllWorkspacesChat")
def delete_all_workspaces_chat_endpoint(api_key: str = Query(...)):
    try:
        response = delete_all_workspace_chats(api_key)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload_document")
async def upload_document_endpoint(api_key: str = Query(...), file: UploadFile = File(...)):
    try:
        document_location = upload_document(api_key, file)
        response = add_embeddings(api_key, document_location)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload_document_link")
def upload_document_link_endpoint(api_key: str = Query(...), link: str = Query(...)):
    try:
        document_location = upload_document_link(api_key, link)
        response = add_embeddings(api_key, document_location)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/delete_document")
async def delete_document(token: str = Query(...), api_key: str = Query(...), document_name: str = File(...)):
    try:
        response = remove_embeddings(api_key, document_name)
        response2 = remove_document(token, document_name)
        return response, response2
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/question_verified")
def question_verified_endpoint(request: QuestionVerifiedRequest, db: Session = Depends(get_db)):
    try:
        response = question(request.message, request.api_key)
        user_response = crud.create_chat_verified(db, request.user_id, request.message, response)
        return {"response": user_response.ai_response, "response_id": user_response.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    
@router.post("/create_chat_verified")
def create_chat_verified_endpoint(user_id: int, question: str, ai_response: str, db: Session = Depends(get_db)):
    try:
        response = crud.create_chat_verified(db, user_id, question, ai_response)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get_chat_verified")
def get_chat_verified_endpoint(response_id: int, db: Session = Depends(get_db)):
    try:
        response = crud.get_chat_verified(db, response_id)
        if response:
            return response
        raise HTTPException(status_code=404, detail="Response not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify_response")
def verify_response_endpoint(response_id: int, verified_response: str, db: Session = Depends(get_db)):
    try:
        response = crud.update_verified_response(db, response_id, verified_response)
        if response:
            return response
        raise HTTPException(status_code=404, detail="Response not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get_chat_verified_by_user_id")
def get_chat_verified_by_user_id_endpoint(user_id: int, db: Session = Depends(get_db)):
    try:
        responses = crud.get_chat_verified_by_user_id(db, user_id)
        return responses
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))