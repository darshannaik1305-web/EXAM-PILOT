# ExamPilot Project Structure

This document outlines the directory structure and architectural layout of the **ExamPilot** repository.

## Repository Layout

```text
ExamPilot/
│
├── FRONTEND/         -> React + Vite Single-Page Application
├── BACKEND/          -> Spring Boot Production Backend
├── AI SERVICE/       -> FastAPI Production AI Microservice
├── research/         -> Research and Experiments
│   └── pdf-extraction/ -> Historical PDF parsing and OCR experiments
│
├── docs/             -> Documentation (future expansion)
│
├── .gitignore        -> Root git configuration
├── PROJECT_STRUCTURE.md -> This architecture blueprint
└── README.md         -> General repository introduction
```

---

## Modules & Component Responsibilities

### 1. [FRONTEND](file:///e:/ExamPilot/FRONTEND)
- **Technology Stack**: React 19, Vite 8, Tailwind CSS v4, Axios, React Router, Lucide React, React Hot Toast.
- **Responsibility**: Serves as the interactive single-page application client. It handles user authentication workflows (login, registration), file uploads for PDF parsing, interactive exam and session management dashboards, responsive mock test execution screens, and real-time state visualization of practice session extractions.

### 2. [BACKEND](file:///e:/ExamPilot/BACKEND)
- **Technology Stack**: Java 17, Spring Boot 3.2.5, JPA / Hibernate, MySQL, Spring Security (JWT-based).
- **Responsibility**: Serves as the core production REST API backend. It manages the application database, handles user authentication, tracks practice session states, coordinates uploads, serves REST resources, and performs transaction management.
- **AI Service Integration**: Uses Spring Boot's new `RestClient` (configured with connect and read timeouts) to integrate synchronously with the FastAPI AI service.

### 3. [AI SERVICE](file:///e:/ExamPilot/AI%20SERVICE)
- **Technology Stack**: Python 3.8+, FastAPI, Google GenAI SDK (Gemini 2.5 Flash), Pydantic v2.
- **Responsibility**: Performs production-grade AI microservice tasks. It acts as the AI processing microservice, receiving uploaded competitive exam PDFs, orchestrating Gemini content generation calls to parse questions, and returning structured questions JSON directly in HTTP responses.
- **Observability**: Implements tracing support via logging of the request correlation header `X-Processing-Job-Id`.

### 4. [research](file:///e:/ExamPilot/research)
- **Responsibility**: Holds historical code, scripts, prototypes, and experiments.
- **Content**: 
  - `pdf-extraction/python-ocr/`: Contains earlier prototypes of PDF extraction, raw text classifiers, local OCR processing, and historical test PDFs used during initial development. Kept for research reference only.

### 5. `docs/`
- **Responsibility**: Reserved for architectural documentation, design specifications, and developer setup instructions.
