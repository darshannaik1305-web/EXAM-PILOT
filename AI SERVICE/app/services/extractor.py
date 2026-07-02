# Orchestration layer for handling the PDF extraction flow using Google Gemini API.
import os
import json
import time
from pathlib import Path
from google import genai
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
        
        # Exact prompt instructions (preserved exactly as finalized)
        prompt = """
Extract all questions from this JEE paper.

Return JSON only.

[
  {
    "questionNumber": 1,
    "questionText": "",
    "optionA": "",
    "optionB": "",
    "optionC": "",
    "optionD": ""
  }
]

Rules:
- Extract all questions.
- Extract complete options.
- Ignore Question IDs.
- Ignore metadata.
- Return valid JSON only.
"""
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                uploaded_file,
                prompt
            ]
        )
        logger.info("Gemini Response Received")
    except APIError as api_err:
        logger.error("Extraction Failed")
        raise GeminiException(f"Google Gemini API error: {str(api_err)}")
    except Exception as e:
        logger.error("Extraction Failed")
        raise GeminiException(f"Failed to communicate with Gemini: {str(e)}")

    # 3. Response Parsing (preserved exactly)
    try:
        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "")

        if text.endswith("```"):
            text = text.replace("```", "")

        questions = json.loads(text)
    except json.JSONDecodeError as decode_err:
        logger.error("Extraction Failed")
        raise ExtractionException(f"Malformed JSON returned from model: {str(decode_err)}")
    except Exception as e:
        logger.error("Extraction Failed")
        raise ExtractionException(f"Failed to parse Gemini output: {str(e)}")

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
