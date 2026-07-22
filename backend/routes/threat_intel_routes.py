from fastapi import APIRouter, Depends, Query
from backend.services.threat_intel_service import lookup_ip_reputation, lookup_domain_reputation, lookup_file_hash
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

@router.get("/ip")
async def get_ip_intel(
    ip: str = Query(..., description="IP address to investigate"),
    current_user: dict = Depends(get_current_user)
):
    """Enrich IP address with reputation and threat intelligence data."""
    return await lookup_ip_reputation(ip)

@router.get("/domain")
async def get_domain_intel(
    domain: str = Query(..., description="Domain name to check"),
    current_user: dict = Depends(get_current_user)
):
    """Enrich domain name with DNS and reputation metrics."""
    return await lookup_domain_reputation(domain)

@router.get("/hash")
async def get_hash_intel(
    hash_val: str = Query(..., description="MD5 or SHA-256 hash"),
    current_user: dict = Depends(get_current_user)
):
    """Check file hash against VirusTotal and malware intelligence databases."""
    return await lookup_file_hash(hash_val)
