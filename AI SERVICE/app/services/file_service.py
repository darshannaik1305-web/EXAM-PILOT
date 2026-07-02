import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.utils.config import Settings
from app.core.logger import logger

def save_uploaded_file(file: UploadFile, settings: Settings) -> str:
    """
    Saves an uploaded file to the configured uploads directory.
    - Sanitizes the file name.
    - Copies the file contents to the target directory.
    
    Args:
        file (UploadFile): The uploaded file object from the API layer.
        settings (Settings): The application configurations.
        
    Returns:
        str: The sanitized filename of the saved file.
    """
    filename = Path(file.filename).name
    logger.info(f"File received for saving: {filename}")
    
    upload_file_path = settings.upload_path / filename

    try:
        with open(upload_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"File successfully saved to disk: {upload_file_path}")
    except Exception as e:
        logger.error(f"Failed to save file {filename} to disk: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
    return filename


def delete_file(file_path: str) -> None:
    """
    Placeholder: Deletes a file from the system.
    
    Args:
        file_path (str): Path of the file to delete.
    """
    logger.info(f"Request received to delete file: {file_path}")
    # TODO: Implement file deletion logic (e.g. cleaning up temporary or processed files)
    pass


def move_to_archive(file_path: str, settings: Settings) -> str:
    """
    Placeholder: Moves a file from its current path to the archive directory.
    
    Args:
        file_path (str): The current path of the file.
        settings (Settings): The application configuration.
        
    Returns:
        str: The new path of the archived file.
    """
    logger.info(f"Request received to archive file: {file_path}")
    # TODO: Implement file migration to archive folder after processing
    return ""
