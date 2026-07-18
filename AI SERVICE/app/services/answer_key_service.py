import re
import os
import json
import time
from pathlib import Path
from google import genai
from google.genai import types
from google.genai.errors import APIError
from pypdf import PdfReader

from app.core.logger import logger
from app.core.exceptions import ExtractionException, GeminiException
from app.utils.config import get_settings

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from all pages of the PDF file."""
    try:
        reader = PdfReader(file_path)
        text_parts = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"Error reading PDF text: {str(e)}")
        return ""

def extract_via_regex(text: str, expected_count: int = None) -> dict:
    """
    Attempts to extract question-answer mappings using common regex patterns.
    Returns a dict like {1: "A", 2: "B"} and a confidence score between 0.0 and 1.0.
    """
    answers = {}
    
    # Clean text to normalize spaces
    normalized_text = re.sub(r'\s+', ' ', text)
    
    # Try different regex patterns
    # Pattern 1: "1. A" or "1) B" or "1 - C" or "1: D" or "1. (A)"
    # Matches: Q.No followed by divider followed by optional paren followed by option A-D followed by optional paren
    p1 = re.compile(r'\b(\d+)\s*[\.\)-:]+\s*\(?([A-D])\)?\b', re.IGNORECASE)
    matches = p1.findall(text)
    
    if len(matches) < 5:
        # Try Pattern 2: "Q1 A" or "Q1: A" or "Q01 - A"
        p2 = re.compile(r'\bQ(?:uestion)?\s*(\d+)\s*[\.\)-:]*\s*\(?([A-D])\)?\b', re.IGNORECASE)
        matches = p2.findall(text)
        
    if len(matches) < 5:
        # Try Pattern 3: Space-separated table like "1 A 2 B 3 C"
        p3 = re.compile(r'\b(\d+)\s+([A-D])\b', re.IGNORECASE)
        matches = p3.findall(normalized_text)
        
    for q_str, ans_str in matches:
        q_num = int(q_str)
        ans = ans_str.upper()
        # Prevent false positives (e.g. matching question options themselves as QA pairs)
        if q_num > 0 and q_num < 500:
            answers[q_num] = ans
            
    if not answers:
        return {}, 0.0
        
    # Calculate confidence
    if expected_count and expected_count > 0:
        # Fraction of expected questions successfully matched
        matched_expected = sum(1 for q in answers if q <= expected_count)
        confidence = matched_expected / expected_count
    else:
        # Fallback confidence based on contiguous question sequences
        max_q = max(answers.keys())
        confidence = len(answers) / max_q if max_q > 0 else 0.0
        
    # Cap confidence at 1.0
    confidence = min(1.0, confidence)
    return answers, confidence

def extract_via_gemini(file_path: str) -> dict:
    """Uses Gemini API to extract the answer key from the PDF file."""
    settings = get_settings()
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GeminiException("GEMINI_API_KEY is not configured.")
        
    try:
        client = genai.Client(api_key=api_key)
        uploaded_file = client.files.upload(file=file_path)
        
        prompt = """
Analyze this Answer Key PDF.
Extract the correct answers for all questions.

Return JSON mapping question numbers to their correct options (A, B, C, or D) only.
Example format:
{
  "1": "A",
  "2": "C",
  "3": "B"
}

Rules:
- Provide ONLY the JSON object. Do not include markdown code block formatting (like ```json).
- Map every question number to its correct answer option (uppercase A, B, C, or D).
- If a question has multiple correct options, return the first one or combine them if standard (e.g., "A").
"""
        # Implement retry logic for 503 UNAVAILABLE server errors
        max_retries = 3
        retry_delay = 5
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[uploaded_file, prompt],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                break
            except APIError as api_err:
                is_503 = getattr(api_err, "code", None) == 503 or "503" in str(api_err) or "UNAVAILABLE" in str(api_err)
                if is_503 and attempt < max_retries - 1:
                    logger.warning(f"Gemini API returned 503 (High Demand) during answer key extraction. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(retry_delay)
                    continue
                raise GeminiException(f"Gemini API error during answer key extraction: {str(api_err)}")
            except Exception as e:
                is_503 = "503" in str(e) or "UNAVAILABLE" in str(e)
                if is_503 and attempt < max_retries - 1:
                    logger.warning(f"Gemini API call failed with 503 during answer key extraction. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(retry_delay)
                    continue
                raise GeminiException(f"Failed to communicate with Gemini: {str(e)}")
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
            
        result = json.loads(text, strict=False)
        # Convert keys to integers and values to uppercase strings
        formatted_result = {int(k): str(v).upper() for k, v in result.items() if k.isdigit()}
        return formatted_result

def extract_answer_key(file_path: str, expected_count: int = None) -> dict:
    """Orchestrates answer key extraction with Regex-first and Gemini fallback."""
    logger.info(f"Answer Key Extraction Started for {Path(file_path).name}")
    start_time = time.time()
    
    # 1. Read PDF raw text
    pdf_text = extract_text_from_pdf(file_path)
    
    # 2. Try Regex match
    regex_answers = {}
    confidence = 0.0
    if pdf_text:
        regex_answers, confidence = extract_via_regex(pdf_text, expected_count)
        logger.info(f"Regex extraction confidence: {confidence:.2%}")
        
    # 3. If confidence is >= 60%, return regex results
    if confidence >= 0.60:
        logger.info("Regex extraction confidence meets threshold (>= 60%). Returning regex results.")
        duration = time.time() - start_time
        logger.info(f"Answer Key Extraction Successful (Regex) in {duration:.2f} seconds")
        # Format keys as strings for JSON response compatibility
        return {str(k): v for k, v in regex_answers.items()}
        
    # 4. Fallback to Gemini
    logger.info("Regex extraction confidence low. Falling back to Google Gemini...")
    try:
        gemini_answers = extract_via_gemini(file_path)
        duration = time.time() - start_time
        logger.info(f"Answer Key Extraction Successful (Gemini) in {duration:.2f} seconds")
        return {str(k): v for k, v in gemini_answers.items()}
    except Exception as e:
        logger.error(f"Gemini answer key extraction failed: {str(e)}")
        # If Gemini failed but we had some regex answers, fallback to regex answers as last resort
        if regex_answers:
            logger.warning("Gemini failed, falling back to lower-confidence regex results.")
            return {str(k): v for k, v in regex_answers.items()}
        raise e
