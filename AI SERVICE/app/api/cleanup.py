import os
from pathlib import Path
from fastapi import APIRouter, Depends
from app.utils.config import Settings, get_settings
from app.core.logger import logger

router = APIRouter()


@router.delete("/cleanup")
def cleanup_session_files(
    original_pdf_name: str = "",
    settings: Settings = Depends(get_settings)
):
    """
    Cleanup endpoint called when a practice session is cancelled or deleted.
    Removes:
      1. The original PDF from the uploads/ directory (if it still exists).
      2. All cropped diagram WebP images from storage/diagrams/ that match
         the PDF stem prefix (e.g. <stem>_q<n>.webp).

    Args:
        original_pdf_name: The original uploaded PDF filename (e.g. "jee2025.pdf").
    """
    deleted_files = []
    errors = []

    if not original_pdf_name:
        return {"deleted": [], "errors": ["No original_pdf_name provided."]}

    pdf_stem = Path(original_pdf_name).stem

    # 1. Delete PDF from uploads/ if still present
    pdf_path = settings.upload_path / original_pdf_name
    if pdf_path.exists():
        try:
            os.remove(pdf_path)
            logger.info(f"Cleanup: removed PDF {pdf_path}")
            deleted_files.append(str(pdf_path))
        except Exception as e:
            logger.warning(f"Cleanup: failed to remove PDF {pdf_path}: {e}")
            errors.append(str(e))
    else:
        logger.info(f"Cleanup: PDF not found (already deleted): {pdf_path}")

    # 2. Delete diagram WebP files from storage/diagrams/ matching this PDF stem
    diagrams_dir = settings.shared_diagrams_storage_path
    if diagrams_dir.exists():
        for diag_file in diagrams_dir.glob(f"{pdf_stem}_q*.webp"):
            try:
                os.remove(diag_file)
                logger.info(f"Cleanup: removed diagram {diag_file}")
                deleted_files.append(str(diag_file))
            except Exception as e:
                logger.warning(f"Cleanup: failed to remove diagram {diag_file}: {e}")
                errors.append(str(e))

    # 3. Delete output JSON file from output/ directory matching this PDF stem
    json_path = settings.output_path / f"{pdf_stem}.json"
    if json_path.exists():
        try:
            os.remove(json_path)
            logger.info(f"Cleanup: removed JSON file {json_path}")
            deleted_files.append(str(json_path))
        except Exception as e:
            logger.warning(f"Cleanup: failed to remove JSON file {json_path}: {e}")
            errors.append(str(e))

    logger.info(f"Cleanup complete for '{original_pdf_name}': {len(deleted_files)} file(s) deleted.")
    return {"deleted": deleted_files, "errors": errors}


@router.post("/cleanup/sync-active")
def sync_active_sessions(
    active_pdf_names: list[str],
    settings: Settings = Depends(get_settings)
):
    """
    Sync endpoint to delete any output JSON files, uploads, or diagram files on disk
    that are not referenced by any active practice session in the main database.
    This cleans up orphaned assets left from historical deletions.
    """
    deleted_files = []
    errors = []

    # 1. Map active PDF names to their stems
    active_stems = {Path(name).stem for name in active_pdf_names if name}
    active_names = {name for name in active_pdf_names if name}

    # 2. Scan uploads/ and delete any PDF not in active_names
    if settings.upload_path.exists():
        for pdf_file in settings.upload_path.glob("*.pdf"):
            if pdf_file.name not in active_names:
                try:
                    os.remove(pdf_file)
                    logger.info(f"Sync: removed orphaned PDF {pdf_file}")
                    deleted_files.append(str(pdf_file))
                except Exception as e:
                    errors.append(str(e))

    # 3. Scan output/ and delete any JSON not in active_stems
    if settings.output_path.exists():
        for json_file in settings.output_path.glob("*.json"):
            if json_file.stem not in active_stems:
                try:
                    os.remove(json_file)
                    logger.info(f"Sync: removed orphaned JSON {json_file}")
                    deleted_files.append(str(json_file))
                except Exception as e:
                    errors.append(str(e))

    # 4. Scan storage/diagrams/ and delete any WebP matching stem not in active_stems
    diagrams_dir = settings.shared_diagrams_storage_path
    if diagrams_dir.exists():
        for webp_file in diagrams_dir.glob("*.webp"):
            file_stem = webp_file.stem
            if "_q" in file_stem:
                prefix = file_stem.split("_q")[0]
                if prefix not in active_stems:
                    try:
                        os.remove(webp_file)
                        logger.info(f"Sync: removed orphaned diagram {webp_file}")
                        deleted_files.append(str(webp_file))
                    except Exception as e:
                        errors.append(str(e))

    return {"deleted": deleted_files, "errors": errors}
