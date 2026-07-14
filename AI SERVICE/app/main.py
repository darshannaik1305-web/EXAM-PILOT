from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.utils.config import get_settings
from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.mentor import router as mentor_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for FastAPI.
    Initializes application settings and creates necessary directories on startup.
    """
    settings = get_settings()
    settings.create_required_directories()
    yield


app = FastAPI(
    title="ExamPilot AI Service",
    description="Microservice responsible for AI tasks, PDF processing, and extraction.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration to allow frontend/backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router, tags=["Health"])
app.include_router(upload_router, tags=["Upload"])
app.include_router(mentor_router, tags=["Mentor"])


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
