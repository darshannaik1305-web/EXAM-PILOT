from pathlib import Path
import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status, Form

from app.utils.config import Settings, get_settings
from app.services import file_service, extract_answer_key
from app.core.logger import logger
from app.core.exceptions import GeminiException, FileStorageException
from app.core.constants import (
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    ERROR_INVALID_FORMAT,
    ERROR_INVALID_MIME
)

router = APIRouter()

@router.post("/answer-key")
async def upload_answer_key(
    file: UploadFile = File(...),
    expectedCount: Optional[int] = Form(None),
    settings: Settings = Depends(get_settings)
):
    """
    Accepts an answer key PDF file.
    - Saves it to disk.
    - Extracts the answer key mapping {questionNumber: answerOption} using Regex-first/Gemini-fallback.
    - Returns JSON response.
    """
    logger.info("Answer Key Upload Started")
    start_time = time.time()
    
    # 1. File Type Validation
    filename = Path(file.filename).name
    extension = Path(filename).suffix.lower()
    
    if extension not in ALLOWED_EXTENSIONS:
        logger.error("Answer Key Upload Failed: Invalid file extension.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_INVALID_FORMAT
        )

    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
         logger.error("Answer Key Upload Failed: Invalid MIME type.")
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_INVALID_MIME
        )

    # 2. Save PDF
    try:
        saved_filename = file_service.save_uploaded_file(file, settings)
        logger.info("Answer Key PDF Saved")
    except FileStorageException as fse:
        logger.error(f"Answer Key Upload Failed: File storage error - {str(fse)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(fse)
        )
    except Exception as e:
        logger.error(f"Answer Key Upload Failed: Unexpected storage error - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage error: {str(e)}"
        )

    # 3. Extract Answer Key
    saved_file_path = str(settings.upload_path / saved_filename)
    try:
        answers = extract_answer_key(saved_file_path, expected_count=expectedCount)
    except GeminiException as ge:
        raise HTTPException(
            status_code=status.HTTP_524_A_TIMEOUT_OCCURRED if "timeout" in str(ge).lower() else status.HTTP_502_BAD_GATEWAY,
            detail=str(ge)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Answer key extraction error: {str(e)}"
        )

    duration = time.time() - start_time
    logger.info(f"Answer Key Upload Completed in {duration:.2f} seconds")

    return {
        "success": True,
        "processingTimeSeconds": round(duration, 2),
        "totalQuestions": len(answers),
        "answers": answers
    }
