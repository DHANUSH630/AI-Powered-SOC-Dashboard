"""
Input Validation Utilities for SentinelAI.

Provides validation functions for common inputs like
IP addresses, email addresses, and security-related data.
"""

import re
from ipaddress import IPv4Address, IPv6Address, ip_address


def is_valid_ip(ip: str) -> bool:
    """
    Validate whether a string is a valid IPv4 or IPv6 address.

    Args:
        ip: The IP address string to validate.

    Returns:
        True if the IP is valid, False otherwise.
    """
    try:
        ip_address(ip)
        return True
    except ValueError:
        return False


def is_valid_email(email: str) -> bool:
    """
    Validate an email address format.

    Args:
        email: The email string to validate.

    Returns:
        True if the email format is valid, False otherwise.
    """
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def is_valid_hash(hash_str: str) -> dict[str, bool]:
    """
    Determine the type of a hash string (MD5, SHA-1, SHA-256).

    Args:
        hash_str: The hash string to classify.

    Returns:
        Dictionary indicating which hash types it could be.
    """
    clean = hash_str.strip().lower()
    return {
        "md5": bool(re.match(r"^[a-f0-9]{32}$", clean)),
        "sha1": bool(re.match(r"^[a-f0-9]{40}$", clean)),
        "sha256": bool(re.match(r"^[a-f0-9]{64}$", clean)),
    }


def is_valid_domain(domain: str) -> bool:
    """
    Validate a domain name format.

    Args:
        domain: The domain string to validate.

    Returns:
        True if the domain format is valid, False otherwise.
    """
    pattern = (
        r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)"
        r"+[a-zA-Z]{2,}$"
    )
    return bool(re.match(pattern, domain))


def is_valid_port(port: int) -> bool:
    """Check if a port number is within the valid range (1-65535)."""
    return 1 <= port <= 65535


def validate_password_strength(password: str) -> dict[str, bool]:
    """
    Check password strength against security requirements.

    Returns a dictionary of requirements and whether they are met.
    """
    return {
        "min_length": len(password) >= 8,
        "has_uppercase": bool(re.search(r"[A-Z]", password)),
        "has_lowercase": bool(re.search(r"[a-z]", password)),
        "has_digit": bool(re.search(r"\d", password)),
        "has_special": bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)),
    }


def sanitize_log_query(query: str) -> str:
    """
    Sanitize a log search query to prevent NoSQL injection.

    Removes MongoDB operator prefixes and special characters.
    """
    # Remove MongoDB operators
    sanitized = re.sub(r"\$\w+", "", query)
    # Remove curly braces (potential JSON injection)
    sanitized = sanitized.replace("{", "").replace("}", "")
    return sanitized.strip()
