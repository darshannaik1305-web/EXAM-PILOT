# ExamPilot AI Service

This is the AI Microservice for the **ExamPilot** final year project. 
It is built with **FastAPI** and runs independently of the main Spring Boot backend. Its role is to handle AI-related tasks such as PDF text extraction and integration with LLM APIs (e.g., Gemini).

## Project Structure

```text
AI SERVICE/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application initialization & routing
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py    # Health-check endpoint (/health)
│   │   └── upload.py    # PDF upload endpoint (/upload)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── extractor.py # PDF extraction orchestrator (placeholder)
│   │   ├── file_service.py # Core file operations (save, archive, delete)
│   │   └── gemini_service.py # Google Gemini client integration interface
│   │
│   ├── core/            # Core system package (logging, constants, exceptions)
│   │   ├── __init__.py
│   │   ├── logger.py    # Reusable formatted console logger
│   │   ├── constants.py # Storage paths, allowed formats, response strings
│   │   └── exceptions.py# Custom service exception classes
│   │
│   ├── models/          # Domain model entities (empty)
│   │   └── __init__.py
│   │
│   ├── utils/           # Helper functions & configuration
│   │   ├── __init__.py
│   │   └── config.py    # System settings loaders and directory bootstrap
│   │
│   └── schemas/         # Pydantic validation schemas
│       └── __init__.py
│
├── uploads/             # Received PDFs are stored here
├── archive/             # Archived files
├── output/              # Extracted output results
├── .env                 # Environment configuration variables
├── requirements.txt     # Python dependency list
└── README.md            # This documentation file
```

## Setup & Installation

### 1. Prerequisites
Ensure you have Python 3.8+ installed on your system.

### 2. Create a Virtual Environment
Navigate to the `AI SERVICE` directory and create a virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- **Linux/macOS:**
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Running the Service
To run the server in development mode with auto-reload enabled:
```bash
uvicorn app.main:app --reload --port 8000
```
The API documentation will be available at:
* Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## API Endpoints

### 1. Health Endpoint
* **URL:** `/health`
* **Method:** `GET`
* **Response:**
  ```json
  {
      "status": "UP",
      "service": "ExamPilot AI Service"
  }
  ```

### 2. Upload Endpoint
* **URL:** `/upload`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`
* **Parameters:** `file` (PDF file)
* **Response:**
  ```json
  {
      "message": "PDF uploaded successfully",
      "filename": "your_file.pdf"
  }
  ```

---

## Future AI Pipeline

The sequence below outlines the operational flow for question paper ingestion and structured text parsing:

```text
Spring Boot
     ↓
JWT Authentication
     ↓
FastAPI Upload API
     ↓
File Service
     ↓
Extractor Orchestrator
     ↓
Gemini Service
     ↓
Gemini API
     ↓
Structured JSON
     ↓
Spring Boot
     ↓
Database
```
