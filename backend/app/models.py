import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Employee")  # Employee, IT Administrator, Security Manager, Admin
    department = Column(String(100), default="General")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class LoginLog(Base):
    __tablename__ = "login_logs"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), index=True, nullable=False)
    ip_address = Column(String(50), nullable=False)
    location = Column(String(150), nullable=False)
    device = Column(String(150), nullable=False)
    login_time = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    status = Column(String(20), nullable=False)  # Success, Failed
    failed_attempts = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)  # 0 to 100
    severity = Column(String(20), default="Low")  # Low, Medium, High, Critical
    is_anomalous = Column(Boolean, default=False)
    anomaly_reasons = Column(Text, nullable=True)  # JSON or comma-separated list

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., ALT-2026-101
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)  # Low, Medium, High, Critical
    source = Column(String(100), nullable=False)  # Login Anomaly Engine, Phishing Analyzer, etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    status = Column(String(50), default="New")  # New, Acknowledged, Investigating, Resolved
    assigned_to = Column(String(100), nullable=True)
    related_log_id = Column(Integer, nullable=True)
    ai_explanation = Column(Text, nullable=True)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., INC-2026-001
    title = Column(String(255), nullable=False)
    incident_type = Column(String(100), nullable=False)  # Brute-force, Phishing, Unknown device, etc.
    severity = Column(String(20), nullable=False)  # Low, Medium, High, Critical
    description = Column(Text, nullable=False)
    assigned_to = Column(String(100), nullable=False)
    status = Column(String(50), default="Open")  # Open, Investigating, Contained, Resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    checklist = Column(Text, nullable=True)  # JSON array of checklist items
    alert_id = Column(String(50), nullable=True)

    actions = relationship("IncidentAction", back_populates="incident", cascade="all, delete-orphan")

class IncidentAction(Base):
    __tablename__ = "incident_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    action_text = Column(Text, nullable=False)
    performed_by = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action_type = Column(String(50), default="note")  # status_change, checklist, note, containment

    incident = relationship("Incident", back_populates="actions")

class PhishingReport(Base):
    __tablename__ = "phishing_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., PHISH-2026-001
    submitted_by = Column(String(100), nullable=False)
    subject = Column(String(255), nullable=False)
    sender_address = Column(String(255), nullable=False)
    email_content = Column(Text, nullable=False)
    suspicious_url = Column(String(500), nullable=True)
    prediction = Column(String(50), nullable=False)  # Phishing, Suspicious, Legitimate
    confidence_score = Column(Float, nullable=False)  # 0.0 - 100.0
    reasons = Column(Text, nullable=True)  # JSON array of reasons
    recommended_action = Column(Text, nullable=False)
    ai_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="Analyzed")  # Analyzed, Quarantined, Dismissed, Escalated

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., DEV-101
    device_name = Column(String(150), nullable=False)
    assigned_user = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=False)
    operating_system = Column(String(100), nullable=False)
    registration_status = Column(String(50), default="Registered")  # Registered, Unregistered, Quarantined
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_key = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)  # Access Control, Authentication, Awareness, Device
    description = Column(Text, nullable=False)
    value = Column(String(255), nullable=False)
    is_enforced = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
