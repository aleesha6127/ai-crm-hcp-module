from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_hcp(db: Session, hcp_id: int):
    return db.query(models.HCP).filter(models.HCP.id == hcp_id).first()

def get_hcps(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.HCP).offset(skip).limit(limit).all()

def create_hcp(db: Session, hcp: schemas.HCPCreate):
    db_hcp = models.HCP(**hcp.model_dump())
    db.add(db_hcp)
    db.commit()
    db.refresh(db_hcp)
    return db_hcp

def search_hcp_by_name(db: Session, name: str):
    """Simple search for HCP by name, returning the first best match or None."""
    # Using lowercase for case-insensitivity
    return db.query(models.HCP).filter(models.HCP.name.ilike(f"%{name}%")).first()


def get_interactions(db: Session, hcp_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Interaction)
    if hcp_id:
        query = query.filter(models.Interaction.hcp_id == hcp_id)
    return query.order_by(models.Interaction.date_time.desc()).offset(skip).limit(limit).all()

def get_interaction(db: Session, interaction_id: int):
    return db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()

def create_interaction(db: Session, interaction: schemas.InteractionCreate):
    interaction_data = interaction.model_dump(exclude={"follow_up"})
    db_interaction = models.Interaction(**interaction_data)
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    
    if interaction.follow_up:
        create_follow_up(db, interaction.follow_up, interaction_id=db_interaction.id)
        db.refresh(db_interaction) # Refresh to include follow_ups in return
        
    return db_interaction


def update_interaction(db: Session, interaction_id: int, interaction: schemas.InteractionUpdate):
    db_interaction = get_interaction(db, interaction_id)
    if not db_interaction:
        return None
    
    update_data = interaction.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
        
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def create_follow_up(db: Session, follow_up: schemas.FollowUpActionCreate, interaction_id: int):
    db_follow_up = models.FollowUpAction(**follow_up.model_dump(), interaction_id=interaction_id)
    db.add(db_follow_up)
    db.commit()
    db.refresh(db_follow_up)
    return db_follow_up
def get_follow_up(db: Session, follow_up_id: int):
    return db.query(models.FollowUpAction).filter(models.FollowUpAction.id == follow_up_id).first()

def update_follow_up_status(db: Session, follow_up_id: int, status: str):
    db_follow_up = get_follow_up(db, follow_up_id)
    if db_follow_up:
        db_follow_up.status = status
        db.commit()
        db.refresh(db_follow_up)
    return db_follow_up
