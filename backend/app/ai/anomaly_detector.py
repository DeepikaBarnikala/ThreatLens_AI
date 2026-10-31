import datetime
from typing import List, Tuple, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest

class LoginAnomalyDetector:
    """
    Hybrid Machine Learning (Isolation Forest, n_jobs=1 for lightning execution)
    and Rule-Based Anomaly Detector for ThreatLens AI.
    Calculates risk scores (0-100), assigns severity, and generates explainable security reasons.
    """
    def __init__(self):
        self.known_locations = {
            "Austin, TX - Campus LAN",
            "Dallas, TX - Corporate Office",
            "Houston, TX - Branch",
            "San Antonio, TX - Remote VPN",
            "Austin, TX - Eduroam WiFi"
        }
        self.known_devices = {
            "MacBook Pro - Chrome",
            "Dell XPS 15 - Windows 11",
            "ThinkPad T14 - Windows 11",
            "iPhone 15 - Mobile Safari",
            "iPad Pro - Mobile Safari"
        }
        self.high_risk_locations = {
            "Moscow, Russia",
            "Saint Petersburg, Russia",
            "Lagos, Nigeria",
            "Shenzhen, China",
            "Bucharest, Romania",
            "Tehran, Iran",
            "Unknown Proxy / TOR Exit Node"
        }
        
        # Lightweight Isolation Forest with n_jobs=1 for instant initialization
        self.model = IsolationForest(n_estimators=20, max_samples=16, contamination=0.15, random_state=42, n_jobs=1)
        self._train_baseline()

    def _train_baseline(self):
        # Baseline normal features: [failed_attempts, is_night_hour, is_unknown_loc, is_unknown_device]
        normal_samples = [
            [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
            [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1],
            [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
            [2, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]
        ]
        X = np.array(normal_samples)
        self.model.fit(X)

    def analyze(
        self,
        username: str,
        ip_address: str,
        location: str,
        device: str,
        status: str,
        failed_attempts: int,
        login_time: datetime.datetime = None
    ) -> Dict[str, Any]:
        if login_time is None:
            login_time = datetime.datetime.utcnow()

        reasons: List[str] = []
        risk_score = 0.0

        hour = login_time.hour
        is_night_hour = 1 if (hour < 6 or hour >= 23) else 0
        is_unknown_loc = 1 if location not in self.known_locations else 0
        is_unknown_dev = 1 if device not in self.known_devices else 0
        is_high_risk_loc = any(hr.lower() in location.lower() for hr in self.high_risk_locations)

        # 1. Failed attempts analysis
        if status.lower() == "failed":
            risk_score += 15.0
            reasons.append("Authentication failure")

        if failed_attempts >= 5:
            risk_score += 45.0
            reasons.append(f"High-frequency failed attempts ({failed_attempts} attempts) indicating brute-force")
        elif failed_attempts >= 3:
            risk_score += 25.0
            reasons.append(f"Multiple consecutive failed attempts ({failed_attempts} attempts)")
        elif failed_attempts >= 1:
            risk_score += 10.0

        # 2. Location anomaly analysis
        if is_high_risk_loc:
            risk_score += 40.0
            reasons.append(f"Connection origin is flagged as high-risk/foreign territory: {location}")
        elif is_unknown_loc:
            risk_score += 20.0
            reasons.append(f"Unfamiliar login geolocation: {location}")

        # 3. Device anomaly analysis
        if "Tor" in device or "Curl" in device or "Python" in device or "Bot" in device:
            risk_score += 45.0
            reasons.append(f"Automated tool or anonymizing agent detected: {device}")
        elif is_unknown_dev:
            risk_score += 15.0
            reasons.append(f"Unregistered / new device footprint: {device}")

        # 4. Off-hours / abnormal login time
        if is_night_hour:
            risk_score += 15.0
            reasons.append(f"Abnormal off-hours access timestamp ({hour:02d}:00 UTC)")

        # 5. ML Isolation Forest evaluation
        features = np.array([[failed_attempts, is_night_hour, is_unknown_loc, is_unknown_dev]])
        try:
            ml_pred = self.model.predict(features)[0]  # -1 for anomaly, 1 for normal
            decision_score = self.model.decision_function(features)[0]
            if ml_pred == -1:
                ml_boost = max(10.0, min(25.0, abs(decision_score) * 40.0))
                risk_score += ml_boost
                if "Multi-factor behavioural outlier flagged by Isolation Forest ML model" not in reasons:
                    reasons.append("Multi-factor behavioural outlier flagged by Isolation Forest ML model")
        except Exception:
            pass

        # Normalize score 0 - 100
        risk_score = min(100.0, max(0.0, round(risk_score, 1)))

        # Assign Severity:
        # 0–29: Low
        # 30–49: Medium
        # 50–74: High
        # 75–100: Critical
        if risk_score >= 75.0:
            severity = "Critical"
            is_anomalous = True
        elif risk_score >= 50.0:
            severity = "High"
            is_anomalous = True
        elif risk_score >= 30.0:
            severity = "Medium"
            is_anomalous = False
        else:
            severity = "Low"
            is_anomalous = False

        if not reasons:
            reasons.append("Standard login from registered device and familiar location")

        return {
            "risk_score": risk_score,
            "severity": severity,
            "is_anomalous": is_anomalous,
            "anomaly_reasons": reasons
        }

# Global singleton
anomaly_detector = LoginAnomalyDetector()
