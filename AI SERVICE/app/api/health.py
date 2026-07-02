from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify the service status.
    Returns status: UP and the service name.
    """
    return {
        "status": "UP",
        "service": "ExamPilot AI Service"
    }
