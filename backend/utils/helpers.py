"""
Helper utilities for SentinelAI.

Common utility functions used across the backend application.
"""

import re
from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    """Return the current UTC datetime."""
    return datetime.now(timezone.utc)


def to_iso_string(dt: datetime) -> str:
    """Convert a datetime object to an ISO 8601 string."""
    return dt.isoformat()


def parse_iso_string(iso_str: str) -> datetime:
    """Parse an ISO 8601 string into a datetime object."""
    return datetime.fromisoformat(iso_str)


def generate_incident_number() -> str:
    """
    Generate a unique incident number based on the current timestamp.

    Format: INC-YYYYMMDD-HHMMSS
    """
    now = utc_now()
    return f"INC-{now.strftime('%Y%m%d-%H%M%S')}"


def sanitize_string(value: str) -> str:
    """
    Sanitize a string by removing potentially dangerous characters.

    Strips HTML tags and common injection patterns.
    """
    # Remove HTML tags
    clean = re.sub(r"<[^>]*>", "", value)
    # Remove null bytes
    clean = clean.replace("\x00", "")
    return clean.strip()


def format_file_size(size_bytes: int) -> str:
    """Format a file size in bytes to a human-readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 ** 2:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 ** 3:
        return f"{size_bytes / 1024 ** 2:.1f} MB"
    else:
        return f"{size_bytes / 1024 ** 3:.1f} GB"


def paginate_params(
    page: int = 1, page_size: int = 20, max_page_size: int = 100
) -> tuple[int, int]:
    """
    Calculate skip and limit values for MongoDB pagination.

    Args:
        page: Current page number (1-indexed).
        page_size: Number of items per page.
        max_page_size: Maximum allowed page size.

    Returns:
        Tuple of (skip, limit) values.
    """
    page = max(1, page)
    page_size = min(max(1, page_size), max_page_size)
    skip = (page - 1) * page_size
    return skip, page_size


def mask_ip(ip: str) -> str:
    """
    Partially mask an IP address for privacy.

    Example: 192.168.1.100 -> 192.168.1.***
    """
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.{parts[2]}.***"
    return ip


def build_mongo_filter(
    filters: dict[str, Any], allowed_fields: set[str]
) -> dict[str, Any]:
    """
    Build a MongoDB filter dictionary from query parameters.

    Only includes fields that are in the allowed_fields set
    and have non-None values.
    """
    mongo_filter: dict[str, Any] = {}
    for field, value in filters.items():
        if field in allowed_fields and value is not None:
            mongo_filter[field] = value
    return mongo_filter
