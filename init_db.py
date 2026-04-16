from backend.database import SessionLocal, engine, Base
from backend import models, crud, schemas
from datetime import datetime, timedelta

def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Clear existing data to ensure a fresh start if we want to re-seed
        # Or just check if HCPs exist.
        if db.query(models.HCP).count() == 0:
            hcps = [
                schemas.HCPCreate(name="Dr. John Smith", specialty="Cardiology", hospital="City Heart Center", location="Downtown", contact_info="john.smith@example.com"),
                schemas.HCPCreate(name="Dr. Sarah Johnson", specialty="Neurology", hospital="Neuro-Life Institute", location="North Side", contact_info="sarah.johnson@example.com"),
                schemas.HCPCreate(name="Dr. Emily Davis", specialty="Oncology", hospital="Victory Cancer Care", location="West End", contact_info="emily.davis@example.com"),
                schemas.HCPCreate(name="Dr. Michael Chen", specialty="Pediatrics", hospital="Sunrise Children's", location="South Side", contact_info="m.chen@hospital.com"),
                schemas.HCPCreate(name="Dr. Lisa Williams", specialty="Dermatology", hospital="ClearSkin Clinic", location="Upper East Side", contact_info="lisa.w@clinic.org"),
                schemas.HCPCreate(name="Dr. Robert Miller", specialty="Orthopedics", hospital="Bone & Joint Hospital", location="Medical District", contact_info="r.miller@med.edu"),
            ]

            db_hcps = []
            for hcp_schema in hcps:
                db_hcp = crud.create_hcp(db, hcp_schema)
                db_hcps.append(db_hcp)
            
            # Seed some interactions
            interactions = [
                schemas.InteractionCreate(
                    hcp_id=db_hcps[0].id,
                    type="Meeting",
                    date_time=datetime.now(),
                    notes="Discussed new cardiology clinical trials.",
                    outcomes="Interested in prescribing the new medication.",
                    sentiment="Positive",
                    follow_up=schemas.FollowUpActionCreate(
                        description="Send clinical trial data",
                        due_date=datetime.now() + timedelta(days=2)
                    )
                ),
                schemas.InteractionCreate(
                    hcp_id=db_hcps[1].id,
                    type="Call",
                    date_time=datetime.now() - timedelta(days=1),
                    notes="Phone call regarding pediatric dosage.",
                    outcomes="Dosage guide sent.",
                    sentiment="Neutral",
                    follow_up=schemas.FollowUpActionCreate(
                        description="Follow up on dosage feedback",
                        due_date=datetime.now() + timedelta(days=7)
                    )
                ),
                schemas.InteractionCreate(
                    hcp_id=db_hcps[2].id,
                    type="Email",
                    date_time=datetime.now() - timedelta(days=2),
                    notes="Sent oncology product brochure.",
                    outcomes="Awaiting reply.",
                    sentiment="Neutral"
                )
            ]
            for int_schema in interactions:
                crud.create_interaction(db, int_schema)

                
            print("Database seeded with HCPs, Interactions, and Follow-ups.")
        else:
            print("Database already populated.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

