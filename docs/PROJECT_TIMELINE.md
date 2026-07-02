# ExamPilot Project Timeline ⏳

This document tracks the evolution of ExamPilot, highlighting research phases, engineering milestones, current progress, and long-term future goals.

---

## 📅 Timeline Milestone Roadmap

```text
  [Phase 1: Research]   ➔   [Phase 2: Microservices]   ➔   [Phase 3: Integration]   ➔   [Phase 4: Scaling]
     OCR & Gemini                FastAPI & Core DB             Synchronous APIs           Interactive Test
     Prototyping                 Session Schemas               Timeout Handlers            Persist & Grade
          ✅                            ✅                            ✅                         🚧
```

---

## 🛠️ Detailed Project Stages

### Phase 1: Research & Prototyping (Historical Roots)
* **Goal**: Determine technical feasibility of extracting structural competitive exam papers from raw PDFs.
* **Milestones**:
  - **Local OCR Investigation**: Explored extracting content using local Python OCR scripts and text position coordinate mapping (`research/pdf-extraction/python-ocr/`).
  - **Gemini Transition**: Realized that traditional programmatic coordinate-parsing breaks easily on complex equations and dynamic page sizes. Transitioned to multi-modal Gemini LLM prototypes to handle visual layouts directly.
  - **Prompt Engineering**: Refined system prompting templates to return strict JSON arrays rather than free-form text.

---

### Phase 2: Microservice Framework Foundation
* **Goal**: Architect the backend database and decouple the heavy AI logic into a specialized service.
* **Milestones**:
  - **FastAPI Core Init**: Created the `AI SERVICE` microservice, wrapping the Google Gemini API behind FastAPI endpoints.
  - **Spring Boot Security Init**: Set up the Core Java Backend, configured the MySQL database schema, and implemented stateless JWT credentials authentication.
  - **Session Models**: Created relational mappings for `PracticeSession` tracking processing lifecycles (`UPLOADING`, `EXTRACTING`, `READY`, etc.).

---

### Phase 3: Integration & Resiliency (Current Stage)
* **Goal**: Establish communication links and handle failures gracefully.
* **Milestones**:
  - **Synchronous Client**: Implemented Spring Boot’s `FastApiClient` using the modern `RestClient` framework.
  - **Timeout Configurations**: Setup connection (10s) and read (180s) timeouts to handle heavy Gemini generation latencies safely without blocking Tomcat worker threads.
  - **Error Boundaries**: Implemented `@RestControllerAdvice` mapping remote microservice errors to clean, typed JSON responses (`ExtractionErrorResponseDto`) for client applications.
  - **Repository Organization**: Reorganized the codebase by moving messy historical prototype files into `research/pdf-extraction/` and updating the root `.gitignore` configuration.

---

### Phase 4: Persistence & Interactive Engine (Next Target)
* **Goal**: Move from stateless payloads to active session persistence and user testing.
* **Milestones**:
  - **Database Mapping**: Persist the questions returned from FastAPI into active SQL tables linked to the practice session.
  - **Timer Engine**: Implement the mockup UI test runner with interactive ticking clocks and option selectors.
  - **Grading & Review**: Build logic to grade user test runs and present logical step-by-step explanations side-by-side.

---

## 🌌 Future Vision: Adaptive AI Tutoring
* **Goal**: Transform ExamPilot into an interactive learning companion.
* **Milestones**:
  - **Diagnostic Profiler**: Auto-classify student errors by sub-topic accuracy.
  - **Custom Practice Paths**: Let the system suggest personalized quizzes targeting known student weak topics.
  - **Adaptive Difficulty Selection**: Adjust subsequent mock questions dynamically based on student performance.
