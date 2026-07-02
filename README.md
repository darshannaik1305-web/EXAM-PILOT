# ExamPilot 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-blue.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-violet.svg?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Authentication-JWT-red.svg?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-powered competitive exam practice test platform. ExamPilot enables students to upload standard competitive exam PDFs, automatically parses the question-answer structure using Google's state-of-the-art Gemini LLM, and transforms them into interactive online mock test sessions.

---

## 🌌 Project Vision
The vision of ExamPilot is to bridge the gap between static PDF question banks (like past JEE, NEET, or SAT papers) and interactive, metrics-driven learning. By automating structural extraction via LLMs, the platform immediately generates high-fidelity, interactive practice screens, tracks detailed user sessions, and lays the groundwork for adaptive AI tutoring.

---

## 🛠️ Key Features

### ✅ Current Features (Implemented)
- **Multipart Document Intake**: Handles multipart uploads of exam PDFs with custom titles and practice configurations.
- **State-Machine Lifecycle Tracking**: Practice sessions undergo atomic state progressions: `UPLOADING` ➔ `EXTRACTING` ➔ `READY` (or `FAILED` upon errors).
- **Synchronous Microservice Client**: Spring Boot bridges to the FastAPI microservice via a synchronous HTTP `RestClient` configured with strict timeouts.
- **LLM Question Extraction**: FastAPI uses Google Gemini 2.5 Flash to structurally dissect PDF pages into clean JSON question blocks (questions, option arrays, correct answers, and explanations).
- **Unified Security Filter**: Validates stateless requests via a custom JWT-based authentication filter.
- **Structured Error Handling**: Traps remote API gateway issues and maps them to clean client DTOs.

### 🚧 In Progress
- **Question Database Persistence**: Spring Boot schema tables to map and persist extracted questions for future mock session generation.

### 🔮 Upcoming Features
- **Interactive Mock Test Engine**: Live timer-based mock exam interface with option selectors.
- **Comprehensive Review Screen**: Side-by-side comparison of student answers against extracted keys and AI-generated explanations.
- **Performance Analytics**: Diagnostic reports highlighting weak topics, subjects, and time spent per question.
- **Adaptive AI Prep**: Recommends personalized mini-tests based on diagnosed weaknesses.

---

## 💻 Technology Stack

### Backend (Core Logic & Security)
- **Language**: Java 17
- **Framework**: Spring Boot 3.2.5 (Starter Web, Starter Security, Starter Data JPA)
- **Database Access**: Hibernate ORM
- **HTTP Client**: `RestClient` with customized `SimpleClientHttpRequestFactory` for timeout controls
- **Build Tool**: Maven

### AI Service (PDF & LLM Processing)
- **Language**: Python 3.10+
- **Framework**: FastAPI (ASGI server)
- **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash model)
- **Validation**: Pydantic v2 schemas
- **PDF Handling**: PyMuPDF / PDF processing utilities

### Database
- **Engine**: MySQL 8.0 (Schema `MOCK_TESTER`)

### Authentication
- **Mechanism**: JSON Web Token (JWT) stateless authorization header

---

## 🏗️ Architecture Overview

```mermaid
sequenceDiagram
    actor Student as Student
    participant SB as Spring Boot Backend
    participant FA as FastAPI AI Service
    participant Gemini as Google Gemini API
    database DB as MySQL Database

    Student->>SB: POST /api/practice/sessions (PDF + Auth Header)
    Note over SB: Validate JWT & User context
    SB->>DB: INSERT PracticeSession (Status: UPLOADING)
    SB->>DB: UPDATE PracticeSession (Status: EXTRACTING)
    
    SB->>FA: POST /upload (File Part, X-Processing-Job-Id)
    Note over FA: Save PDF, extract content
    FA->>Gemini: Parse text/images from PDF
    Gemini-->>FA: Extracted JSON structure
    FA-->>SB: JSON: Success, processing duration, questions list
    
    Note over SB: Parse questions & save
    SB->>DB: UPDATE PracticeSession (Status: READY, questions count)
    SB-->>Student: 200 OK (PracticeSessionCreateResponse)
```

For a detailed review of the microservices design, check out [MICROSERVICE_ARCHITECTURE.md](file:///e:/ExamPilot/docs/MICROSERVICE_ARCHITECTURE.md).

---

## 📂 Repository Structure
```text
ExamPilot/
│
├── BACKEND/             # Spring Boot Production Backend (REST API, JWT, DB layer)
├── AI SERVICE/          # FastAPI Production AI Microservice (Gemini wrapper)
├── research/            # Research prototypes & historical experiments
│   └── pdf-extraction/  # Prototype OCR scripts & past PDF text extraction codes
├── docs/                # Architectural & project documentation files
│   ├── ROADMAP.md
│   ├── TECH_STACK.md
│   ├── MICROSERVICE_ARCHITECTURE.md
│   ├── API_OVERVIEW.md
│   ├── FUTURE_FEATURES.md
│   └── PROJECT_TIMELINE.md
└── PROJECT_STRUCTURE.md # Repository organization blueprint
```

---

## 🚀 Installation & Running Guide

### 📋 Prerequisites
- **Java**: JDK 17 installed and mapped to `JAVA_HOME`.
- **Python**: Python 3.10+ installed with `pip`.
- **Database**: Running MySQL 8.0 instance with a database named `MOCK_TESTER`.
- **API Keys**: Active Google Gemini API Key.

---

### How to Run Spring Boot Backend

1. Navigate to the `BACKEND` directory:
   ```bash
   cd BACKEND
   ```
2. Configure your local `application.properties`:
   Ensure your database connection details are updated in `src/main/resources/application.properties`.
3. Start the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will boot up on port `4040`.*

---

### How to Run FastAPI AI Service

1. Navigate to the `AI SERVICE` directory:
   ```bash
   cd "AI SERVICE"
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `AI SERVICE` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The service will start on port `8000`.*

---

## 🔑 Environment Variables

| Variable Name | Location | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AI SERVICE/.env` | Access credential key for Google Gemini model |
| `PORT` | `AI SERVICE/.env` | Network port for the FastAPI web server |

---

## 🔗 API Overview

| Service | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Spring Boot** | `POST` | `/api/auth/register` | Register a new user | No |
| **Spring Boot** | `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| **Spring Boot** | `POST` | `/api/practice/sessions` | Create practice session & upload PDF | Yes (Bearer JWT) |
| **FastAPI** | `GET` | `/health` | Check microservice health status | No |
| **FastAPI** | `POST` | `/upload` | Extract questions directly from PDF | No (Internal) |

For complete payloads, request headers, and responses, view [API_OVERVIEW.md](file:///e:/ExamPilot/docs/API_OVERVIEW.md).

---

## 🔮 Future Roadmap
Check out our extensive [ROADMAP.md](file:///e:/ExamPilot/docs/ROADMAP.md) detailing past achievements and plans for future sprints.

---

## 🤝 Contribution Guidelines
1. Do not modify production configurations or API schemas without consulting the design documents under `docs/`.
2. Ensure that any backend REST changes match the structure mappings inside [PROJECT_STRUCTURE.md](file:///e:/ExamPilot/PROJECT_STRUCTURE.md).
3. Test locally using Postman with valid JWTs before pushing.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Contact
For questions or feedback, please contact the repository maintainers.
