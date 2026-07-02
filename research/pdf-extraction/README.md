# PDF Extraction Research & Historical Experiments

This directory contains historical scripts, PDF assets, and various experiment versions developed during the research phase for extracting questions from PDFs (including OCR, Gemini prototype scripts, page segmentations, and parsing logics).

> [!NOTE]
> **Production Migration**:
> All active production code for question paper processing and AI-driven Gemini models has been migrated into the [AI SERVICE](file:///e:/ExamPilot/AI%20SERVICE) microservice module.
> 
> Please refer to [AI SERVICE](file:///e:/ExamPilot/AI%20SERVICE) for the active FastAPI production codebase.

## Directory Structure
- `python-ocr/`: Directory housing the historical scripts and experiment outputs.
  - `extractor.py`: Prototype extractor orchestrator.
  - `output.json`: Prototype JSON question extraction structure.
  - `archive/`: Old scripts, normalizers, and experimental OCR prototypes.
  - `uploads/` / `output/`: Prototype file storage directories.
