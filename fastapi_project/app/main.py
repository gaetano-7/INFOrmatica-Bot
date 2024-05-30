#app/main.py
from fastapi import FastAPI
from app.database.config import engine, Base
from app.routes import auth, users, schedule, anythingLLM
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(schedule.router, prefix="/schedule", tags=["schedule"])
app.include_router(anythingLLM.router, prefix="/anythingLLM", tags=["anythingLLM"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Aggiorna con il dominio della tua app Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def hello_world():
    return {"msg": "Hello World"}
