# ExamPilot Roadmap 🗺️

This document tracks the completed sprints, current progress, and future milestones of the ExamPilot platform.

---

## 🗂️ Completed Sprints

### 🟢 Sprint 1: Core Foundation & User Authentication
* **Focus**: Establish the Java Spring Boot backend framework, secure persistence layer, and student user accounts.
* **Achievements**:
  - Initialized Spring Boot Web application with JPA connectivity to MySQL.
  - Formulated database schemas for `AppUser` entities.
  - Implemented stateless **JWT (JSON Web Token) Authentication** filter.
  - Created authentication endpoints (`POST /api/auth/register` and `POST /api/auth/login`).
  - Added repository, controller, and service patterns for secure account lookup.

---

### 🟢 Sprint 2: FastAPI AI Service Prototyping
* **Focus**: Extract structure and data from practice papers using a Python-based microservice wrapper.
* **Achievements**:
  - Initialized the Python FastAPI service under the `AI SERVICE/` module.
  - Integrated the **Google GenAI SDK** configured to call the `gemini-2.5-flash` model.
  - Crafted prompt templates directing Gemini to parse structured PDF data into strict JSON layouts containing question texts, options, correct answers, and logical explanations.
  - Implemented the `/health` microservice verification checkpoint.

---

### 🟢 Sprint 3.1: Practice Session Architecture
* **Focus**: Set up Spring Boot business models to track student sessions and mock tests.
* **Achievements**:
  - Developed the `PracticeSession` JPA entity tracking metadata: `title`, `uploadType`, `status`, `originalPdfName`, `fileSizeInBytes`, and `processingJobId`.
  - Added status tracking states: `UPLOADING`, `EXTRACTING`, `READY`, `IN_PROGRESS`, `COMPLETED`, and `FAILED`.
  - Developed `PracticeQuestion` entities mapping back to sessions (with fields for options, answers, and explanations).
  - Exposed the session creation REST API.

---

### 🟢 Sprint 3.2: Spring Boot ↔ FastAPI Integration (Current Baseline)
* **Focus**: Enable synchronous communication, error handling, and end-to-end trace tracking between microservices.
* **Achievements**:
  - Configured HTTP connection (10s) and read (180s) timeouts inside Spring Boot `application.properties`.
  - Implemented Spring Boot `FastApiClient` using the synchronous `RestClient` framework.
  - Managed session state lifecycle progression:
    - Creates session in database (`UPLOADING`).
    - Starts remote request and sets state to `EXTRACTING`.
    - Returns structured extraction directly on success and updates status to `READY`.
    - Handles exceptions to rollback state to `FAILED` on failures.
  - Handled remote gateway errors using a custom `@RestControllerAdvice` return mapping `ExtractionErrorResponseDto`.
  - Added trace support using custom `X-Processing-Job-Id` logging inside the FastAPI upload endpoint.

---

## 📅 Future Sprints

### 🟡 Sprint 4: Persistent Question Storage & Data Mapping
* **Focus**: Transform raw JSON question responses into mapped database tables inside Spring Boot.
* **Goals**:
  - Map the list of extracted questions returned from the FastAPI upload response into relational tables (`practice_questions`).
  - Establish transactions to persist all questions atomically when a session transitions to `READY`.

---

### 🟡 Sprint 5: Interactive Online Test Engine
* **Focus**: Build a browser-based interactive mock environment for testing students.
* **Goals**:
  - Fetch mock sessions dynamically based on user selection.
  - Implement a client-side timer tracking elapsed test duration.
  - Support choice selections, navigation flags ("mark for review"), and clean submission logic.

---

### 🟡 Sprint 6: Test Results & Detailed Review Screen
* **Focus**: Provide instant grading feedback to students.
* **Goals**:
  - Calculate scores, percentages, and response accuracy.
  - Render an interactive side-by-side review panel comparing student choices against the correct extracted answer and the AI-generated explanation.

---

### 🟡 Sprint 7: Performance Analytics & Weak Topic Detection
* **Focus**: AI-driven diagnostic insights.
* **Goals**:
  - Classify questions by topic and difficulty category.
  - Detect specific topic-level weaknesses based on cumulative test history.
  - Present performance graphs and visual topic matrices to the user.

---

### 🟡 Sprint 8: Adaptive AI Tutor
* **Focus**: Dynamic mock test generation.
* **Goals**:
  - Generate customized mock tests dynamically targeting identified student weaknesses.
  - Automatically adjust question difficulty settings based on active user scores.
