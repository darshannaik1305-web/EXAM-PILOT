import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the base directory of the project (AI SERVICE/)
# __file__ is app/utils/config.py -> parent is app/utils/ -> parent.parent is app/ -> parent.parent.parent is root
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    """
    Application settings class using Pydantic BaseSettings.
    Loads configurations from .env file or environment variables.
    """
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENV: str = "development"
    
    # Upload and storage directories relative to BASE_DIR or as absolute paths
    UPLOAD_DIR: str = "uploads"
    ARCHIVE_DIR: str = "archive"
    OUTPUT_DIR: str = "output"
    
    # Diagram extraction rendering parameters
    CROP_RENDER_SCALE: int = 3
    WEBP_QUALITY: int = 80
    MIN_DIAGRAM_CONFIDENCE: float = 0.85
    WARNING_DIAGRAM_CONFIDENCE: float = 0.60
    MIN_CROP_DIMENSION: int = 60
    CROP_PADDING_PERCENT: float = 0.10
    
    # API key for Gemini models
    GEMINI_API_KEY: str = ""

    # Cloudinary Cloud Storage Config
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def upload_path(self) -> Path:
        """Returns resolved Path object for the upload directory."""
        path = Path(self.UPLOAD_DIR)
        return path if path.is_absolute() else BASE_DIR / path

    @property
    def archive_path(self) -> Path:
        """Returns resolved Path object for the archive directory."""
        path = Path(self.ARCHIVE_DIR)
        return path if path.is_absolute() else BASE_DIR / path

    @property
    def output_path(self) -> Path:
        """Returns resolved Path object for the output directory."""
        path = Path(self.OUTPUT_DIR)
        return path if path.is_absolute() else BASE_DIR / path

    @property
    def shared_diagrams_storage_path(self) -> Path:
        """Returns resolved Path object for the shared diagrams storage directory."""
        return BASE_DIR.parent / "storage" / "diagrams"

    def create_required_directories(self) -> None:
        """Dynamically creates storage directories if they do not exist."""
        self.upload_path.mkdir(parents=True, exist_ok=True)
        self.archive_path.mkdir(parents=True, exist_ok=True)
        self.output_path.mkdir(parents=True, exist_ok=True)
        self.shared_diagrams_storage_path.mkdir(parents=True, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    """
    Returns cached settings instance.
    Uses lru_cache to avoid reading the file system multiple times.
    """
    settings = Settings()
    settings.create_required_directories()
    return settings
