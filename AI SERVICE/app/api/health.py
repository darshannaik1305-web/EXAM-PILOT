from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Health check endpoint to verify the service status.
    Returns status: UP, the service name, and version metadata.
    """
    return {
        "status": "UP",
        "service": "ExamPilot AI Service",
        "version": "1.0.0"
    }
