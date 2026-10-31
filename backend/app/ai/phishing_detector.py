import re
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

class PhishingDetector:
    """
    Hybrid Machine Learning (TF-IDF + Logistic Regression) and Rule-Based
    Heuristic Phishing Detection Engine for ThreatLens AI.
    """
    def __init__(self):
        self.pipeline = self._train_baseline_model()
        
        self.urgent_keywords = [
            "immediate", "urgently", "action required", "within 24 hours", "suspended",
            "deactivation", "terminate", "unauthorized access", "breach detected",
            "security alert", "critical notice", "payroll suspension", "locked out"
        ]
        
        self.credential_keywords = [
            "password", "credentials", "verify your account", "confirm identity",
            "login here", "reset password", "security questions", "pin number",
            "ssn", "credit card", "two-factor backup code", "update billing"
        ]
        
        self.spoof_domains = [
            "micros0ft", "paypa1", "g00gle", "apple-id-verify", "bankofamerica-secure",
            "it-helpdesk-portal.xyz", "accounts-update.top", "secure-login-net.ru"
        ]

    def _train_baseline_model(self) -> Pipeline:
        corpus = [
            # Phishing samples
            "URGENT: Your Office 365 mailbox is full. Click here to verify your password immediately to avoid deletion.",
            "Security Notice: Unauthorized login from Russia. Verify your credentials now: http://192.168.1.1/login",
            "HR Payroll Update: Please review your revised direct deposit details and enter your employee portal password.",
            "Bank Alert: Your debit card has been suspended. Confirm your PIN and card number immediately.",
            "IT Helpdesk Alert: Mandatory security update required for all staff. Login via this link within 24 hours.",
            "Invoice overdue: Please see attached payment voucher and sign in with your corporate Google credentials.",
            "Account Deactivation Notice: Failure to verify your account within 12 hours will result in permanent closure.",
            "Action Required: Wire transfer of $4,850 pending. Approve or reject using the secure verification portal.",
            
            # Legitimate samples
            "Team meeting scheduled for Tuesday at 2:00 PM in Conference Room B.",
            "Weekly engineering sprint review notes and project milestone progress.",
            "Campus library holiday hours and book return schedule for winter break.",
            "Thank you for submitting your expense report for the cybersecurity conference.",
            "Quarterly newsletter: updates from the Dean of Student Affairs.",
            "Here is the finalized agenda for our department seminar next Friday afternoon.",
            "Reminder: Submit your course registration preferences before the add/drop deadline.",
            "Happy Friday everyone! Coffee and donuts in the main breakroom today."
        ]
        labels = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]

        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
            ('clf', LogisticRegression(C=1.0, random_state=42))
        ])
        pipeline.fit(corpus, labels)
        return pipeline

    def analyze(
        self,
        subject: str,
        sender_address: str,
        email_content: str,
        suspicious_url: Optional[str] = None
    ) -> Dict[str, Any]:
        combined_text = f"{subject} {email_content}".lower()
        sender_lower = sender_address.lower()
        reasons: List[str] = []
        heuristic_score = 0.0

        # 1. Urgent language check
        urgent_matches = [kw for kw in self.urgent_keywords if kw in combined_text]
        if urgent_matches:
            heuristic_score += min(30.0, len(urgent_matches) * 12.0)
            reasons.append(f"High-urgency psychological pressure detected ({', '.join(urgent_matches[:3])})")

        # 2. Credential harvesting check
        cred_matches = [kw for kw in self.credential_keywords if kw in combined_text]
        if cred_matches:
            heuristic_score += min(35.0, len(cred_matches) * 15.0)
            reasons.append(f"Direct request for confidential credentials or verification ({', '.join(cred_matches[:3])})")

        # 3. Sender domain anomaly check
        sender_domain = sender_lower.split("@")[-1] if "@" in sender_lower else ""
        if any(susp in sender_domain for susp in [".top", ".xyz", ".ru", ".tk", ".pw", "mail-service"]):
            heuristic_score += 25.0
            reasons.append(f"Suspicious top-level sender domain ({sender_domain})")
        elif "admin" in sender_lower or "it-support" in sender_lower or "security" in sender_lower:
            # Check if using generic freemail like gmail/yahoo
            if any(free in sender_domain for free in ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]):
                heuristic_score += 30.0
                reasons.append(f"IT / Security identity claimed from generic free mail provider ({sender_domain})")

        # 4. Suspicious URL checks
        url_to_test = suspicious_url or ""
        urls_found = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', email_content)
        if urls_found and not url_to_test:
            url_to_test = urls_found[0]

        if url_to_test:
            parsed = urlparse(url_to_test if "://" in url_to_test else f"http://{url_to_test}")
            domain = parsed.netloc.lower()
            
            # Check for IP address in URL
            if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
                heuristic_score += 35.0
                reasons.append(f"Suspicious URL uses a raw IP address instead of domain ({domain})")
            
            # Check for typosquatting or brand spoofing
            if any(spoof in domain for spoof in self.spoof_domains):
                heuristic_score += 40.0
                reasons.append(f"Potential typosquatting / brand imitation link ({domain})")

            # Check for link shorteners
            if any(short in domain for short in ["bit.ly", "tinyurl.com", "t.co", "is.gd", "rb.gy"]):
                heuristic_score += 20.0
                reasons.append(f"Obfuscated / shortened URL hiding real destination ({domain})")

        # 5. ML Model prediction
        try:
            ml_prob = self.pipeline.predict_proba([combined_text])[0][1] * 100.0
        except Exception:
            ml_prob = 50.0

        # Weighted combination: 60% heuristic indicators, 40% ML probability
        combined_score = (heuristic_score * 0.65) + (ml_prob * 0.35)
        combined_score = min(99.0, max(5.0, round(combined_score, 1)))

        # Classification
        if combined_score >= 68.0:
            prediction = "Phishing"
            recommended_action = "Quarantine message immediately, reset employee credentials if link was opened, and add sender/domain to organization blocklist."
        elif combined_score >= 38.0:
            prediction = "Suspicious"
            recommended_action = "Do not click any enclosed links or download attachments. Confirm with the alleged sender via an out-of-band communication channel."
        else:
            prediction = "Legitimate"
            recommended_action = "Message appears normal. Standard cybersecurity hygiene is still advised."
            if not reasons:
                reasons.append("Natural phrasing, standard non-deceptive domain, no credential harvesting signals found.")

        return {
            "prediction": prediction,
            "confidence_score": combined_score,
            "reasons": reasons,
            "recommended_action": recommended_action
        }

# Global singleton
phishing_detector = PhishingDetector()
