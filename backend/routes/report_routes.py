from fastapi import APIRouter, Depends, Response
from backend.services.report_service import generate_csv_alerts_report, generate_json_executive_summary
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["Reporting"])

@router.get("/csv/alerts")
async def download_alerts_csv(current_user: dict = Depends(get_current_user)):
    """Download security alerts export in CSV format."""
    csv_data = await generate_csv_alerts_report()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinelai_alerts_report.csv"}
    )

@router.get("/executive-summary")
async def get_executive_summary(current_user: dict = Depends(get_current_user)):
    """Generate executive JSON security posture summary report."""
    return await generate_json_executive_summary()
