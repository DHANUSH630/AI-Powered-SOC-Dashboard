"""
Machine Learning Anomaly Detection Engine for SentinelAI.
Uses Isolation Forest to detect zero-day anomalies in log streams.
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Optional
from ai_engine.preprocessing.feature_extractor import extract_features

class MLEngine:
    """Unsupervised Anomaly Detection using Isolation Forest."""

    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42
        )
        self.is_fitted = False
        self._bootstrap_model()

    def _bootstrap_model(self):
        """Initialize the model with baseline benign/suspicious synthetic feature distribution."""
        np.random.seed(42)
        # 200 sample baseline feature vectors
        benign_samples = np.random.normal(loc=[100, 0, 0, 0, 0, 0, 0, 0.1, 0.05, 0.1], scale=0.02, size=(180, 10))
        suspicious_samples = np.random.normal(loc=[250, 1, 1, 1, 1, 1, 1, 0.4, 0.3, 0.4], scale=0.05, size=(20, 10))
        X_train = np.vstack([benign_samples, suspicious_samples])
        self.model.fit(X_train)
        self.is_fitted = True

    def predict_anomaly(self, log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Evaluate log entry for ML anomalies.

        Returns anomaly score and threat metadata if an anomaly is detected.
        """
        if not self.is_fitted:
            return None

        features = extract_features(log)
        # Isolation Forest prediction: -1 = Anomaly, 1 = Normal
        prediction = self.model.predict(features)[0]
        # Score ranges roughly from -1 to 1; lower/negative means more anomalous
        raw_score = float(self.model.decision_function(features)[0])

        if prediction == -1:
            # Map decision function score to a 0.70-0.99 confidence
            confidence = round(min(0.99, max(0.70, 0.85 - raw_score)), 2)
            return {
                "is_anomaly": True,
                "attackType": "ML Zero-Day Anomaly",
                "severity": "HIGH" if confidence > 0.85 else "MEDIUM",
                "confidence": confidence,
                "anomalyScore": raw_score,
                "mitreId": "T1071",
                "cvssScore": 7.8,
                "recommendation": "Investigate anomalous payload structure and host telemetry.",
            }

        return None
