# ThreatLens AI – AI-Powered Security Incident Assistant

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg?logo=react)](https://react.dev)
[![Scikit-Learn](https://img.shields.io/badge/ML-Isolation_Forest_&_TF--IDF-F7931E.svg?logo=scikit-learn)](https://scikit-learn.org)
[![Python](https://img.shields.io/badge/Python-3.11_|_3.12_|_3.13-3776AB.svg?logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ThreatLens AI** is a cybersecurity monitoring and incident management platform built specifically for small organizations, colleges, and community institutions that lack dedicated 24/7 Security Operations Centers (SOC).

---

## 🚀 Key Features

1. **4-Tier Role-Based Authentication:**
   - **Admin (CISO):** Complete governance, user directory management, and policy enforcement.
   - **Security Manager:** High-level executive analytics, posture trends, and management reports.
   - **IT Administrator:** Real-time anomaly inspection, alert triage, and NIST 7-phase response execution.
   - **Employee / Staff:** Self-service phishing scanner, personal device registration, and safety guidance.

2. **Machine Learning Login Anomaly Detection:**
   - Uses **Isolation Forest (Scikit-Learn)** and velocity heuristic rules to inspect logins in real time.
   - Evaluates:
     - Rapid consecutive failed login attempts (brute-force)
     - Abnormal off-hours timestamps
     - Unfamiliar or foreign geolocations (impossible travel)
     - Unknown or automated device agents (Curl, Python, Tor exit nodes)
   - Assigns a granular **Risk Score (0–100)** and auto-generates security alerts for High and Critical anomalies.

3. **Hybrid AI Phishing Email Detection:**
   - Powered by **TF-IDF Vectorization and Logistic Regression** plus security heuristic scoring.
   - Detects psychological urgency, deceptive URLs, brand impersonation, and credential harvesting.
   - Provides confidence scores, breakdown reasons, and immediate safe recommendations.

4. **Generative AI Cyber Copilot & Assistant:**
   - Real-time LLM integration (Google Gemini API / Groq API) with guaranteed deterministic offline fallbacks.
   - **Alert Explanations:** What happened? Why is it suspicious? What is the impact? What should the administrator do next?
   - **Incident Response Checklists:** Structured NIST 7-phase step-by-step response plans (Identify, Verify, Contain, Investigate, Recover, Document, Prevent) with checkable milestones and audit timeline trails.

5. **Operational Modules:**
   - **SOC Dashboard:** Real-time metrics calculated from database records, Recharts analytics, and health scores.
   - **Device Registry:** Endpoint inventory with 1-click device quarantine controls.
   - **Policy Governance:** Configurable organizational thresholds (lockout limits, geofencing, auto-quarantine).
   - **Executive Security Reports:** Print-ready management briefings and defense compliance summaries.

---

## 📂 Project Structure

```
ThreadLens AI/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── anomaly_detector.py   # Scikit-learn Isolation Forest Anomaly Engine
│   │   │   ├── phishing_detector.py  # TF-IDF + Logistic Regression Phishing Engine
│   │   │   └── genai_assistant.py    # Gemini / Groq / SANS Fallback GenAI Copilot
│   │   ├── routers/
│   │   │   ├── auth_router.py        # Authentication & JWT endpoints
│   │   │   ├── dashboard_router.py   # Aggregated metrics & analytics
│   │   │   ├── logs_router.py        # Login telemetry & live simulation
│   │   │   ├── alerts_router.py      # Alert triage & incident escalation
│   │   │   ├── incidents_router.py   # Incidents, checklists & audit timeline
│   │   │   ├── phishing_router.py    # Phishing submission & inspection
│   │   │   ├── ai_router.py          # GenAI assistance endpoints
│   │   │   ├── devices_router.py     # Device registry & quarantine
│   │   │   ├── policies_router.py    # Security policies & thresholds
│   │   │   └── users_router.py       # User directory (Admin)
│   │   ├── auth.py                   # Password hashing (bcrypt) & JWT RBAC
│   │   ├── config.py                 # Application settings & environment vars
│   │   ├── database.py               # SQLAlchemy database session setup
│   │   ├── models.py                 # SQLAlchemy relational schema
│   │   ├── schemas.py                # Pydantic v2 validation models
│   │   ├── seed_data.py              # Synthetic realistic demonstration data
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── test_api.py                   # Automated end-to-end API test suite
│   ├── run.py                        # Uvicorn startup runner
│   ├── requirements.txt              # Python dependencies
│   └── .env.example                  # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Axios API client with auth interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication state & role checks
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Dark navy responsive navigation
│   │   │   ├── Navbar.jsx            # Top bar with demo role switcher
│   │   │   ├── MetricCard.jsx        # Telemetry metric cards
│   │   │   ├── SeverityBadge.jsx     # Color-coded severity indicators
│   │   │   ├── StatusBadge.jsx       # Status workflow indicators
│   │   │   └── AIModal.jsx           # GenAI explanation modal
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Auth page with 1-click demo logins
│   │   │   ├── Dashboard.jsx         # Executive SOC dashboard & Recharts
│   │   │   ├── LoginMonitoring.jsx   # Telemetry table & simulation modal
│   │   │   ├── Alerts.jsx            # Security alert triage & escalation
│   │   │   ├── PhishingDetection.jsx # Phishing scanner & sample loader
│   │   │   ├── Incidents.jsx         # NIST response checklist & timeline
│   │   │   ├── AIAssistant.jsx       # Interactive cyber copilot hub
│   │   │   ├── Devices.jsx           # Device registry & quarantine
│   │   │   ├── Policies.jsx          # Security policies & threshold adjustment
│   │   │   ├── Reports.jsx           # Executive print-ready report
│   │   │   └── UserManagement.jsx    # User administration (Admin only)
│   │   ├── App.jsx                   # Main layout & route router
│   │   ├── main.jsx                  # React mount
│   │   └── index.css                 # Custom Cybersecurity SaaS styling
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js                # Vite build & proxy configuration
├── ARCHITECTURE.md                   # System Architecture & Mermaid diagrams
├── PRESENTATION.md                   # Hackathon Pitch & Demo Walkthrough Script
└── README.md                         # Project documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Python:** 3.10, 3.11, 3.12, or 3.13
- **Node.js:** v18+ and `npm`

---

### Step 1: Run the Backend (FastAPI)

1. Open a terminal in the `backend/` directory:
   ```bash
   cd "backend"
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables and generate a unique JWT signing key:
   ```bash
   cp .env.example .env
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```
   Copy the generated value into `SECRET_KEY` in `.env`. The backend requires a key
   of at least 32 characters; do not commit or share the generated key.

5. Start the backend server:
   ```bash
   python run.py
   ```
   *The server will start at `http://localhost:8000`. Database tables and synthetic demo records are seeded automatically upon first boot!*
   - Interactive Swagger API Documentation: `http://localhost:8000/docs`

---

### Step 2: Run the Frontend (React + Vite)

1. Open a second terminal in the `frontend/` directory:
   ```bash
   cd "frontend"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:5173
   ```

---

## 🔑 Demo User Accounts

All accounts use the universal demo password: **`Admin@123`**

| Role | Username | Email | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@threatlens.ai` | Superuser: User Directory, Policies, Alerts, Full Incidents |
| **Security Manager** | `secmanager` | `secmanager@threatlens.ai` | Posture Analytics, Incidents, Policy Tuning, Executive Reports |
| **IT Administrator** | `itadmin` | `itadmin@threatlens.ai` | Telemetry Monitoring, Alert Triage, NIST Response Checklists |
| **Employee** | `employee` | `employee@threatlens.ai` | Submit Phishing Emails, Personal Device Status, AI Guidance |

> **Pro-Tip:** The login page includes **1-Click Demo Login** buttons for presentations. New registrations are restricted to employee access.

---

## 🧪 Automated Testing

A comprehensive automated test suite covers all REST endpoints, ML anomaly evaluation, TF-IDF phishing detection, and GenAI fallbacks:

```bash
cd backend
python test_auth.py
python test_api.py
```

Output:
```
Health Check: 200 {'status': 'healthy', 'ai_status': 'active'}
Admin Login: 200 Admin
Auth Me: 200 Sarah Chen (CISO / Admin)
Dashboard Metrics: 200 Total Logins: 11 Health Score: 84
Anomaly Analysis: 200 Risk: 100.0 Severity: Critical Reasons: 6
Phishing Analysis: 200 Prediction: Phishing Confidence: 87.4%
AI Explain Alert: 200 What happened: ThreatLens detected a surge...
Policies Count: 5
Devices Count: 5

[ALL 8 BACKEND API AND ML TEST SUITES PASSED SUCCESSFULLY!]
```

---

## 🌐 REST API Endpoints Overview

- **Authentication:**
  - `POST /api/auth/register` – Create an employee account and receive a JWT
  - `POST /api/auth/login` – Validate credentials and obtain JWT Bearer token
  - `GET /api/auth/me` – Retrieve profile and role of authenticated user
- **Dashboard:**
  - `GET /api/dashboard/metrics` – Dynamically aggregated metrics, health score & charts
- **Login Monitoring:**
  - `GET /api/logs` – Filterable telemetry log feed
  - `POST /api/logs` – Ingest new log & trigger ML Isolation Forest anomaly detection
  - `POST /api/logs/analyze` – Live simulation anomaly sandbox
- **Security Alerts:**
  - `GET /api/alerts` – Filter by severity, status, source
  - `PATCH /api/alerts/{id}` – Mark alert resolved or reassign
  - `POST /api/alerts/{id}/escalate` – Escalate alert directly into an incident
- **Incident Management:**
  - `GET /api/incidents` – Incident registry with status filters
  - `GET /api/incidents/{id}` – Full detail including actions timeline & checklist
  - `POST /api/incidents` – Declare incident with NIST 7-phase checklist
  - `PATCH /api/incidents/{id}` – Update status and checklist toggle items
  - `POST /api/incidents/{id}/actions` – Append action or containment note to timeline
- **Phishing Detection:**
  - `POST /api/phishing/analyze` – Classify email with TF-IDF and heuristic rules
  - `GET /api/phishing/reports` – Retrieve submission audit records
- **Generative AI Assistant:**
  - `POST /api/ai/explain-alert` – Generate 4-part plain English alert breakdown
  - `POST /api/ai/incident-response` – Synthesize 7-phase response checklist
  - `POST /api/ai/explain-phishing` – Deep-dive phishing explanation & recommendations
- **Device & Policy Governance:**
  - `GET /api/devices` | `POST /api/devices` | `PATCH /api/devices/{id}`
  - `GET /api/policies` | `POST /api/policies` | `PATCH /api/policies/{id}`
- **User Management (Admin Only):**
  - `GET /api/users` | `POST /api/users` | `PATCH /api/users/{id}/toggle-status`

---

## 🛡️ Security & Privacy Notice
- Passwords are encrypted with salt using standard `bcrypt`.
- New self-service registrations receive the `Employee` role; elevated roles require an administrator.
- Protected API requests use expiring JWT bearer tokens signed with the local `SECRET_KEY`.
- API keys (Gemini / Groq) are strictly stored server-side in `.env` and never exposed to the frontend.
- Fallback templates guarantee 100% operational functionality without an external API key.
- All seeded records and logs are synthetic for safe demonstration.
