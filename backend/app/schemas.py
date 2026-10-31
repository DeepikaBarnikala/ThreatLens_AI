from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field, field_validator

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    username: str  # Can be username or email
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9._-]+$")
    full_name: str = Field(min_length=1, max_length=255)
    department: Optional[str] = Field(default="General", max_length=100)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower() if isinstance(value, str) else value

    @field_validator("username", mode="before")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip().lower() if isinstance(value, str) else value

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Full name cannot be blank")
        return value

    @field_validator("department")
    @classmethod
    def clean_department(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() or "General" if value is not None else "General"

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be no more than 72 UTF-8 bytes")
        return value

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: str
    department: Optional[str] = "General"
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be no more than 72 UTF-8 bytes")
        return value

class UserOut(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Login Logs Schemas ---
class LoginLogCreate(BaseModel):
    username: str
    ip_address: str
    location: str
    device: str
    status: str = "Success"
    failed_attempts: int = 0
    login_time: Optional[datetime] = None

class LoginLogOut(BaseModel):
    id: int
    username: str
    ip_address: str
    location: str
    device: str
    login_time: datetime
    status: str
    failed_attempts: int
    risk_score: float
    severity: str
    is_anomalous: bool
    anomaly_reasons: Optional[str] = None

    class Config:
        from_attributes = True

class LogAnalyzeRequest(BaseModel):
    username: str
    ip_address: str
    location: str
    device: str
    status: str = "Success"
    failed_attempts: int = 0

class LogAnalyzeResponse(BaseModel):
    risk_score: float
    severity: str
    is_anomalous: bool
    anomaly_reasons: List[str]
    alert_created: bool
    alert_id: Optional[str] = None

# --- Alert Schemas ---
class AlertOut(BaseModel):
    id: int
    alert_id: str
    title: str
    description: str
    severity: str
    source: str
    timestamp: datetime
    status: str
    assigned_to: Optional[str] = None
    related_log_id: Optional[int] = None
    ai_explanation: Optional[str] = None

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None

class AlertEscalate(BaseModel):
    title: Optional[str] = None
    incident_type: Optional[str] = "Suspicious account access"
    assigned_to: Optional[str] = "IT Administrator"

# --- Incident Schemas ---
class ChecklistItem(BaseModel):
    id: int
    phase: str
    title: str
    description: str
    completed: bool = False

class IncidentActionOut(BaseModel):
    id: int
    incident_id: int
    action_text: str
    performed_by: str
    timestamp: datetime
    action_type: str

    class Config:
        from_attributes = True

class IncidentActionCreate(BaseModel):
    action_text: str
    action_type: str = "note"

class IncidentCreate(BaseModel):
    title: str
    incident_type: str
    severity: str
    description: str
    assigned_to: str
    alert_id: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    severity: Optional[str] = None
    checklist: Optional[str] = None

class IncidentOut(BaseModel):
    id: int
    incident_id: str
    title: str
    incident_type: str
    severity: str
    description: str
    assigned_to: str
    status: str
    created_at: datetime
    updated_at: datetime
    checklist: Optional[str] = None
    alert_id: Optional[str] = None
    actions: List[IncidentActionOut] = []

    class Config:
        from_attributes = True

# --- Phishing Schemas ---
class PhishingAnalyzeRequest(BaseModel):
    subject: str
    sender_address: str
    email_content: str
    suspicious_url: Optional[str] = None

class PhishingAnalyzeResponse(BaseModel):
    report_id: str
    prediction: str  # Phishing, Suspicious, Legitimate
    confidence_score: float
    reasons: List[str]
    recommended_action: str
    ai_explanation: Optional[str] = None

class PhishingReportOut(BaseModel):
    id: int
    report_id: str
    submitted_by: str
    subject: str
    sender_address: str
    email_content: str
    suspicious_url: Optional[str] = None
    prediction: str
    confidence_score: float
    reasons: Optional[str] = None
    recommended_action: str
    ai_explanation: Optional[str] = None
    created_at: datetime
    status: str

    class Config:
        from_attributes = True

# --- Device Schemas ---
class DeviceCreate(BaseModel):
    device_name: str
    assigned_user: str
    ip_address: str
    operating_system: str
    registration_status: Optional[str] = "Registered"

class DeviceUpdate(BaseModel):
    registration_status: Optional[str] = None
    ip_address: Optional[str] = None

class DeviceOut(BaseModel):
    id: int
    device_id: str
    device_name: str
    assigned_user: str
    ip_address: str
    operating_system: str
    registration_status: str
    last_seen: datetime

    class Config:
        from_attributes = True

# --- Policy Schemas ---
class PolicyCreate(BaseModel):
    policy_key: str
    name: str
    category: str
    description: str
    value: str
    is_enforced: bool = True

class PolicyUpdate(BaseModel):
    value: Optional[str] = None
    is_enforced: Optional[bool] = None
    description: Optional[str] = None

class PolicyOut(BaseModel):
    id: int
    policy_key: str
    name: str
    category: str
    description: str
    value: str
    is_enforced: bool
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard Schemas ---
class MetricSummary(BaseModel):
    total_logins: int
    successful_logins: int
    failed_logins: int
    suspicious_logins: int
    phishing_reports: int
    open_incidents: int
    critical_alerts: int
    health_score: int

class ActivityPoint(BaseModel):
    time: str
    total: int
    suspicious: int
    failed: int

class SeverityCount(BaseModel):
    name: str
    value: int
    color: str

class DashboardData(BaseModel):
    metrics: MetricSummary
    activity_trend: List[ActivityPoint]
    severity_distribution: List[SeverityCount]
    recent_alerts: List[AlertOut]
    recent_incidents: List[IncidentOut]

# --- AI Schemas ---
class AIExplainAlertRequest(BaseModel):
    alert_id: Optional[str] = None
    title: str
    description: str
    severity: str
    source: str

class AIExplainAlertResponse(BaseModel):
    what_happened: str
    why_suspicious: str
    possible_impact: str
    recommended_steps: List[str]
    raw_response: Optional[str] = None
    source: str = "ThreatLens GenAI Core"

class AIIncidentResponseRequest(BaseModel):
    incident_id: Optional[str] = None
    incident_type: str
    severity: str
    description: str

class AIIncidentResponseResponse(BaseModel):
    checklist: List[ChecklistItem]
    executive_summary: str
    containment_strategy: str

class AIExplainPhishingRequest(BaseModel):
    subject: str
    sender_address: str
    email_content: str
    suspicious_url: Optional[str] = None
    prediction: str

class AIExplainPhishingResponse(BaseModel):
    analysis: str
    threat_indicators: List[str]
    user_guidance: str
    admin_action: str
