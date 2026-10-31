import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Incident, IncidentAction, User
from app.schemas import (
    IncidentOut, IncidentCreate, IncidentUpdate,
    IncidentActionOut, IncidentActionCreate
)
from app.auth import get_current_user, require_roles
from app.ai.genai_assistant import genai_assistant

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.get("", response_model=List[IncidentOut])
def get_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if severity:
        query = query.filter(Incident.severity == severity)
    if incident_type:
        query = query.filter(Incident.incident_type == incident_type)

    return query.order_by(Incident.created_at.desc()).limit(limit).all()

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("", response_model=IncidentOut)
async def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["IT Administrator", "Security Manager", "Admin"]))
):
    # Generate GenAI 7-step response checklist
    ai_plan = await genai_assistant.generate_incident_checklist(
        incident_type=incident_in.incident_type,
        severity=incident_in.severity,
        description=incident_in.description
    )

    incident_count = db.query(Incident).count() + 1
    new_inc_id = f"INC-{datetime.datetime.utcnow().strftime('%y%m')}-{incident_count:03d}"

    db_incident = Incident(
        incident_id=new_inc_id,
        title=incident_in.title,
        incident_type=incident_in.incident_type,
        severity=incident_in.severity,
        description=incident_in.description,
        assigned_to=incident_in.assigned_to,
        status="Open",
        checklist=json.dumps(ai_plan.get("checklist", [])),
        alert_id=incident_in.alert_id
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    # Initial action in timeline
    action = IncidentAction(
        incident_id=db_incident.id,
        action_text=f"Incident registered by {current_user.full_name}. Standard NIST 7-phase incident response checklist initialized.",
        performed_by=current_user.full_name,
        action_type="status_change"
    )
    db.add(action)
    db.commit()
    db.refresh(db_incident)

    return db_incident

@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident(
    incident_id: int,
    updates: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["IT Administrator", "Security Manager", "Admin"]))
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    timeline_notes = []

    if updates.status is not None and updates.status != incident.status:
        timeline_notes.append(f"Status changed from {incident.status} to {updates.status}")
        incident.status = updates.status
    if updates.assigned_to is not None and updates.assigned_to != incident.assigned_to:
        timeline_notes.append(f"Reassigned to {updates.assigned_to}")
        incident.assigned_to = updates.assigned_to
    if updates.severity is not None and updates.severity != incident.severity:
        timeline_notes.append(f"Severity adjusted to {updates.severity}")
        incident.severity = updates.severity
    if updates.checklist is not None:
        incident.checklist = updates.checklist
        timeline_notes.append("Incident response checklist updated")

    incident.updated_at = datetime.datetime.utcnow()

    for note in timeline_notes:
        action = IncidentAction(
            incident_id=incident.id,
            action_text=f"{note} by {current_user.full_name}",
            performed_by=current_user.full_name,
            action_type="status_change"
        )
        db.add(action)

    db.commit()
    db.refresh(incident)
    return incident

@router.post("/{incident_id}/actions", response_model=IncidentActionOut)
def add_incident_action(
    incident_id: int,
    action_in: IncidentActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["IT Administrator", "Security Manager", "Admin"]))
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    new_action = IncidentAction(
        incident_id=incident.id,
        action_text=action_in.action_text,
        performed_by=current_user.full_name,
        action_type=action_in.action_type
    )
    db.add(new_action)
    incident.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(new_action)

    return new_action
