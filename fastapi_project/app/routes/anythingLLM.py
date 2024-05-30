#app/routes/anythingLLM.py
from fastapi import HTTPException, APIRouter, Query, UploadFile, File
from app.services.anythingLLM import *
from app.routes.schemas import TokenRequest, QuestionRequest

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