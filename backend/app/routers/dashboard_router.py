from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import LoginLog, Alert, Incident, PhishingReport, User
from app.schemas import DashboardData, MetricSummary, ActivityPoint, SeverityCount, AlertOut, IncidentOut
from app.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics", response_model=DashboardData)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total calculations directly from database
    total_logins = db.query(LoginLog).count()
    successful_logins = db.query(LoginLog).filter(LoginLog.status == "Success").count()
    failed_logins = db.query(LoginLog).filter(LoginLog.status == "Failed").count()
    suspicious_logins = db.query(LoginLog).filter(LoginLog.is_anomalous == True).count()
    
    phishing_reports = db.query(PhishingReport).count()
    open_incidents = db.query(Incident).filter(Incident.status.in_(["Open", "Investigating"])).count()
    critical_alerts = db.query(Alert).filter(Alert.severity == "Critical", Alert.status != "Resolved").count()
    
    # Calculate an authentic Security Health Score (0-100)
    # Deductions: -5 per critical alert, -3 per open incident, -1 per unresolved suspicious login
    score = 100 - (critical_alerts * 6) - (open_incidents * 4) - min(20, suspicious_logins * 2)
    health_score = max(35, min(100, score))

    metrics = MetricSummary(
        total_logins=total_logins,
        successful_logins=successful_logins,
        failed_logins=failed_logins,
        suspicious_logins=suspicious_logins,
        phishing_reports=phishing_reports,
        open_incidents=open_incidents,
        critical_alerts=critical_alerts,
        health_score=health_score
    )

    # Activity trend: past 7 days or buckets
    # Group login logs by date
    today = datetime.utcnow().date()
    activity_trend: List[ActivityPoint] = []
    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        day_start = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0)
        day_end = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59)
        
        day_logs = db.query(LoginLog).filter(
            LoginLog.login_time >= day_start,
            LoginLog.login_time <= day_end
        ).all()
        
        tot = len(day_logs)
        sus = sum(1 for l in day_logs if l.is_anomalous)
        fail = sum(1 for l in day_logs if l.status == "Failed")
        
        activity_trend.append(ActivityPoint(
            time=day_date.strftime("%b %d"),
            total=tot,
            suspicious=sus,
            failed=fail
        ))

    # Severity distribution from alerts & logs
    low_count = db.query(Alert).filter(Alert.severity == "Low").count()
    med_count = db.query(Alert).filter(Alert.severity == "Medium").count()
    high_count = db.query(Alert).filter(Alert.severity == "High").count()
    crit_count = db.query(Alert).filter(Alert.severity == "Critical").count()

    severity_distribution = [
        SeverityCount(name="Low", value=low_count, color="#10b981"),       # Emerald Green
        SeverityCount(name="Medium", value=med_count, color="#3b82f6"),    # Blue
        SeverityCount(name="High", value=high_count, color="#f59e0b"),      # Amber Orange
        SeverityCount(name="Critical", value=crit_count, color="#ef4444")  # Rose Red
    ]

    # Recent alerts (top 5 latest)
    recent_alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(5).all()

    # Recent incidents (top 5 latest)
    recent_incidents = db.query(Incident).order_by(Incident.created_at.desc()).limit(5).all()

    return DashboardData(
        metrics=metrics,
        activity_trend=activity_trend,
        severity_distribution=severity_distribution,
        recent_alerts=recent_alerts,
        recent_incidents=recent_incidents
    )
