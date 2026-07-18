# Orchestration layer for handling the PDF extraction flow using Google Gemini API.
import os
import json
import time
from pathlib import Path
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.core.logger import logger
from app.core.exceptions import ExtractionException, GeminiException, FileStorageException
from app.utils.config import get_settings

def extract_pdf(file_path: str) -> dict:
    """
    Orchestrates the complete PDF extraction workflow using the finalized Gemini integration.
    - Reads API key and config settings.
    - Initializes google-genai Client.
    - Sends file upload and prompt queries.
    - Cleans and parses output.
    - Generates output/<filename>.json.
    - Logs extraction milestones, durations, and exceptions.
    
    Args:
        file_path (str): The path to the uploaded PDF file.
        
    Returns:
        dict: The structured questions list.
        
    Raises:
        GeminiException: For API connection or credentials issues.
        ExtractionException: For JSON format/parsing issues.
        FileStorageException: For disk writing issues.
    """
    logger.info("Extraction Started")
    start_time = time.time()
    
    # 1. Config Loading & Key Verification
    try:
        settings = get_settings()
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("Extraction Failed")
            raise GeminiException("GEMINI_API_KEY is not configured in the application settings.")
    except Exception as e:
        logger.error("Extraction Failed")
        raise ExtractionException(f"Configuration retrieval failed: {str(e)}")

    # 2. Client Initialization & Upload
    try:
        client = genai.Client(api_key=api_key)
        
        logger.info("Gemini Request Sent")
        uploaded_file = client.files.upload(file=file_path)
        
        # Exact prompt instructions (extended to include diagram metadata coordinates)
        prompt = """
Extract all questions from this competitive exam paper.

Return JSON only.

[
  {
    "questionNumber": 1,
    "questionText": "",
    "optionA": "",
    "optionB": "",
    "optionC": "",
    "optionD": "",
    "correctAnswer": "",
    "subject": "",
    "difficulty": "",
    "explanation": "",
    "solution": "",
    "hasDiagram": false,
    "diagramPage": 0,
    "diagramBoundingBox": [0, 0, 0, 0],
    "diagramConfidence": 0.0,
    "diagramType": ""
  }
]

Rules:
- Extract all questions.
- Extract complete options.
- Extract correctAnswer (should be one of A, B, C, or D. If not directly available, leave blank).
- Extract subject (e.g. Physics, Chemistry, Mathematics).
- Extract difficulty (e.g. Easy, Medium, Hard).
- Extract explanation (short text describing why the answer is correct).
- Extract solution (step-by-step mathematical/conceptual solution detail).
- Ignore Question IDs.
- Ignore metadata.
- Return valid JSON only.
- For each question, if it refers to a diagram, graph, chemical structure, geometry figure, biology drawing, or flowchart, set "hasDiagram" to true, specify the "diagramPage" (1-based page number), identify the diagram's bounding box coordinates as "diagramBoundingBox" in [ymin, xmin, ymax, xmax] format (normalized 0-1000 range), provide the confidence score as "diagramConfidence" (0.0 to 1.0), and classify its category as "diagramType" (from: Circuit, Graph, Geometry, Chemical Structure, Biology Figure, Flowchart, Image, Table, General Diagram). Otherwise, set "hasDiagram" to false, "diagramPage" to 0, "diagramBoundingBox" to [0, 0, 0, 0], "diagramConfidence" to 0.0, and "diagramType" to "".
- If a question has multiple separate diagrams, or if the options (1, 2, 3, 4) themselves are graphs or drawings, you MUST specify a single "diagramBoundingBox" that is wide and tall enough to enclose ALL of those option diagrams/graphs and their labels (1, 2, 3, 4) together as a single image. Make the box horizontally wider by at least 10% on both the left and right sides so the outermost curves and labels like (1) and (4) are not clipped.
- Avoid Text Tables: Do NOT treat standard text-based tables (such as match-the-column matrices, lists of quantities, or data rows) as diagrams. These tables must be extracted as formatted text/markdown within "questionText" or "optionText" (as done in match-the-column questions), and MUST NOT be included in the "diagramBoundingBox". The bounding box must target only the actual drawings or illustrations (e.g. flywheels).
- Exclude Text & Solutions: The "diagramBoundingBox" must target ONLY the actual drawings, graphs, geometry diagrams, wave shapes, circuits, or chemical structures. It must NEVER enclose the question text, option texts (unless they are drawings), answer keys (like 'Ans. 4'), or step-by-step solutions.
- Bounding Box Generosity: Ensure the "diagramBoundingBox" coordinates are generous and have breathing room. It must fully cover the entire graphic area plus all associated textual labels, coordinates, vertex labels (e.g. C (1/2, y) or A (1kg)), weight values, legend keys, and annotations, rather than cropping too tightly. Err on the side of a slightly larger box to avoid clipping details.
- Avoid LaTeX Backslashes: Never output raw backslash characters or LaTeX math syntax (like \\sqrt or \\frac) inside any JSON text field. If you need to write equations, square roots, or fractions, use plain unicode text or standard text representations (e.g., write 'sqrt(3)' instead of \\sqrt{3}, and 'theta' instead of \\theta). This is critical to prevent JSON formatting errors.
"""
        
        # Implement retry logic for 503 UNAVAILABLE server errors
        max_retries = 3
        retry_delay = 5
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[
                        uploaded_file,
                        prompt
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                logger.info("Gemini Response Received")
                break
            except APIError as api_err:
                # If it's a 503 error, retry after delay
                is_503 = getattr(api_err, "code", None) == 503 or "503" in str(api_err) or "UNAVAILABLE" in str(api_err)
                if is_503 and attempt < max_retries - 1:
                    logger.warning(f"Gemini API returned 503 (High Demand). Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(retry_delay)
                    continue
                raise
            except Exception as e:
                is_503 = "503" in str(e) or "UNAVAILABLE" in str(e)
                if is_503 and attempt < max_retries - 1:
                    logger.warning(f"Gemini API call failed with 503. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(retry_delay)
                    continue
                raise
    except APIError as api_err:
        logger.error("Extraction Failed")
        raise GeminiException(f"Google Gemini API error: {str(api_err)}")
    except Exception as e:
        logger.error("Extraction Failed")
        raise GeminiException(f"Failed to communicate with Gemini: {str(e)}")

    # 3. Response Parsing (preserved exactly)
    try:
        text = response.text.strip()

        # Clean markdown code block fences if present
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        questions = json.loads(text, strict=False)
    except json.JSONDecodeError as decode_err:
        logger.error("Extraction Failed")
        raise ExtractionException(f"Malformed JSON returned from model: {str(decode_err)}")
    except Exception as e:
        logger.error("Extraction Failed")
        raise ExtractionException(f"Failed to parse Gemini output: {str(e)}")

    # 3.5 Coordinate-Based Diagram Cropping with Page-Cache and Padding Optimization
    import fitz
    from PIL import Image
    import gc

    questions_by_page = {}
    if isinstance(questions, list):
        for q in questions:
            if q.get("hasDiagram") and q.get("diagramPage") is not None:
                try:
                    page_num = int(q["diagramPage"])
                    if page_num > 0:
                        questions_by_page.setdefault(page_num - 1, []).append(q)
                except Exception as ex:
                    logger.warning(f"Failed to parse page number for question {q.get('questionNumber')}: {str(ex)}")

    if questions_by_page:
        logger.info(f"Opening PDF document for diagram extraction: {file_path}")
        try:
            doc = fitz.open(file_path)
            session_id = Path(file_path).stem
            
            for page_index, q_list in sorted(questions_by_page.items()):
                if page_index < 0 or page_index >= len(doc):
                    logger.warning(f"Page index {page_index} out of range for PDF {file_path}")
                    continue
                
                logger.info(f"Rendering PDF page {page_index + 1} at {settings.CROP_RENDER_SCALE}x scale")
                try:
                    page = doc.load_page(page_index)
                    zoom = settings.CROP_RENDER_SCALE
                    mat = fitz.Matrix(zoom, zoom)
                    pix = page.get_pixmap(matrix=mat)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    for q in q_list:
                        q_num = q.get("questionNumber", 0)
                        confidence = q.get("diagramConfidence", 1.0)
                        
                        # 1. Confidence threshold gate
                        if confidence < settings.WARNING_DIAGRAM_CONFIDENCE:
                            logger.info(f"[SKIP] Q{q_num} diagram confidence too low ({confidence})")
                            q["hasDiagram"] = False
                            continue
                        if confidence < settings.MIN_DIAGRAM_CONFIDENCE:
                            logger.warning(f"[WARNING] Q{q_num} cropping with low confidence ({confidence})")
                            
                        # 2. Coordinates validation
                        bbox = q.get("diagramBoundingBox")
                        if not bbox or not isinstance(bbox, list) or len(bbox) != 4:
                            logger.warning(f"[INVALID_COORDS] Q{q_num} box coordinates are missing or invalid: {bbox}")
                            continue
                        
                        try:
                            ymin, xmin, ymax, xmax = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
                        except Exception as parse_err:
                            logger.warning(f"[INVALID_COORDS] Q{q_num} failed to parse box coordinates to int: {bbox} - {str(parse_err)}")
                            continue

                        # Validate values within [0, 1000]
                        if not (0 <= ymin <= 1000 and 0 <= xmin <= 1000 and 0 <= ymax <= 1000 and 0 <= xmax <= 1000):
                            logger.warning(f"[INVALID_COORDS] Q{q_num} coordinates out of [0-1000] range: {bbox}")
                            continue
                        # Validate positive box sizes
                        if xmin >= xmax or ymin >= ymax:
                            logger.warning(f"[INVALID_COORDS] Q{q_num} bounding box dimensions are inverted: xmin={xmin}, xmax={xmax}, ymin={ymin}, ymax={ymax}")
                            continue
                            
                        # 3. Crop Padding Calculation
                        # Convert normalized values to pixels
                        left = int(xmin * pix.width / 1000)
                        top = int(ymin * pix.height / 1000)
                        right = int(xmax * pix.width / 1000)
                        bottom = int(ymax * pix.height / 1000)
                        
                        # Add padding percent and a safety margin in pixels
                        pad_w = int((right - left) * settings.CROP_PADDING_PERCENT) + 30
                        pad_h = int((bottom - top) * settings.CROP_PADDING_PERCENT) + 30
                        
                        # Clamp boundaries to page resolution limits
                        left = max(0, left - pad_w)
                        top = max(0, top - pad_h)
                        right = min(pix.width, right + pad_w)
                        bottom = min(pix.height, bottom + pad_h)
                        
                        crop_w = right - left
                        crop_h = bottom - top
                        
                        # 4. Ignore small crops
                        if crop_w < settings.MIN_CROP_DIMENSION or crop_h < settings.MIN_CROP_DIMENSION:
                            logger.info(f"[SKIP] Q{q_num} crop dimensions too small: {crop_w}x{crop_h}")
                            continue
                            
                        # 5. Crop & WebP Save
                        cropped = img.crop((left, top, right, bottom))
                        filename = f"{session_id}_q{q_num}.webp"
                        output_path = settings.shared_diagrams_storage_path / filename
                        
                        cropped.save(output_path, "WEBP", quality=settings.WEBP_QUALITY)
                        logger.info(f"Successfully cropped diagram for Q{q_num} saved to {output_path}")
                        
                        # Set output fields
                        q["diagramUrl"] = f"/uploads/diagrams/{filename}"
                        q["diagramWidth"] = crop_w
                        q["diagramHeight"] = crop_h
                        
                        # Free crop object
                        del cropped
                   
                    # Clean page rendering variables
                    del img
                    del pix
                    gc.collect()
                   
                except Exception as p_ex:
                    logger.error(f"Failed to process page {page_index + 1} for diagrams: {str(p_ex)}")
           
            doc.close()
        except Exception as doc_ex:
            logger.error(f"Failed to open PDF document or process diagrams: {str(doc_ex)}")

    # 4. JSON Output Generation
    try:
        pdf_filename = Path(file_path).name
        json_filename = f"{Path(pdf_filename).stem}.json"
        output_file_path = settings.output_path / json_filename

        with open(output_file_path, "w", encoding="utf-8") as f:
            json.dump(questions, f, indent=4, ensure_ascii=False)
            
        logger.info("JSON Saved")
    except IOError as io_err:
        logger.error("Extraction Failed")
        raise FileStorageException(f"Failed to save output JSON to disk: {str(io_err)}")
    except Exception as e:
        logger.error("Extraction Failed")
        raise FileStorageException(f"Failed to save output JSON: {str(e)}")

    duration = time.time() - start_time
    logger.info("Extraction Successful")
    logger.info(f"Extraction Duration : {duration:.2f} seconds")
    
    return questions
