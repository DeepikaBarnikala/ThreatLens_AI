from fastapi import APIRouter, Depends
from app.schemas import (
    AIExplainAlertRequest, AIExplainAlertResponse,
    AIIncidentResponseRequest, AIIncidentResponseResponse,
    AIExplainPhishingRequest, AIExplainPhishingResponse
)
from app.models import User
from app.auth import get_current_user
from app.ai.genai_assistant import genai_assistant

router = APIRouter(prefix="/ai", tags=["Generative AI Assistant"])

@router.post("/explain-alert", response_model=AIExplainAlertResponse)
async def explain_alert(
    request: AIExplainAlertRequest,
    current_user: User = Depends(get_current_user)
):
    result = await genai_assistant.explain_alert(
        alert_title=request.title,
        description=request.description,
        severity=request.severity,
        source=request.source
    )
    return AIExplainAlertResponse(
        what_happened=result.get("what_happened", "Analysis complete."),
        why_suspicious=result.get("why_suspicious", "Deviates from security profile."),
        possible_impact=result.get("possible_impact", "Potential unauthorized lateral access."),
        recommended_steps=result.get("recommended_steps", []),
        raw_response=None,
        source=result.get("source", "ThreatLens GenAI Core")
    )

@router.post("/incident-response", response_model=AIIncidentResponseResponse)
async def generate_incident_response(
    request: AIIncidentResponseRequest,
    current_user: User = Depends(get_current_user)
):
    result = await genai_assistant.generate_incident_checklist(
        incident_type=request.incident_type,
        severity=request.severity,
        description=request.description
    )
    return AIIncidentResponseResponse(
        checklist=result.get("checklist", []),
        executive_summary=result.get("executive_summary", "Incident response plan generated."),
        containment_strategy=result.get("containment_strategy", "Isolate endpoint and reset user tokens.")
    )

@router.post("/explain-phishing", response_model=AIExplainPhishingResponse)
async def explain_phishing(
    request: AIExplainPhishingRequest,
    current_user: User = Depends(get_current_user)
):
    result = await genai_assistant.explain_phishing(
        subject=request.subject,
        sender=request.sender_address,
        content=request.email_content,
        suspicious_url=request.suspicious_url or "",
        prediction=request.prediction
    )
    return AIExplainPhishingResponse(
        analysis=result.get("analysis", "Phishing analysis complete."),
        threat_indicators=result.get("threat_indicators", []),
        user_guidance=result.get("user_guidance", "Do not interact with the message."),
        admin_action=result.get("admin_action", "Quarantine sender domain.")
    )
