import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import LoginLog, Alert, User
from app.schemas import LoginLogOut, LoginLogCreate, LogAnalyzeRequest, LogAnalyzeResponse
from app.auth import get_current_user
from app.ai.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/logs", tags=["Login Monitoring"])

@router.get("", response_model=List[LoginLogOut])
def get_logs(
    username: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    is_anomalous: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LoginLog)
    
    # If standard Employee, only view their own login activity
    if current_user.role == "Employee":
        query = query.filter(LoginLog.username == current_user.username)
    elif username:
        query = query.filter(LoginLog.username.ilike(f"%{username}%"))

    if status:
        query = query.filter(LoginLog.status == status)
    if severity:
        query = query.filter(LoginLog.severity == severity)
    if is_anomalous is not None:
        query = query.filter(LoginLog.is_anomalous == is_anomalous)

    return query.order_by(LoginLog.login_time.desc()).limit(limit).all()

@router.post("", response_model=LoginLogOut)
def record_log(
    log_data: LoginLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    login_dt = log_data.login_time or datetime.datetime.utcnow()

    # Pass through ML/heuristic anomaly detection
    analysis = anomaly_detector.analyze(
        username=log_data.username,
        ip_address=log_data.ip_address,
        location=log_data.location,
        device=log_data.device,
        status=log_data.status,
        failed_attempts=log_data.failed_attempts,
        login_time=login_dt
    )

    db_log = LoginLog(
        username=log_data.username,
        ip_address=log_data.ip_address,
        location=log_data.location,
        device=log_data.device,
        login_time=login_dt,
        status=log_data.status,
        failed_attempts=log_data.failed_attempts,
        risk_score=analysis["risk_score"],
        severity=analysis["severity"],
        is_anomalous=analysis["is_anomalous"],
        anomaly_reasons=json.dumps(analysis["anomaly_reasons"])
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    # Automatically create alert for High or Critical suspicious activity
    if analysis["is_anomalous"]:
        alert_title = f"Suspicious Login: {log_data.username} from {log_data.location}"
        alert_desc = f"Anomalous session flagged with risk score {analysis['risk_score']}/100 ({analysis['severity']}). Reasons: {', '.join(analysis['anomaly_reasons'])}."
        alert_id = f"ALT-{datetime.datetime.utcnow().strftime('%y%m%d')}-{db_log.id:04d}"

        new_alert = Alert(
            alert_id=alert_id,
            title=alert_title,
            description=alert_desc,
            severity=analysis["severity"],
            source="Login Anomaly Engine",
            timestamp=login_dt,
            status="New",
            assigned_to="IT Administrator",
            related_log_id=db_log.id
        )
        db.add(new_alert)
        db.commit()

    return db_log

@router.post("/analyze", response_model=LogAnalyzeResponse)
def analyze_log_simulation(
    request: LogAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simulation endpoint to test any login activity scenario through
    the anomaly detection engine in real time.
    """
    analysis = anomaly_detector.analyze(
        username=request.username,
        ip_address=request.ip_address,
        location=request.location,
        device=request.device,
        status=request.status,
        failed_attempts=request.failed_attempts,
        login_time=datetime.datetime.utcnow()
    )

    alert_created = False
    alert_id = None
    if analysis["is_anomalous"]:
        alert_created = True
        alert_id = f"SIM-{datetime.datetime.utcnow().strftime('%H%M%S')}"

    return LogAnalyzeResponse(
        risk_score=analysis["risk_score"],
        severity=analysis["severity"],
        is_anomalous=analysis["is_anomalous"],
        anomaly_reasons=analysis["anomaly_reasons"],
        alert_created=alert_created,
        alert_id=alert_id
    )
