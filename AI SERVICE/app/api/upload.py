from pathlib import Path
import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status, Header

from app.utils.config import Settings, get_settings
from app.services import file_service, extractor
from app.core.logger import logger
from app.core.exceptions import ExtractionException, GeminiException, FileStorageException, InvalidPdfException
from app.core.constants import (
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    ERROR_INVALID_FORMAT,
    ERROR_INVALID_MIME
)
from app.schemas import ExtractionResponse, QuestionResponse

router = APIRouter()

@router.post("/upload", response_model=ExtractionResponse)
def upload_pdf(
    file: UploadFile = File(...),
    x_processing_job_id: Optional[str] = Header(None, alias="X-Processing-Job-Id"),
    settings: Settings = Depends(get_settings)
):
    """
    Upload endpoint for PDF files.
    - Logs "Upload Started" along with Job ID if present.
    - Validates file type format constraints.
    - Saves the PDF file via file_service.
    - Logs "PDF Saved".
    - Invokes extractor.extract_pdf to execute Gemini-based parsing.
    - Returns structured extraction response directly.
    """
    if x_processing_job_id:
        logger.info(f"Upload Started for Job ID: {x_processing_job_id}")
    else:
        logger.info("Upload Started")
    
    start_time = time.time()
    
    # 1. File Type Validation
    filename = Path(file.filename).name
    extension = Path(filename).suffix.lower()
    
    if extension not in ALLOWED_EXTENSIONS:
        logger.error("Upload Failed: Invalid file extension.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_INVALID_FORMAT
        )

    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
         logger.error("Upload Failed: Invalid MIME type.")
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_INVALID_MIME
        )

    # 2. Save PDF
    try:
        saved_filename = file_service.save_uploaded_file(file, settings)
        logger.info("PDF Saved")
    except FileStorageException as fse:
        logger.error(f"Upload Failed: File storage error - {str(fse)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(fse)
        )
    except Exception as e:
        logger.error(f"Upload Failed: Unexpected storage error - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage error: {str(e)}"
        )

    # 3. Call Extractor to run Gemini Parsing
    saved_file_path = str(settings.upload_path / saved_filename)
    try:
        try:
            questions = extractor.extract_pdf(saved_file_path)
        except InvalidPdfException as ipe:
            logger.error(f"Invalid PDF Exception: {str(ipe)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ipe)
            )
        except GeminiException as ge:
            logger.error(f"Gemini Exception: {str(ge)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(ge)
            )
        except ExtractionException as ee:
            logger.error(f"Extraction Exception: {str(ee)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(ee)
            )
        except FileStorageException as fse:
            logger.error(f"File Storage Exception: {str(fse)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(fse)
            )
        except Exception as e:
            logger.error(f"Unexpected Exception: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Extraction error: {str(e)}"
            )
    finally:
        # Cleanup uploaded PDF file to save disk space
        try:
            import os
            if os.path.exists(saved_file_path):
                os.remove(saved_file_path)
                logger.info(f"Cleaned up uploaded PDF from disk: {saved_file_path}")
        except Exception as cleanup_err:
            logger.warning(f"Failed to cleanup uploaded PDF: {str(cleanup_err)}")

    duration = time.time() - start_time

    # Map questions to match QuestionResponse schema
    mapped_questions = []
    if isinstance(questions, list):
        for q in questions:
            q_num = q.get("questionNumber")
            question_num = int(q_num) if q_num is not None else 0
            
            question_text = q.get("questionText") or q.get("question") or ""
            opt_a = q.get("optionA") or ""
            opt_b = q.get("optionB") or ""
            opt_c = q.get("optionC") or ""
            opt_d = q.get("optionD") or ""
            corr_ans = q.get("correctAnswer") or ""
            exp = q.get("explanation")
            subj = q.get("subject")
            diff = q.get("difficulty")
            sol = q.get("solution")
            diag_url = q.get("diagramUrl")
            diag_type = q.get("diagramType")
            diag_conf = q.get("diagramConfidence")
            diag_w = q.get("diagramWidth")
            diag_h = q.get("diagramHeight")

            mapped_questions.append(
                QuestionResponse(
                    questionNumber=question_num,
                    question=str(question_text),
                    optionA=str(opt_a),
                    optionB=str(opt_b),
                    optionC=str(opt_c),
                    optionD=str(opt_d),
                    correctAnswer=str(corr_ans),
                    explanation=str(exp) if exp is not None else None,
                    subject=str(subj) if subj is not None else None,
                    difficulty=str(diff) if diff is not None else None,
                    solution=str(sol) if sol is not None else None,
                    diagramUrl=str(diag_url) if diag_url is not None else None,
                    diagramType=str(diag_type) if diag_type is not None else None,
                    diagramConfidence=float(diag_conf) if diag_conf is not None else None,
                    diagramWidth=int(diag_w) if diag_w is not None else None,
                    diagramHeight=int(diag_h) if diag_h is not None else None
                )
            )

    return ExtractionResponse(
        success=True,
        processingTimeSeconds=round(duration, 2),
        totalQuestions=len(mapped_questions),
        questions=mapped_questions
    )

