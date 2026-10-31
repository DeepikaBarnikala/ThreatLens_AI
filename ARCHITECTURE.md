# ThreatLens AI – System Architecture & Technical Specification

ThreatLens AI is an AI-powered cybersecurity monitoring and incident management platform engineered specifically for colleges, universities, and small-to-medium organizations without dedicated 24/7 Security Operations Centers (SOC).

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React + Vite + Recharts)"]
        UI["Web Dashboard UI\n(Role-Based Views)"]
        AuthContext["Auth Context & JWT Token Manager"]
        ApiClient["Axios API Client (Interceptor Auth)"]
    end

    subgraph Gateway["FastAPI REST Backend (:8000)"]
        RouterAuth["Auth Router & BCrypt"]
        RouterDash["Dashboard Metrics Aggregator"]
        RouterLogs["Login Monitoring & Stream"]
        RouterAlerts["Alerts & Escalation"]
        RouterIncidents["Incidents & NIST Checklist"]
        RouterPhish["Phishing Triage"]
        RouterAI["GenAI Assistant Hub"]
        RouterDevices["Device Registry"]
        RouterPolicies["Policy Governance"]
    end

    subgraph AI_Core["AI / ML & Intelligence Engines"]
        IForest["Isolation Forest Anomaly Detector\n(Statistical & Multi-Factor)"]
        TFIDF["TF-IDF + Logistic Regression\n(Phishing Classifier)"]
        LLM["Generative AI Assistant\n(Gemini 1.5 Flash / Groq / Fallback SOP)"]
    end

    subgraph Storage["Persistence Layer"]
        SQLite[("threatlens.db\n(SQLAlchemy ORM)")]
    end

    UI --> AuthContext
    AuthContext --> ApiClient
    ApiClient --> RouterAuth
    ApiClient --> RouterDash
    ApiClient --> RouterLogs
    ApiClient --> RouterAlerts
    ApiClient --> RouterIncidents
    ApiClient --> RouterPhish
    ApiClient --> RouterAI
    ApiClient --> RouterDevices
    ApiClient --> RouterPolicies

    RouterLogs --> IForest
    RouterPhish --> TFIDF
    RouterAI --> LLM
    RouterIncidents --> LLM
    RouterAlerts --> LLM

    RouterAuth --> SQLite
    RouterDash --> SQLite
    RouterLogs --> SQLite
    RouterAlerts --> SQLite
    RouterIncidents --> SQLite
    RouterPhish --> SQLite
    RouterDevices --> SQLite
    RouterPolicies --> SQLite
```

---

## 2. Machine Learning Anomaly Detection Pipeline

```mermaid
flowchart LR
    A["Raw Login Stream\n(User, IP, Device, Time, Failures)"] --> B["Feature Extractor\n- Velocity & Failed Attempts\n- Geolocation Anomaly Flag\n- Unknown Device Fingerprint\n- Off-Hours Indicator"]
    B --> C["Isolation Forest ML Model\n(Statistical Outlier Scoring)"]
    B --> D["Heuristic Rule Engine\n(Threat Intelligence Weights)"]
    C & D --> E["Composite Risk Score Calculation\n(Normalized 0 - 100)"]
    E --> F{"Severity Classifier"}
    F -->|"Score 0 - 29"| G["Low Severity\n(Audit Only)"]
    F -->|"Score 30 - 49"| H["Medium Severity\n(Flagged)"]
    F -->|"Score 50 - 74"| I["High Severity\n(Auto-Alert Triggered)"]
    F -->|"Score 75 - 100"| J["Critical Severity\n(Auto-Alert + Immediate Quarantine)"]
```

---

## 3. Incident Response NIST 7-Phase Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as IT Administrator
    participant ThreatLens as ThreatLens AI Platform
    participant GenAI as Generative AI Engine
    participant DB as SQLite DB

    Admin->>ThreatLens: Escalate Alert to Incident / Declare Incident
    ThreatLens->>GenAI: Request Structured NIST 7-Step Plan
    GenAI-->>ThreatLens: Returns Phase Checklist (Identify, Verify, Contain, Investigate, Recover, Document, Prevent)
    ThreatLens->>DB: Persist Incident & Initialized Checklist
    Admin->>ThreatLens: Complete Phase 3: Invalidate Tokens / Drop IP
    ThreatLens->>DB: Update Checklist Item & Append Action Audit Trail
    ThreatLens-->>Admin: Real-time Timeline & Progress Meter Updated
```

---

## 4. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ login_logs : "authenticates"
    users ||--o{ devices : "owns"
    alerts ||--o| incidents : "escalates to"
    incidents ||--o{ incident_actions : "contains timeline"
    users ||--o{ phishing_reports : "submits"

    users {
        int id PK
        string email UK
        string username UK
        string hashed_password
        string full_name
        string role
        string department
        boolean is_active
        datetime last_login
    }

    login_logs {
        int id PK
        string username
        string ip_address
        string location
        string device
        datetime login_time
        string status
        int failed_attempts
        float risk_score
        string severity
        boolean is_anomalous
        text anomaly_reasons
    }

    alerts {
        int id PK
        string alert_id UK
        string title
        text description
        string severity
        string source
        datetime timestamp
        string status
        string assigned_to
        int related_log_id
    }

    incidents {
        int id PK
        string incident_id UK
        string title
        string incident_type
        string severity
        text description
        string assigned_to
        string status
        text checklist
        string alert_id
    }

    incident_actions {
        int id PK
        int incident_id FK
        text action_text
        string performed_by
        datetime timestamp
        string action_type
    }

    phishing_reports {
        int id PK
        string report_id UK
        string submitted_by
        string subject
        string sender_address
        text email_content
        string suspicious_url
        string prediction
        float confidence_score
        text reasons
        text recommended_action
        text ai_explanation
    }

    devices {
        int id PK
        string device_id UK
        string device_name
        string assigned_user
        string ip_address
        string operating_system
        string registration_status
        datetime last_seen
    }

    policies {
        int id PK
        string policy_key UK
        string name
        string category
        text description
        string value
        boolean is_enforced
    }
```
