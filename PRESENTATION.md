# ThreatLens AI – Hackathon Presentation & Pitch Deck

## Pitch Title:
**ThreatLens AI: Autonomous Security Operations & Incident Response Assistant for Small Organizations and Colleges**

---

### Slide 1: The Critical Problem
- **The Gap:** Small colleges, community schools, municipal clinics, and non-profits hold sensitive student and financial records, yet 74% lack a dedicated cybersecurity team or 24/7 Security Operations Center (SOC).
- **The Pain:** Commercial enterprise SIEM tools (Splunk, CrowdStrike, Sentinel) cost \$50,000+ per year and drown non-expert IT generalists in hundreds of cryptic telemetry alerts.
- **The Consequence:** Credential stuffing, account takeovers, and spear-phishing attacks go undetected for an average of 212 days.

---

### Slide 2: The Solution – ThreatLens AI
**An intelligent, lightweight, end-to-end security monitoring and incident remediation platform.**
1. **Behavioral Anomaly Detection:** Machine Learning model (Isolation Forest) evaluates login velocity, impossible travel, and device fingerprints to score risk from 0 to 100 in milliseconds.
2. **AI Phishing Triage:** Employees submit suspicious emails; a hybrid TF-IDF + heuristic engine classifies threats and provides confidence scores.
3. **Generative AI Cyber Copilot:** Converts raw security signals into plain English (What happened? Why is it suspicious? What is the impact? What should the administrator do next?).
4. **NIST 7-Phase Incident Workflow:** Step-by-step containment checklists with real-time audit logging.

---

### Slide 3: Core Innovations & Technical Highlights
- **Explainable Anomaly Scoring:** Rather than a black-box percentage, ThreatLens calculates granular risk factors:
  - 0–29: Low (Audited)
  - 30–49: Medium (Flagged)
  - 50–74: High (Automated Alert Triggered)
  - 75–100: Critical (Immediate Containment Protocol)
- **Zero-Exposure GenAI Integration:** LLM calls (Gemini 1.5 Flash / Groq) execute strictly backend-side with zero frontend API key leakage.
- **Deterministic Defensive Fallbacks:** Guaranteed operational continuity in offline or air-gapped environments via pre-compiled SANS/NIST incident response matrices.

---

### Slide 4: 4-Tier Role-Based Experience
| Role | Primary User Journey |
| :--- | :--- |
| **Admin (CISO)** | User provisioning, security policy enforcement, compliance oversight, full incident audit. |
| **Security Manager** | SOC metric analytics, executive threat reporting, risk distribution tracking. |
| **IT Administrator** | Anomaly investigation, alert triage, GenAI checklist execution, device quarantine. |
| **Employee** | Phishing scanner submission, personal device status, cybersecurity guidance. |

---

### Slide 5: Live Demo Walkthrough (3-Minute Script)
1. **1-Click Demo Login:** Start on the login screen. Click the **IT Administrator** demo pill to instantly authenticate.
2. **SOC Dashboard:** Highlight the real-time calculated health score (84%), login trend chart, and alert severity donut.
3. **Live Anomaly Simulation:** Navigate to **Login Monitoring**. Click *Simulate Anomaly Scenario*, select "Brute-Force (Moscow)", and hit evaluate. Observe how risk score 100/Critical is calculated and a security alert is auto-generated!
4. **AI Alert Explanation:** Open **Security Alerts**, click *Explain AI* on the alert to view the 4-part plain English breakdown.
5. **Incident Escalation & Checklist:** Escalate the alert to an incident. Walk through the 7-phase NIST checklist, check off "Identify" and "Contain", and log a firewall drop action in the audit trail.
6. **Phishing Analysis:** Switch to **Employee** role, paste the sample "Office 365 Password Expiration" email, and observe the instant 94.5% phishing classification and quarantine recommendation.

---

### Slide 6: Social & Economic Impact
- **Cost Reduction:** Brings enterprise-grade incident response to organizations at zero licensing cost using open-source Python, FastAPI, and React.
- **Time to Respond:** Cuts triage time for small IT teams from hours to under 60 seconds using plain-English GenAI summaries.
- **Target Reach:** 4,000+ community colleges, universities, local healthcare providers, and regional charities.

---

### Slide 7: Team & Future Roadmap
- **Phase 1 (Completed in Hackathon):** Full-stack web application, ML Isolation Forest, TF-IDF phishing detector, GenAI copilot, NIST response checklist, device registry.
- **Phase 2 (Next 60 Days):** Automated email gateway IMAP/Office 365 Webhooks integration for zero-click background phishing quarantine.
- **Phase 3:** Open-source agent runner for on-premises Syslog and Active Directory event ingestion.
