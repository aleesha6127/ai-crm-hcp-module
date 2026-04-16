from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.database import get_db, Base, engine
from backend import models, schemas, crud
from backend.agent import chat_with_agent

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HCP AI CRM API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/api/hcps/", response_model=List[schemas.HCP])
def read_hcps(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hcps = crud.get_hcps(db, skip=skip, limit=limit)
    return hcps

@app.post("/api/hcps/", response_model=schemas.HCP)
def create_hcp(hcp: schemas.HCPCreate, db: Session = Depends(get_db)):
    return crud.create_hcp(db=db, hcp=hcp)

@app.get("/api/interactions/", response_model=List[schemas.Interaction])
def read_interactions(hcp_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    interactions = crud.get_interactions(db, hcp_id=hcp_id, skip=skip, limit=limit)
    return interactions

@app.post("/api/interactions/", response_model=schemas.Interaction)
def create_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    return crud.create_interaction(db=db, interaction=interaction)

@app.post("/api/chat/", response_model=ChatResponse)
def process_chat(request: ChatRequest):
    try:
        reply = chat_with_agent(request.message)
        return ChatResponse(response=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/follow-ups/{follow_up_id}/status", response_model=schemas.FollowUpAction)
def update_follow_up_status(follow_up_id: int, status_update: schemas.FollowUpStatusUpdate, db: Session = Depends(get_db)):
    db_follow_up = crud.update_follow_up_status(db, follow_up_id, status_update.status)
    if not db_follow_up:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return db_follow_up

