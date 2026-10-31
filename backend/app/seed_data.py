import json
import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, LoginLog, Alert, Incident, IncidentAction, PhishingReport, Device, Policy
from app.auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # If users already seeded, skip
    if db.query(User).count() > 0:
        db.close()
        return

    print("[*] Seeding ThreatLens AI database with realistic synthetic records...")

    # 1. Users for all 4 roles
    default_pw = hash_password("Admin@123")
    demo_users = [
        User(
            email="admin@threatlens.ai",
            username="admin",
            hashed_password=default_pw,
            full_name="Sarah Chen (CISO / Admin)",
            role="Admin",
            department="Executive Security Office",
            is_active=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=90),
            last_login=datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
        ),
        User(
            email="secmanager@threatlens.ai",
            username="secmanager",
            hashed_password=default_pw,
            full_name="Marcus Vance (Security Manager)",
            role="Security Manager",
            department="SOC Operations",
            is_active=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=75),
            last_login=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        ),
        User(
            email="itadmin@threatlens.ai",
            username="itadmin",
            hashed_password=default_pw,
            full_name="Alex Rivera (IT Lead)",
            role="IT Administrator",
            department="Information Technology",
            is_active=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=60),
            last_login=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
        ),
        User(
            email="employee@threatlens.ai",
            username="employee",
            hashed_password=default_pw,
            full_name="Emma Watson (Staff Researcher)",
            role="Employee",
            department="Academic Operations",
            is_active=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=40),
            last_login=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        )
    ]
    db.add_all(demo_users)
    db.commit()

    # 2. Security Policies
    policies = [
        Policy(
            policy_key="LOGIN_ATTEMPT_LIMIT",
            name="Maximum Failed Login Threshold",
            category="Authentication",
            description="Accounts triggering repeated failed login attempts within 5 minutes are flagged and temporarily restricted.",
            value="5 Failed Attempts",
            is_enforced=True
        ),
        Policy(
            policy_key="GEOLOCATION_RESTRICTION",
            name="Impossible Travel & Geofencing",
            category="Access Control",
            description="Authentications outside verified domestic or partner IP ranges trigger immediate High/Critical anomaly alerts.",
            value="Domestic IP Only / Strict VPN",
            is_enforced=True
        ),
        Policy(
            policy_key="PASSWORD_COMPLEXITY",
            name="Enterprise Password Standard",
            category="Authentication",
            description="Mandatory 14+ characters, special symbols, and 90-day rotation cadence for administrative accounts.",
            value="14+ Chars, MFA Enforced",
            is_enforced=True
        ),
        Policy(
            policy_key="PHISHING_AUTO_QUARANTINE",
            name="Automated Phishing Containment",
            category="Awareness",
            description="Emails analyzed with >70% phishing confidence score are automatically quarantined across the organization mail server.",
            value="Auto-Quarantine >= 70% Confidence",
            is_enforced=True
        ),
        Policy(
            policy_key="SESSION_TIMEOUT",
            name="Session Inactivity Timeout",
            category="Access Control",
            description="Idle browser and API sessions are revoked after a strict duration of inactivity to prevent physical terminal takeover.",
            value="30 Minutes Inactivity",
            is_enforced=True
        )
    ]
    db.add_all(policies)
    db.commit()

    # 3. Device Registry
    devices = [
        Device(
            device_id="DEV-001",
            device_name="MacBook Pro M3 - SecOps",
            assigned_user="Sarah Chen (CISO / Admin)",
            ip_address="192.168.10.42",
            operating_system="macOS Sonoma 14.4",
            registration_status="Registered",
            last_seen=datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
        ),
        Device(
            device_id="DEV-002",
            device_name="ThinkPad T14s - IT Ops",
            assigned_user="Alex Rivera (IT Lead)",
            ip_address="192.168.10.88",
            operating_system="Windows 11 Enterprise",
            registration_status="Registered",
            last_seen=datetime.datetime.utcnow() - datetime.timedelta(minutes=45)
        ),
        Device(
            device_id="DEV-003",
            device_name="Dell Latitude 7440 - Research",
            assigned_user="Emma Watson (Staff Researcher)",
            ip_address="192.168.20.15",
            operating_system="Ubuntu 22.04 LTS",
            registration_status="Registered",
            last_seen=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
        ),
        Device(
            device_id="DEV-004",
            device_name="iPhone 15 Pro - Corporate MDM",
            assigned_user="Marcus Vance (Security Manager)",
            ip_address="10.4.82.19",
            operating_system="iOS 17.5",
            registration_status="Registered",
            last_seen=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
        ),
        Device(
            device_id="DEV-005",
            device_name="Unknown Linux Box / Automated Scanner",
            assigned_user="Unassigned / Rogue Device",
            ip_address="185.220.101.5",
            operating_system="Debian GNU/Linux (Tor Exit)",
            registration_status="Quarantined",
            last_seen=datetime.datetime.utcnow() - datetime.timedelta(hours=8)
        )
    ]
    db.add_all(devices)
    db.commit()

    # 4. Realistic Login Logs across the past 7 days
    now = datetime.datetime.utcnow()
    login_records = [
        # Normal records
        LoginLog(
            username="admin",
            ip_address="192.168.10.42",
            location="Austin, TX - Campus LAN",
            device="MacBook Pro - Chrome",
            login_time=now - datetime.timedelta(minutes=15),
            status="Success",
            failed_attempts=0,
            risk_score=5.0,
            severity="Low",
            is_anomalous=False,
            anomaly_reasons=json.dumps(["Standard login from registered device and familiar location"])
        ),
        LoginLog(
            username="itadmin",
            ip_address="192.168.10.88",
            location="Austin, TX - Campus LAN",
            device="ThinkPad T14 - Windows 11",
            login_time=now - datetime.timedelta(hours=1),
            status="Success",
            failed_attempts=0,
            risk_score=8.0,
            severity="Low",
            is_anomalous=False,
            anomaly_reasons=json.dumps(["Standard login from registered device"])
        ),
        LoginLog(
            username="employee",
            ip_address="192.168.20.15",
            location="Austin, TX - Eduroam WiFi",
            device="Dell XPS 15 - Windows 11",
            login_time=now - datetime.timedelta(hours=5),
            status="Success",
            failed_attempts=0,
            risk_score=12.0,
            severity="Low",
            is_anomalous=False,
            anomaly_reasons=json.dumps(["Standard login"])
        ),
        # Critical Brute-Force Anomaly
        LoginLog(
            username="admin",
            ip_address="185.220.101.5",
            location="Moscow, Russia",
            device="Linux x86_64 - Curl/Bot",
            login_time=now - datetime.timedelta(hours=6, minutes=20),
            status="Failed",
            failed_attempts=7,
            risk_score=94.5,
            severity="Critical",
            is_anomalous=True,
            anomaly_reasons=json.dumps([
                "Authentication failure",
                "High-frequency failed attempts (7 attempts) indicating brute-force",
                "Connection origin is flagged as high-risk/foreign territory: Moscow, Russia",
                "Automated tool or anonymizing agent detected: Linux x86_64 - Curl/Bot",
                "Multi-factor behavioural outlier flagged by Isolation Forest ML model"
            ])
        ),
        # High Risk Location / Unknown Device Anomaly
        LoginLog(
            username="secmanager",
            ip_address="102.89.33.14",
            location="Lagos, Nigeria",
            device="Generic Chrome / Windows 7",
            login_time=now - datetime.timedelta(hours=14),
            status="Failed",
            failed_attempts=3,
            risk_score=78.0,
            severity="Critical",
            is_anomalous=True,
            anomaly_reasons=json.dumps([
                "Multiple consecutive failed attempts (3 attempts)",
                "Connection origin is flagged as high-risk/foreign territory: Lagos, Nigeria",
                "Unregistered / new device footprint: Generic Chrome / Windows 7",
                "Multi-factor behavioural outlier flagged by Isolation Forest ML model"
            ])
        ),
        # Medium Anomaly: Unusual off-hours login
        LoginLog(
            username="employee",
            ip_address="174.62.112.9",
            location="Denver, CO - Public Hotel WiFi",
            device="Dell XPS 15 - Windows 11",
            login_time=now - datetime.timedelta(days=1, hours=7),
            status="Success",
            failed_attempts=1,
            risk_score=38.0,
            severity="Medium",
            is_anomalous=False,
            anomaly_reasons=json.dumps([
                "Unfamiliar login geolocation: Denver, CO",
                "Minor authentication delay"
            ])
        ),
        # High Risk: 4 Failed attempts from unknown device
        LoginLog(
            username="finance_officer",
            ip_address="194.26.29.112",
            location="Bucharest, Romania",
            device="Firefox / Kali Linux",
            login_time=now - datetime.timedelta(days=2, hours=3),
            status="Failed",
            failed_attempts=5,
            risk_score=88.0,
            severity="Critical",
            is_anomalous=True,
            anomaly_reasons=json.dumps([
                "High-frequency failed attempts (5 attempts) indicating brute-force",
                "Connection origin is flagged as high-risk/foreign territory: Bucharest, Romania",
                "Automated tool or anonymizing agent detected"
            ])
        ),
        # Additional background historical logs
        LoginLog(
            username="alex.it",
            ip_address="192.168.10.88",
            location="Austin, TX - Campus LAN",
            device="ThinkPad T14 - Windows 11",
            login_time=now - datetime.timedelta(days=2, hours=10),
            status="Success",
            failed_attempts=0,
            risk_score=6.0,
            severity="Low",
            is_anomalous=False,
            anomaly_reasons=json.dumps(["Standard login"])
        ),
        LoginLog(
            username="sarah.ciso",
            ip_address="192.168.10.42",
            location="Austin, TX - Campus LAN",
            device="MacBook Pro - Chrome",
            login_time=now - datetime.timedelta(days=3, hours=5),
            status="Success",
            failed_attempts=0,
            risk_score=5.0,
            severity="Low",
            is_anomalous=False,
            anomaly_reasons=json.dumps(["Standard login"])
        ),
        LoginLog(
            username="student_portal",
            ip_address="198.51.100.24",
            location="Houston, TX - Branch",
            device="iPhone 15 - Mobile Safari",
            login_time=now - datetime.timedelta(days=4, hours=2),
            status="Success",
            failed_attempts=0,
            risk_score=10.0,
            severity="Low",
            is_anomalous=False,
            anomaly_reasons=json.dumps(["Standard mobile login"])
        ),
        LoginLog(
            username="guest_user",
            ip_address="203.0.113.88",
            location="Austin, TX - Eduroam WiFi",
            device="iPad Pro - Mobile Safari",
            login_time=now - datetime.timedelta(days=5, hours=8),
            status="Failed",
            failed_attempts=2,
            risk_score=22.0,
            severity="Low",
            is_anomalous=False,
            anomaly_reasons=json.dumps(["Minor password typo, recovered on retry"])
        )
    ]
    db.add_all(login_records)
    db.commit()

    # 5. Security Alerts
    alerts = [
        Alert(
            alert_id="ALT-2026-1042",
            title="Brute-Force Anomaly: Multiple Failures on Admin Account",
            description="Seven consecutive failed authentication attempts originating from Moscow, Russia (185.220.101.5) using automated Curl script agent.",
            severity="Critical",
            source="Login Anomaly Engine",
            timestamp=now - datetime.timedelta(hours=6, minutes=20),
            status="New",
            assigned_to="Alex Rivera (IT Lead)",
            related_log_id=4
        ),
        Alert(
            alert_id="ALT-2026-1043",
            title="Impossible Travel Velocity: Cross-Continental Geolocation",
            description="User secmanager authenticated from Lagos, Nigeria just 10 hours after campus LAN activity in Austin, TX.",
            severity="High",
            source="Login Anomaly Engine",
            timestamp=now - datetime.timedelta(hours=14),
            status="Acknowledged",
            assigned_to="Marcus Vance (Security Manager)",
            related_log_id=5
        ),
        Alert(
            alert_id="ALT-2026-1044",
            title="High-Confidence Phishing Email: Deceptive Office365 Storage Notice",
            description="Employee submitted email mimicking Microsoft IT Helpdesk with urgent 24-hr deactivation threat and credential harvesting link.",
            severity="High",
            source="Phishing Analyzer",
            timestamp=now - datetime.timedelta(hours=18),
            status="Investigating",
            assigned_to="Alex Rivera (IT Lead)"
        ),
        Alert(
            alert_id="ALT-2026-1045",
            title="Off-Hours Authentication Spike from Unfamiliar IP",
            description="Five failed attempts detected from Bucharest, Romania targeting finance_officer account during off-hours.",
            severity="Critical",
            source="Login Anomaly Engine",
            timestamp=now - datetime.timedelta(days=2, hours=3),
            status="Resolved",
            assigned_to="Sarah Chen (CISO / Admin)",
            related_log_id=7
        ),
        Alert(
            alert_id="ALT-2026-1046",
            title="Unregistered Device Connected to Campus Subnet",
            description="MAC address and device footprint DEV-005 not found in enterprise directory.",
            severity="Medium",
            source="Policy Monitor",
            timestamp=now - datetime.timedelta(days=2, hours=12),
            status="Resolved",
            assigned_to="Alex Rivera (IT Lead)"
        )
    ]
    db.add_all(alerts)
    db.commit()

    # 6. Structured Incident with SANS/NIST 7-Step Checklist
    incident_checklist_1 = [
        {"id": 1, "phase": "Identify", "title": "Identify Threat Vector & Scope", "description": "Confirm initial intrusion vector for brute-force attack. Review target accounts and firewall IP logs.", "completed": True},
        {"id": 2, "phase": "Verify", "title": "Verify Affected Account & User State", "description": "Call registered account holder (Sarah Chen) out-of-band to verify no legitimate travel or external script execution.", "completed": True},
        {"id": 3, "phase": "Contain", "title": "Contain Incident & Revoke Access", "description": "Add IP 185.220.101.5 to perimeter firewall drop table and invalidate active JWT refresh tokens.", "completed": True},
        {"id": 4, "phase": "Investigate", "title": "Investigate Relevant Audit Logs", "description": "Query SIEM and DB for any unauthorized database queries or privilege escalation attempts during the attack window.", "completed": False},
        {"id": 5, "phase": "Recover", "title": "Recover & Restore Secure Access", "description": "Force user password update and verify hardware FIDO2 MFA token activation.", "completed": False},
        {"id": 6, "phase": "Document", "title": "Document Incident Timeline & Root Cause", "description": "Log all containment steps, incident timeline, and adversary IOCs in ThreatLens.", "completed": False},
        {"id": 7, "phase": "Prevent", "title": "Implement Preventive Measures & Policy Updates", "description": "Adjust failed login lockout policy threshold from 5 to 3 attempts for all administrative roles.", "completed": False}
    ]

    incident_checklist_2 = [
        {"id": 1, "phase": "Identify", "title": "Identify Threat Vector & Scope", "description": "Analyze headers of deceptive Office365 email and extract destination URL.", "completed": True},
        {"id": 2, "phase": "Verify", "title": "Verify Affected Account & User State", "description": "Check mail gateway logs for all internal recipients who opened the message.", "completed": True},
        {"id": 3, "phase": "Contain", "title": "Contain Incident & Revoke Access", "description": "Purge email from tenant mailboxes and block domain 'it-helpdesk-portal.xyz' on DNS resolver.", "completed": True},
        {"id": 4, "phase": "Investigate", "title": "Investigate Relevant Audit Logs", "description": "Audit authentication logs for 3 users who clicked the harvesting link.", "completed": True},
        {"id": 5, "phase": "Recover", "title": "Recover & Restore Secure Access", "description": "Reset passwords for affected staff members immediately.", "completed": True},
        {"id": 6, "phase": "Document", "title": "Document Incident Timeline & Root Cause", "description": "Compile phishing report for SOC records.", "completed": True},
        {"id": 7, "phase": "Prevent", "title": "Implement Preventive Measures & Policy Updates", "description": "Schedule mandatory refresher phishing awareness module for the targeted department.", "completed": True}
    ]

    incidents = [
        Incident(
            incident_id="INC-2026-001",
            title="Active Brute-Force Authentication Spike Targeting Root Admin",
            incident_type="Brute-force login attack",
            severity="Critical",
            description="Automated dictionary attack originating from Tor exit node (185.220.101.5). Attempted 7 rapid credential guesses against Sarah Chen's admin account.",
            assigned_to="Alex Rivera (IT Lead)",
            status="Investigating",
            created_at=now - datetime.timedelta(hours=5),
            updated_at=now - datetime.timedelta(hours=1),
            checklist=json.dumps(incident_checklist_1),
            alert_id="ALT-2026-1042"
        ),
        Incident(
            incident_id="INC-2026-002",
            title="Credential Harvesting Phishing Campaign Spoofing Office 365",
            incident_type="Phishing email attack",
            severity="High",
            description="Targeted spear-phishing email delivered to academic staff purporting to be an urgent mailbox storage quota alert.",
            assigned_to="Marcus Vance (Security Manager)",
            status="Contained",
            created_at=now - datetime.timedelta(days=1),
            updated_at=now - datetime.timedelta(hours=3),
            checklist=json.dumps(incident_checklist_2),
            alert_id="ALT-2026-1044"
        ),
        Incident(
            incident_id="INC-2026-003",
            title="Unregistered Endpoint Accessing Research Subnet",
            incident_type="Unknown device login",
            severity="Medium",
            description="Non-compliant Linux machine detected communicating on sensitive research VLAN without 802.1X certificate.",
            assigned_to="Alex Rivera (IT Lead)",
            status="Resolved",
            created_at=now - datetime.timedelta(days=3),
            updated_at=now - datetime.timedelta(days=2),
            checklist=json.dumps(incident_checklist_2),
            alert_id="ALT-2026-1046"
        )
    ]
    db.add_all(incidents)
    db.commit()

    # 7. Incident Timeline Actions
    actions = [
        IncidentAction(
            incident_id=1,
            action_text="Incident declared from Alert ALT-2026-1042 by Alex Rivera.",
            performed_by="Alex Rivera (IT Lead)",
            timestamp=now - datetime.timedelta(hours=5),
            action_type="status_change"
        ),
        IncidentAction(
            incident_id=1,
            action_text="Perimeter drop rule applied on Edge Gateway for 185.220.101.5/32.",
            performed_by="Alex Rivera (IT Lead)",
            timestamp=now - datetime.timedelta(hours=4, minutes=30),
            action_type="containment"
        ),
        IncidentAction(
            incident_id=1,
            action_text="Spoke with Sarah Chen; she confirmed she was in a campus faculty meeting and did not initiate logins from Moscow.",
            performed_by="Marcus Vance (Security Manager)",
            timestamp=now - datetime.timedelta(hours=3),
            action_type="checklist"
        ),
        IncidentAction(
            incident_id=2,
            action_text="Incident initiated following user report of deceptive mailbox notice.",
            performed_by="Marcus Vance (Security Manager)",
            timestamp=now - datetime.timedelta(days=1),
            action_type="status_change"
        ),
        IncidentAction(
            incident_id=2,
            action_text="Domain 'it-helpdesk-portal.xyz' sinkholed on local DNS cache.",
            performed_by="Alex Rivera (IT Lead)",
            timestamp=now - datetime.timedelta(days=1, hours=22),
            action_type="containment"
        )
    ]
    db.add_all(actions)
    db.commit()

    # 8. Phishing Reports
    phish_reports = [
        PhishingReport(
            report_id="PHISH-2026-001",
            submitted_by="Emma Watson (Staff Researcher)",
            subject="URGENT: Office 365 Password Expiration in 24 Hours",
            sender_address="admin-support@it-helpdesk-portal.xyz",
            email_content="Your corporate Microsoft 365 password will expire today. To keep your current password and avoid losing mailbox access, verify your credentials here: https://it-helpdesk-portal.xyz/login-verify",
            suspicious_url="https://it-helpdesk-portal.xyz/login-verify",
            prediction="Phishing",
            confidence_score=94.5,
            reasons=json.dumps([
                "High-urgency psychological pressure detected (immediate, within 24 hours)",
                "Direct request for confidential credentials or verification (password, verify your account)",
                "Suspicious top-level sender domain (.xyz)",
                "Potential typosquatting / brand imitation link (it-helpdesk-portal.xyz)"
            ]),
            recommended_action="Quarantine message immediately, reset employee credentials if link was opened, and add sender/domain to organization blocklist.",
            ai_explanation=json.dumps({
                "analysis": "This email is a textbook credential harvesting phishing attack mimicking IT administration. The sender domain is an external rogue host attempting to steal enterprise passwords.",
                "threat_indicators": [
                    "Artificial urgency designed to cause panic (24-hour expiration)",
                    "Sender domain has no relation to genuine Microsoft or organization servers",
                    "Target link captures plaintext passwords into an attacker-controlled server"
                ],
                "user_guidance": "Do not click the link or provide any passwords. The IT department will never ask for your password via email.",
                "admin_action": "Quarantine the message across all employee mailboxes and block 'it-helpdesk-portal.xyz' at the firewall."
            }),
            created_at=now - datetime.timedelta(hours=18),
            status="Quarantined"
        ),
        PhishingReport(
            report_id="PHISH-2026-002",
            submitted_by="Emma Watson (Staff Researcher)",
            subject="Payroll direct deposit update confirmation",
            sender_address="hr-payroll@mail-relay-02.top",
            email_content="Attention employee: Your latest payroll direct deposit encountered an error. Please log in to your employee account through the link below to confirm your banking information.",
            suspicious_url="http://192.168.1.105/hr-portal/update",
            prediction="Phishing",
            confidence_score=88.2,
            reasons=json.dumps([
                "High-urgency psychological pressure detected (payroll)",
                "Direct request for confidential credentials or verification",
                "Suspicious top-level sender domain (.top)",
                "Suspicious URL uses a raw IP address instead of domain (192.168.1.105)"
            ]),
            recommended_action="Quarantine message immediately and notify HR/payroll staff.",
            ai_explanation=json.dumps({
                "analysis": "High-risk financial phishing attack attempting to redirect payroll deposits.",
                "threat_indicators": ["Uses raw IP address in link", "Rogue top-level domain .top"],
                "user_guidance": "Never enter banking or login information from email links.",
                "admin_action": "Block sender IP range and notify payroll personnel."
            }),
            created_at=now - datetime.timedelta(days=2),
            status="Quarantined"
        ),
        PhishingReport(
            report_id="PHISH-2026-003",
            submitted_by="Alex Rivera (IT Lead)",
            subject="Quarterly Cybersecurity Training Schedule Announcement",
            sender_address="training@threatlens.ai",
            email_content="Hello team, please find attached the schedule for our upcoming quarterly cybersecurity awareness workshops starting next Tuesday at 10 AM.",
            suspicious_url=None,
            prediction="Legitimate",
            confidence_score=12.0,
            reasons=json.dumps([
                "Natural phrasing, standard non-deceptive domain, no credential harvesting signals found."
            ]),
            recommended_action="Message appears normal. Standard cybersecurity hygiene is still advised.",
            ai_explanation=json.dumps({
                "analysis": "Standard internal announcement with authentic sender domain and no credential harvesting indicators.",
                "threat_indicators": ["No deceptive links or urgency detected"],
                "user_guidance": "Safe to read and schedule.",
                "admin_action": "No remediation required."
            }),
            created_at=now - datetime.timedelta(days=3),
            status="Dismissed"
        )
    ]
    db.add_all(phish_reports)
    db.commit()

    db.close()
    print("[+] ThreatLens AI database seeded successfully!")

if __name__ == "__main__":
    seed_database()
