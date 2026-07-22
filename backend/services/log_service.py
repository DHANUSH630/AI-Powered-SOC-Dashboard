"""
Log Management and Ingestion Service.
Handles log normalization, MongoDB batch insertion, threat pipeline execution, and log queries.
"""

from typing import List, Dict, Any, Optional
from collector.normalizer import normalize_log
from backend.database.crud import insert_log_batch, query_logs
from backend.services.threat_engine import process_log_for_threats

async def ingest_raw_log(raw_log: Any, log_type: str = "auto") -> Dict[str, Any]:
    """Ingest a single raw log entry, normalize it, run threat engine, and save."""
    normalized = normalize_log(raw_log, log_type=log_type)
    await insert_log_batch([normalized])
    await process_log_for_threats(normalized)
    return normalized

async def ingest_log_batch(raw_logs: List[Any], log_type: str = "auto") -> int:
    """Ingest a batch of logs."""
    normalized_list = [normalize_log(l, log_type=log_type) for l in raw_logs]
    inserted_count = await insert_log_batch(normalized_list)
    
    # Process threats asynchronously for each log
    for log_item in normalized_list:
        await process_log_for_threats(log_item)

    return inserted_count

async def fetch_logs(
    severity: Optional[str] = None,
    log_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Query logs from MongoDB with search and filter parameters."""
    query_filter = {}
    if severity and severity.upper() != "ALL":
        query_filter["severity"] = severity.upper()
    if log_type and log_type.lower() != "all":
        query_filter["logType"] = log_type.lower()
    if search:
        query_filter["message"] = {"$regex": search, "$options": "i"}

    return await query_logs(query_filter=query_filter, skip=skip, limit=limit)
