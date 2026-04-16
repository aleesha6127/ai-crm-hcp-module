from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialty = Column(String, index=True)
    hospital = Column(String, index=True)
    location = Column(String, index=True)
    contact_info = Column(String)


    interactions = relationship("Interaction", back_populates="hcp", cascade="all, delete-orphan")

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"))
    type = Column(String) # Meeting, Call, Email, etc.
    date_time = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text)
    outcomes = Column(Text)
    sentiment = Column(String) # Positive, Neutral, Negative

    hcp = relationship("HCP", back_populates="interactions")
    follow_ups = relationship("FollowUpAction", back_populates="interaction", cascade="all, delete-orphan")

class FollowUpAction(Base):
    __tablename__ = "follow_up_actions"

    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(Integer, ForeignKey("interactions.id"))
    description = Column(String)
    due_date = Column(DateTime)
    status = Column(String, default="Pending")

    interaction = relationship("Interaction", back_populates="follow_ups")
