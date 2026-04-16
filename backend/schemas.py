from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FollowUpActionBase(BaseModel):
    description: str
    due_date: Optional[datetime] = None
    status: Optional[str] = "Pending"

class FollowUpActionCreate(FollowUpActionBase):
    pass

class FollowUpStatusUpdate(BaseModel):
    status: str


class FollowUpAction(FollowUpActionBase):
    id: int
    interaction_id: int

    class Config:
        from_attributes = True

class InteractionBase(BaseModel):
    hcp_id: int
    type: str
    date_time: datetime
    notes: Optional[str] = None
    outcomes: Optional[str] = None
    sentiment: Optional[str] = "Neutral"

class InteractionCreate(InteractionBase):
    follow_up: Optional[FollowUpActionCreate] = None


class InteractionUpdate(BaseModel):
    type: Optional[str] = None
    date_time: Optional[datetime] = None
    notes: Optional[str] = None
    outcomes: Optional[str] = None
    sentiment: Optional[str] = None

class Interaction(InteractionBase):
    id: int
    follow_ups: List[FollowUpAction] = []

    class Config:
        from_attributes = True

class HCPBase(BaseModel):
    name: str
    specialty: str
    hospital: Optional[str] = None
    location: Optional[str] = None
    contact_info: Optional[str] = None


class HCPCreate(HCPBase):
    pass

class HCP(HCPBase):
    id: int
    interactions: List[Interaction] = []

    class Config:
        from_attributes = True
