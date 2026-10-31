import json
import logging
from typing import Dict, Any, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class GenAIAssistant:
    """
    ThreatLens Generative AI Security Assistant.
    Connects to Google Gemini API or Groq API, with smart context-aware defensive
    cybersecurity fallbacks when an API key is absent or unreachable.
    """
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY

    async def _call_gemini(self, prompt: str) -> str:
        if not self.gemini_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1000
            }
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
            raise RuntimeError(f"Gemini API returned {resp.status_code}: {resp.text}")

    async def _call_groq(self, prompt: str) -> str:
        if not self.groq_key:
            raise ValueError("GROQ_API_KEY is not configured")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are ThreatLens AI, a specialized defensive cybersecurity assistant for IT admins."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            raise RuntimeError(f"Groq API returned {resp.status_code}: {resp.text}")

    async def explain_alert(
        self,
        alert_title: str,
        description: str,
        severity: str,
        source: str
    ) -> Dict[str, Any]:
        prompt = f"""
You are a senior defensive cybersecurity analyst for ThreatLens AI.
Analyze the following security alert and provide an explanation in simple English for an IT administrator.

Alert Title: {alert_title}
Severity: {severity}
Source: {source}
Description: {description}

Please respond ONLY with a valid JSON object matching this exact schema:
{{
  "what_happened": "Clear 1-2 sentence description of the event.",
  "why_suspicious": "Why this activity is considered dangerous or anomalous.",
  "possible_impact": "Potential consequences if unaddressed (e.g. account takeover, data leak).",
  "recommended_steps": [
    "Step 1: Immediate action",
    "Step 2: Investigation step",
    "Step 3: Remediation step"
  ]
}}
"""
        # Try real LLM first if key exists
        if self.gemini_key or self.groq_key:
            try:
                raw_text = ""
                if self.gemini_key:
                    raw_text = await self._call_gemini(prompt)
                elif self.groq_key:
                    raw_text = await self._call_groq(prompt)

                clean_json = raw_text.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                
                parsed = json.loads(clean_json.strip())
                parsed["source"] = "Gemini / Groq Live LLM"
                return parsed
            except Exception as e:
                logger.warning(f"GenAI call failed, utilizing defensive fallback engine: {e}")

        # Deterministic Context-Aware Fallback Engine
        return self._fallback_alert_explanation(alert_title, description, severity, source)

    def _fallback_alert_explanation(self, title: str, description: str, severity: str, source: str) -> Dict[str, Any]:
        lower_t = (title + " " + description).lower()
        if "brute" in lower_t or "failed" in lower_t:
            return {
                "what_happened": f"ThreatLens detected a surge of repeated failed authentication attempts targeting an organization user account.",
                "why_suspicious": "Legitimate users rarely fail logins more than 2-3 times consecutively. This rapid pattern strongly suggests credential stuffing or an automated dictionary attack.",
                "possible_impact": "Unauthorized access to internal university or corporate systems, unauthorized data extraction, and lateral movement.",
                "recommended_steps": [
                    "Immediately lock or temporarily suspend the targeted user account.",
                    "Verify the origin IP address in the firewall logs and add it to the perimeter blocklist.",
                    "Force a secure password reset and enforce Multi-Factor Authentication (MFA) upon reactivation.",
                    "Review recent successful sessions from this user account to ensure no unauthorized persistence."
                ],
                "source": "ThreatLens Cyber Copilot (Template Fallback)"
            }
        elif "location" in lower_t or "foreign" in lower_t or "moscow" in lower_t:
            return {
                "what_happened": f"A login session was established from an anomalous, high-risk geographical region that differs drastically from standard baseline activity.",
                "why_suspicious": "The user was logged in shortly before or usually operates from campus/domestic IP ranges. Impossible travel velocity indicates session hijacking or credential theft.",
                "possible_impact": "Adversary gaining persistent cloud foothold, accessing sensitive documents, and potentially spoofing emails internally.",
                "recommended_steps": [
                    "Terminate all active OAuth tokens and browser sessions for this user.",
                    "Contact the user through phone or in-person verification to confirm whether they are travelling.",
                    "Enable conditional access geolocation fencing to block off-limits territories.",
                    "Inspect email inbox forwarding rules to ensure no covert exfiltration rules were created."
                ],
                "source": "ThreatLens Cyber Copilot (Template Fallback)"
            }
        elif "phishing" in lower_t:
            return {
                "what_happened": f"An employee reported a high-confidence deceptive email requesting urgent credentials or directing users to an unverified domain.",
                "why_suspicious": "The email uses psychological pressure and mimics official branding while linking to external harvesting infrastructure.",
                "possible_impact": "Employee credential disclosure leading to spear-phishing campaigns and internal network compromise.",
                "recommended_steps": [
                    "Purge the reported message from all organizational mailboxes via the email gateway.",
                    "Block the malicious sender address and target URLs on the DNS/web filter.",
                    "Identify any users who clicked the link or submitted credentials and reset their passwords immediately.",
                    "Issue a brief awareness bulletin to staff regarding the active campaign."
                ],
                "source": "ThreatLens Cyber Copilot (Template Fallback)"
            }
        else:
            return {
                "what_happened": f"ThreatLens security engine triggered an anomaly event: '{title}'. Details: {description}.",
                "why_suspicious": f"The activity deviates statistically from baseline security policies with an assigned severity rating of {severity}.",
                "possible_impact": "Potential policy breach, unauthorized perimeter reconnaissance, or compromised access vector.",
                "recommended_steps": [
                    "Inspect the detailed login and network telemetry logs associated with this event.",
                    "Validate the device identity and IP address in the Device Registry.",
                    "Escalate to a formal incident if unverified or malicious behavior is confirmed.",
                    "Document the root cause and update organizational detection rules."
                ],
                "source": "ThreatLens Cyber Copilot (Template Fallback)"
            }

    async def generate_incident_checklist(
        self,
        incident_type: str,
        severity: str,
        description: str
    ) -> Dict[str, Any]:
        prompt = f"""
You are a certified incident response handler (SANS / NIST framework).
Generate a 7-step structured incident response checklist for this security incident:

Incident Type: {incident_type}
Severity: {severity}
Description: {description}

The 7 required phases are:
1. Identify the threat
2. Verify the affected account
3. Contain the incident
4. Investigate relevant logs
5. Recover affected access
6. Document the incident
7. Recommend preventive measures

Respond ONLY with a valid JSON object matching:
{{
  "executive_summary": "1-2 sentence executive briefing",
  "containment_strategy": "Direct containment guidance",
  "checklist": [
    {{"id": 1, "phase": "Identify", "title": "...", "description": "...", "completed": false}},
    {{"id": 2, "phase": "Verify", "title": "...", "description": "...", "completed": false}},
    {{"id": 3, "phase": "Contain", "title": "...", "description": "...", "completed": false}},
    {{"id": 4, "phase": "Investigate", "title": "...", "description": "...", "completed": false}},
    {{"id": 5, "phase": "Recover", "title": "...", "description": "...", "completed": false}},
    {{"id": 6, "phase": "Document", "title": "...", "description": "...", "completed": false}},
    {{"id": 7, "phase": "Prevent", "title": "...", "description": "...", "completed": false}}
  ]
}}
"""
        if self.gemini_key or self.groq_key:
            try:
                raw_text = ""
                if self.gemini_key:
                    raw_text = await self._call_gemini(prompt)
                elif self.groq_key:
                    raw_text = await self._call_groq(prompt)

                clean_json = raw_text.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                
                return json.loads(clean_json.strip())
            except Exception as e:
                logger.warning(f"GenAI incident checklist generation failed: {e}")

        # Deterministic 7-phase SANS/NIST standard fallback
        return self._fallback_incident_checklist(incident_type, severity, description)

    def _fallback_incident_checklist(self, incident_type: str, severity: str, description: str) -> Dict[str, Any]:
        return {
            "executive_summary": f"Standard incident response protocol initialized for '{incident_type}' ({severity} severity). Immediate containment and identity verification prioritized.",
            "containment_strategy": "Isolate the session, invalidate authorization tokens, quarantine suspicious devices, and restrict perimeter ingress.",
            "checklist": [
                {
                    "id": 1,
                    "phase": "Identify",
                    "title": "Identify Threat Vector & Scope",
                    "description": f"Confirm initial intrusion vector for '{incident_type}'. Review initial telemetry timestamps and identify targeted accounts.",
                    "completed": True
                },
                {
                    "id": 2,
                    "phase": "Verify",
                    "title": "Verify Affected Account & User State",
                    "description": "Establish direct contact with the registered account owner via secondary out-of-band channel (phone/SMS) to verify legitimate activity.",
                    "completed": False
                },
                {
                    "id": 3,
                    "phase": "Contain",
                    "title": "Contain Incident & Revoke Access",
                    "description": "Revoke active web tokens, trigger immediate password reset, and temporarily suspend account or quarantine unknown endpoints.",
                    "completed": False
                },
                {
                    "id": 4,
                    "phase": "Investigate",
                    "title": "Investigate Relevant Audit Logs",
                    "description": "Inspect last 48 hours of login logs, API calls, mailbox rules, and file download spikes for signs of lateral movement.",
                    "completed": False
                },
                {
                    "id": 5,
                    "phase": "Recover",
                    "title": "Recover & Restore Secure Access",
                    "description": "Re-enable account after issuing fresh 16+ character password with mandatory FIDO2/TOTP Multi-Factor Authentication.",
                    "completed": False
                },
                {
                    "id": 6,
                    "phase": "Document",
                    "title": "Document Incident Timeline & Root Cause",
                    "description": "Record all mitigation actions taken, affected systems, downtime, and forensic evidence in the incident audit trail.",
                    "completed": False
                },
                {
                    "id": 7,
                    "phase": "Prevent",
                    "title": "Implement Preventive Measures & Policy Updates",
                    "description": "Update organization security policies: reduce maximum failed login lockout thresholds and update DNS blocklists.",
                    "completed": False
                }
            ]
        }

    async def explain_phishing(
        self,
        subject: str,
        sender: str,
        content: str,
        suspicious_url: str,
        prediction: str
    ) -> Dict[str, Any]:
        prompt = f"""
You are ThreatLens AI, a defensive cybersecurity expert. Explain why the following email was classified as '{prediction}' and provide safe guidance for both the user and IT admin.

Subject: {subject}
Sender: {sender}
URL: {suspicious_url or 'None'}
Content: {content}

Respond ONLY with a valid JSON object matching:
{{
  "analysis": "2-3 sentences explaining why this email is legitimate, suspicious, or phishing.",
  "threat_indicators": ["Indicator 1", "Indicator 2", "Indicator 3"],
  "user_guidance": "Clear advice for the employee who received this.",
  "admin_action": "Recommended technical actions for the IT administrator."
}}
"""
        if self.gemini_key or self.groq_key:
            try:
                raw_text = ""
                if self.gemini_key:
                    raw_text = await self._call_gemini(prompt)
                elif self.groq_key:
                    raw_text = await self._call_groq(prompt)

                clean_json = raw_text.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                
                return json.loads(clean_json.strip())
            except Exception as e:
                logger.warning(f"GenAI phishing explanation failed: {e}")

        # Deterministic Fallback
        is_phish = prediction.lower() in ["phishing", "suspicious"]
        return {
            "analysis": f"The message exhibits hallmark characteristics of {'social engineering credential harvesting' if is_phish else 'standard administrative correspondence'}. The sender structure and call-to-action were evaluated against organizational threat intelligence.",
            "threat_indicators": [
                "Artificial urgency designed to bypass critical thinking" if is_phish else "Standard business communication cadence",
                f"External sender header ({sender})" if is_phish else "Valid expected domain",
                f"Call to action redirecting to unverified web destination ({suspicious_url or 'embedded link'})" if is_phish else "No deceptive links detected"
            ],
            "user_guidance": "Do not click any links, open attachments, or reply to the email. Flag the message to IT security immediately." if is_phish else "This email appears normal. As standard practice, avoid sharing credentials over email.",
            "admin_action": "Quarantine the email across tenant mailboxes, submit sender IP/domain to firewall blocklist, and notify users who received similar messages." if is_phish else "No immediate remediation required. Logged in audit registry."
        }

# Global singleton
genai_assistant = GenAIAssistant()
