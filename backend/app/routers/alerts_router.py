import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Alert, Incident, IncidentAction, User
from app.schemas import AlertOut, AlertUpdate, AlertEscalate, IncidentOut
from app.auth import get_current_user, require_roles
from app.ai.genai_assistant import genai_assistant

router = APIRouter(prefix="/alerts", tags=["Security Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(
    severity: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if search:
        query = query.filter(
            (Alert.title.ilike(f"%{search}%")) |
            (Alert.description.ilike(f"%{search}%")) |
            (Alert.alert_id.ilike(f"%{search}%"))
        )

    return query.order_by(Alert.timestamp.desc()).limit(limit).all()

@router.get("/{alert_id}", response_model=AlertOut)
def get_alert_detail(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: int,
    updates: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["IT Administrator", "Security Manager", "Admin"]))
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if updates.status is not None:
        alert.status = updates.status
    if updates.assigned_to is not None:
        alert.assigned_to = updates.assigned_to

    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/escalate", response_model=IncidentOut)
async def escalate_alert_to_incident(
    alert_id: int,
    escalation_data: AlertEscalate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["IT Administrator", "Security Manager", "Admin"]))
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Generate incident response checklist
    inc_type = escalation_data.incident_type or "Suspicious account access"
    assigned = escalation_data.assigned_to or current_user.full_name
    title = escalation_data.title or f"Incident Escalation: {alert.title}"

    ai_plan = await genai_assistant.generate_incident_checklist(
        incident_type=inc_type,
        severity=alert.severity,
        description=alert.description
    )

    incident_count = db.query(Incident).count() + 1
    new_inc_id = f"INC-{datetime.datetime.utcnow().strftime('%y%m')}-{incident_count:03d}"

    new_incident = Incident(
        incident_id=new_inc_id,
        title=title,
        incident_type=inc_type,
        severity=alert.severity,
        description=f"Escalated from Alert [{alert.alert_id}]: {alert.description}",
        assigned_to=assigned,
        status="Open",
        checklist=json.dumps(ai_plan.get("checklist", [])),
        alert_id=alert.alert_id
    )
    db.add(new_incident)
    
    # Mark alert as Investigating
    alert.status = "Investigating"
    db.commit()
    db.refresh(new_incident)

    # Add initial timeline action
    initial_action = IncidentAction(
        incident_id=new_incident.id,
        action_text=f"Incident escalated from Alert {alert.alert_id} by {current_user.full_name}.",
        performed_by=current_user.full_name,
        action_type="status_change"
    )
    db.add(initial_action)
    db.commit()
    db.refresh(new_incident)

    return new_incident
