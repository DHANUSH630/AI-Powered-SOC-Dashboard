"""
Feature Extractor for ML Threat Detection.
Converts normalized log dictionaries into numerical feature vectors for ML models.
"""

import re
import numpy as np
from typing import Dict, Any

def extract_features(log: Dict[str, Any]) -> np.ndarray:
    """
    Extract a 10-dimensional numerical feature vector from a log entry.

    Features:
    0: Message length
    1: Contains SQL keywords (0/1)
    2: Contains Script/HTML tags (0/1)
    3: Contains System file paths (0/1)
    4: Contains Shell/PowerShell keywords (0/1)
    5: Is Error/Failure (0/1)
    6: Is Critical level (0/1)
    7: Special character ratio
    8: Digit character ratio
    9: Upper case ratio
    """
    msg = log.get("message", "")
    msg_len = len(msg) if msg else 1

    has_sql = 1 if re.search(r"(?i)(select|union|insert|drop|where|or 1=1)", msg) else 0
    has_script = 1 if re.search(r"(?i)(<script|javascript|onerror|eval)", msg) else 0
    has_path = 1 if re.search(r"(?i)(\.\./|/etc/|/windows/|\.ini)", msg) else 0
    has_shell = 1 if re.search(r"(?i)(powershell|cmd|bash|sh|exec)", msg) else 0
    is_failure = 1 if re.search(r"(?i)(fail|denied|error|invalid)", msg) else 0
    is_critical = 1 if log.get("severity") in ["CRITICAL", "HIGH"] else 0

    special_chars = sum(1 for c in msg if not c.isalnum() and not c.isspace())
    digits = sum(1 for c in msg if c.isdigit())
    uppers = sum(1 for c in msg if c.isupper())

    special_ratio = special_chars / msg_len
    digit_ratio = digits / msg_len
    upper_ratio = uppers / msg_len

    features = [
        msg_len,
        has_sql,
        has_script,
        has_path,
        has_shell,
        is_failure,
        is_critical,
        special_ratio,
        digit_ratio,
        upper_ratio,
    ]

    return np.array(features, dtype=np.float64).reshape(1, -1)
