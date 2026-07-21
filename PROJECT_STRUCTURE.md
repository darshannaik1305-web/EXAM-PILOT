# ExamPilot — Project Structure

This document outlines the full directory structure and component responsibilities of the **ExamPilot** repository.

---

## Repository Layout

```text
ExamPilot/
│
├── FRONTEND/                        # React + Vite Single-Page Application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── landing/             # Landing page section components
│   │   │   ├── layout/              # Header, Footer, Sidebar wrappers
│   │   │   └── ui/                  # Generic primitives (Button, Card, Modal)
│   │   ├── pages/                   # Top-level route page components
│   │   ├── context/                 # React Context providers (Auth, Theme)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # Axios API service layer modules
│   │   ├── utils/                   # Formatting helpers & shared utilities
│   │   └── config/                  # App-level constants & API config
│   ├── public/                      # Static assets
│   └── package.json
│
├── BACKEND/                         # Spring Boot REST API (Java 17)
│   ├── src/main/java/com/AI_BASED/BACKEND/
│   │   ├── CONFIG/                  # CORS, Security, Bean configurations
│   │   ├── CONTROLLER/              # REST endpoint controllers
│   │   ├── DTO/                     # Request / Response Data Transfer Objects
│   │   ├── ENTITY/                  # JPA entity models (DB tables)
│   │   ├── EXCEPTION/               # Global exception handler & custom exceptions
│   │   ├── INTEGRATION/             # FastAPI microservice HTTP client (RestClient)
│   │   ├── JWT/                     # JWT filter, provider & utilities
│   │   ├── REPOSITORY/              # Spring Data JPA repository interfaces
│   │   ├── SERVICE/                 # Business logic service layer
│   │   └── UTIL/                    # Shared internal utility classes
│   ├── src/main/resources/
│   │   ├── application.properties   # Spring Boot config (env-variable driven)
│   │   └── db/migration/            # Flyway versioned SQL migration scripts (V1–V5+)
│   ├── .env.example                 # ← Copy to .env & fill credentials
│   └── pom.xml                      # Maven build descriptor
│
├── AI SERVICE/                      # FastAPI AI Microservice (Python 3.10+)
│   ├── app/
│   │   ├── api/                     # FastAPI route handlers (upload, cleanup, health)
│   │   ├── services/                # Extractor service (Gemini) & Cloudinary uploader
│   │   ├── utils/                   # Config loader (Pydantic settings) & helpers
│   │   └── core/                    # Custom exception types
│   ├── uploads/                     # Temp PDF storage during extraction (gitignored)
│   ├── output/                      # Temp JSON output files (gitignored)
│   ├── archive/                     # Archive of processed PDFs (gitignored)
│   ├── .env.example                 # ← Copy to .env & fill credentials
│   └── requirements.txt             # Python dependencies
│
├── storage/
│   └── diagrams/                    # Local fallback diagram crops (gitignored in prod)
│
├── docs/                            # Architecture & developer documentation
│   ├── MICROSERVICE_ARCHITECTURE.md # Deep-dive into the microservice design
│   ├── API_OVERVIEW.md              # Full API request/response reference
│   ├── DEPLOYMENT.md                # Complete production deployment guide
│   ├── ROADMAP.md                   # Sprint history & future feature plans
│   ├── TECH_STACK.md                # Detailed tech stack justifications
│   ├── FUTURE_FEATURES.md           # Planned adaptive AI features
│   └── PROJECT_TIMELINE.md          # Development timeline
│
├── research/                        # Historical prototypes & experiments
│   └── pdf-extraction/              # Early OCR scripts & PDF parsing experiments
│
├── .gitignore                       # Root git ignore rules
├── PROJECT_STRUCTURE.md             # This file
└── README.md                        # Project overview & setup guide
```

---

## Component Responsibilities

### 1. [FRONTEND](FRONTEND/)

- **Stack**: React 19, Vite 8, Tailwind CSS v4, React Router v7, Axios, Lucide React.
- **Role**: Serves as the interactive single-page application. Handles authentication, PDF uploads, exam session management, real-time test interface, post-test review, subject analytics dashboard, and AI mentor chat.
- **API Communication**: All calls go through `src/services/` using Axios with a JWT Bearer token automatically attached via an Axios interceptor.

---

### 2. [BACKEND](BACKEND/)

- **Stack**: Java 17, Spring Boot 3.2.5, Spring Security 6, JPA/Hibernate, Flyway, PostgreSQL (via Supabase).
- **Role**: The core production REST API. Manages user authentication (JWT), practice session state machine, question persistence, mock test lifecycle, analytics aggregation, AI mentor proxy, and account management.
- **AI Integration**: Uses Spring Boot `RestClient` with configurable connect/read timeouts to call the FastAPI AI Service synchronously.
- **Database**: Supabase-hosted PostgreSQL (Mumbai, `ap-south-1`). Schema managed via Flyway migrations (`V1__` to `V5__+`).

---

### 3. [AI SERVICE](AI%20SERVICE/)

- **Stack**: Python 3.10+, FastAPI, Uvicorn, Google GenAI SDK (Gemini 2.5 Flash), PyMuPDF, Cloudinary SDK, Pydantic v2.
- **Role**: Stateless AI microservice. Receives exam PDFs from the Spring Boot backend, sends pages to Gemini 2.5 Flash for structured Q&A extraction, crops embedded diagrams using PyMuPDF, uploads diagram images to Cloudinary, and returns a complete questions JSON payload.
- **Observability**: All requests are correlated via the `X-Processing-Job-Id` header for end-to-end tracing.
- **Fallback**: If Cloudinary is unavailable, diagrams are saved locally to `storage/diagrams/` as a fallback.

---

### 4. [storage/diagrams/](storage/diagrams/)

- **Role**: Local fallback storage for cropped exam diagram images when Cloudinary upload fails. In production, all images are stored on Cloudinary CDN and this directory should remain empty.

---

### 5. [docs/](docs/)

- **Role**: Holds all architectural documentation, API references, roadmaps, and design decisions.

---

### 6. [research/](research/)

- **Role**: Historical research code, OCR experiments, and early PDF parsing prototypes. Kept for reference only; not used in production.
