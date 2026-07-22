"""
YARA & Sigma Rule Evaluation Engine for SentinelAI.
Parses and matches YARA and Sigma security rules against normalized log payloads.
"""

import re
from typing import Dict, Any, List

class SigmaEngine:
    """Evaluates YARA and Sigma detection rules."""

    @classmethod
    def evaluate_yara_rule(cls, yara_rule_text: str, log_message: str) -> Dict[str, Any]:
        """Evaluate YARA rule string against a target log string."""
        # Extract strings condition from YARA rule
        string_matches = re.findall(r'"([^"]+)"', yara_rule_text)
        matched_strings = []

        for string_pattern in string_matches:
            if string_pattern in log_message or re.search(re.escape(string_pattern), log_message, re.IGNORECASE):
                matched_strings.append(string_pattern)

        is_match = len(matched_strings) > 0 if string_matches else False

        return {
            "is_matched": is_match,
            "matched_patterns": matched_strings,
            "rule_status": "MATCHED" if is_match else "NO_MATCH",
            "evaluated_length": len(log_message),
        }
