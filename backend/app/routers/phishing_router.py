import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PhishingReport, Alert, User
from app.schemas import PhishingAnalyzeRequest, PhishingAnalyzeResponse, PhishingReportOut
from app.auth import get_current_user
from app.ai.phishing_detector import phishing_detector
from app.ai.genai_assistant import genai_assistant

router = APIRouter(prefix="/phishing", tags=["Phishing Email Detection"])

@router.post("/analyze", response_model=PhishingAnalyzeResponse)
async def analyze_phishing_email(
    request: PhishingAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Run ML + heuristic classification
    analysis = phishing_detector.analyze(
        subject=request.subject,
        sender_address=request.sender_address,
        email_content=request.email_content,
        suspicious_url=request.suspicious_url
    )

    # 2. Get GenAI explanation
    ai_expl = await genai_assistant.explain_phishing(
        subject=request.subject,
        sender=request.sender_address,
        content=request.email_content,
        suspicious_url=request.suspicious_url or "",
        prediction=analysis["prediction"]
    )

    # 3. Save into Database
    report_count = db.query(PhishingReport).count() + 1
    report_id = f"PHISH-{datetime.datetime.utcnow().strftime('%y%m')}-{report_count:03d}"

    db_report = PhishingReport(
        report_id=report_id,
        submitted_by=current_user.full_name or current_user.username,
        subject=request.subject,
        sender_address=request.sender_address,
        email_content=request.email_content,
        suspicious_url=request.suspicious_url,
        prediction=analysis["prediction"],
        confidence_score=analysis["confidence_score"],
        reasons=json.dumps(analysis["reasons"]),
        recommended_action=analysis["recommended_action"],
        ai_explanation=json.dumps(ai_expl),
        status="Analyzed"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # If classified as Phishing, auto-create a Security Alert!
    if analysis["prediction"] in ["Phishing", "Suspicious"]:
        severity = "High" if analysis["prediction"] == "Phishing" else "Medium"
        new_alert = Alert(
            alert_id=f"ALT-PHISH-{db_report.id:04d}",
            title=f"Potential Phishing Email: '{request.subject[:40]}...'",
            description=f"Submitted by {current_user.full_name}. Classified as {analysis['prediction']} with {analysis['confidence_score']}% confidence. Sender: {request.sender_address}.",
            severity=severity,
            source="Phishing Analyzer",
            timestamp=datetime.datetime.utcnow(),
            status="New",
            assigned_to="IT Administrator"
        )
        db.add(new_alert)
        db.commit()

    return PhishingAnalyzeResponse(
        report_id=report_id,
        prediction=analysis["prediction"],
        confidence_score=analysis["confidence_score"],
        reasons=analysis["reasons"],
        recommended_action=analysis["recommended_action"],
        ai_explanation=json.dumps(ai_expl)
    )

@router.get("/reports", response_model=List[PhishingReportOut])
def get_phishing_reports(
    prediction: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PhishingReport)
    # If standard Employee, see only their submissions
    if current_user.role == "Employee":
        query = query.filter(PhishingReport.submitted_by == current_user.full_name)
    if prediction:
        query = query.filter(PhishingReport.prediction == prediction)
    if status:
        query = query.filter(PhishingReport.status == status)

    return query.order_by(PhishingReport.created_at.desc()).limit(limit).all()
