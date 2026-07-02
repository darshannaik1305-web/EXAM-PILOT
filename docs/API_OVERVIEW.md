# ExamPilot API Overview 🔗

This document defines the REST API endpoints exposed by the Spring Boot and FastAPI microservices.

---

## 🏛️ Spring Boot Backend API (Port `4040`)

### 1. User Registration
Creates a new student account.

- **HTTP Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "darshan",
    "email": "darshan@gmail.com",
    "password": "mySecurePassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "username": "darshan",
    "email": "darshan@gmail.com",
    "role": "STUDENT"
  }
  ```

---

### 2. User Login
Authenticates user and returns a stateful bearer JWT token.

- **HTTP Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth Required**: No
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "darshan@gmail.com",
    "password": "mySecurePassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkYXJzaGFuQGdtYWlsLmNvbSIsImlhdCI6MTc4Mjk3OTI0OSwiZXhwIjoxNzgyOTgyODQ5fQ..."
  }
  ```

---

### 3. Create Practice Session & Upload PDF
Uploads a competitive exam PDF and triggers structural AI parsing.

- **HTTP Method**: `POST`
- **Path**: `/api/practice/sessions`
- **Auth Required**: Yes (Bearer JWT)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Multipart Form Parameters**:
  - `file`: PDF file resource binary.
  - `title`: `JEE Mock Test` (String)
  - `uploadType`: `QUESTION_WITH_ANSWER` or `ONLY_QUESTION` (String/Enum)
- **Response** (`200 OK`):
  ```json
  {
    "processingJobId": "dc3d2f44-664f-47c3-abf5-45801176aad4",
    "title": "JEE Mock Test",
    "status": "READY",
    "totalQuestions": 30,
    "processingTimeSeconds": 85.18,
    "fileSizeInBytes": 1530948,
    "extractionVerified": true
  }
  ```

- **Error Response Example** (`500 Internal Server Error`):
  If FastAPI is unavailable, times out, or encounters upstream API errors:
  ```json
  {
    "httpStatus": 500,
    "errorCode": "EXTRACTION_FAILED",
    "message": "Failed to call FastAPI AI Service: 502 Bad Gateway: \"{\"detail\":\"Google Gemini API error: 503 UNAVAILABLE...\"}\"",
    "timestamp": "2026-07-02T13:46:23.7969545"
  }
  ```

---

## 🤖 FastAPI AI Service API (Port `8000`)

### 1. Service Health Check
Verifies microservice operational availability.

- **HTTP Method**: `GET`
- **Path**: `/health`
- **Auth Required**: No
- **Response** (`200 OK`):
  ```json
  {
    "status": "UP",
    "service": "ExamPilot AI Service"
  }
  ```

---

### 2. PDF Question Extraction
Processes PDF bytes and returns questions structurally (called internally by Spring Boot).

- **HTTP Method**: `POST`
- **Path**: `/upload`
- **Auth Required**: No (Internal Service Communication)
- **Headers**:
  - `Content-Type: multipart/form-data`
  - `X-Processing-Job-Id: <UUID>` (Trace correlation header)
- **Multipart Form Parameters**:
  - `file`: PDF binary stream.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "processingTimeSeconds": 85.18,
    "totalQuestions": 30,
    "questions": [
      {
        "questionNumber": 1,
        "question": "Which of the following is correct?",
        "optionA": "Option A Content",
        "optionB": "Option B Content",
        "optionC": "Option C Content",
        "optionD": "Option D Content",
        "correctAnswer": "A",
        "explanation": "Logical explanation text here"
      }
    ]
  }
  ```

- **Error Response** (`400 Bad Request`):
  If the file format is incorrect or MIME type checks fail:
  ```json
  {
    "detail": "Invalid content type. Only application/pdf is allowed."
  }
  ```
