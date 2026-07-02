# ExamPilot Technology Stack 🛠️

This document describes the technologies, libraries, and tools utilized in the ExamPilot project, along with the engineering rationale behind choosing each one.

---

## 🏛️ Overall Architecture Choice
ExamPilot utilizes a **decoupled microservice architecture**:
1. **Spring Boot (Java)** handles core business transactions, account security, and databases.
2. **FastAPI (Python)** acts as an AI integration layer, processing PDFs and bridging to the Google GenAI SDK.

This separation ensures that heavy AI processing loads do not block standard user operations (like logging in or retrieving historical test scores) and allows scaling each service independently.

---

## 💻 Backend Technologies

| Technology | Category | Role in ExamPilot | Rationale & Why Chosen |
| :--- | :--- | :--- | :--- |
| **Java 17** | Language | Core backend programming language. | Selected for its strong typing, modern language features (records, patterns), stability, and robust ecosystem for enterprise backends. |
| **Spring Boot 3.2.5** | Framework | Core service layer, security, and controller endpoints. | Provides rapid application development, built-in Tomcat web server, dependency injection, and simple configuration defaults. |
| **Maven** | Build Tool | Dependency resolution and building backend binaries. | Standard build lifecycle manager in the Java community with straightforward configurations (`pom.xml`) and dependency management. |
| **Hibernate** | ORM | Maps Java classes directly to MySQL tables. | Eliminates boilerplate SQL code by automatically syncing entity states with the database. |
| **RestClient** | HTTP Client | Performs synchronous API calls to FastAPI. | A modern, fluent HTTP client introduced in Spring 6 / Boot 3 that simplifies making REST calls with custom timeouts without pulling in the heavy WebFlux package. |
| **Lombok** | Library | Boilerplate reduction (getters, setters, builders). | Automatically generates constructors, getter/setter methods, and builder patterns during compilation, keeping codebase readable. |
| **JWT** | Authentication | Stateless session authentication. | Allows stateless, secure API communication. The server signs a token for the user, eliminating the need to persist and query active HTTP sessions. |

---

## 🤖 AI Service Technologies

| Technology | Category | Role in ExamPilot | Rationale & Why Chosen |
| :--- | :--- | :--- | :--- |
| **Python** | Language | Language for AI microservice wrapper. | The industry standard for data science, machine learning, and AI. Offers immediate access to the official Google GenAI SDK. |
| **FastAPI** | Web Framework | Exposes HTTP routes for PDF extraction. | Extremely lightweight, highly performant (ASGI-based), and provides automatic OpenAPI/Swagger documentation. |
| **Pydantic v2** | Data Validation | Defines schemas and validates AI inputs/outputs. | Ensures that data coming from Gemini matches our expected structure. Fails immediately and predictably if the schema is violated. |
| **Google Gemini 2.5 Flash** | AI Foundation Model | Extracts questions, options, and explanations from PDFs. | Best-in-class multi-modal context window and highly efficient structured JSON output generation, making it perfect for processing large academic exams containing text and equations. |

---

## 🗄️ Database

| Technology | Category | Role in ExamPilot | Rationale & Why Chosen |
| :--- | :--- | :--- | :--- |
| **MySQL 8.0** | Relational Database | Persists user credentials, sessions, and questions. | Reliable, ACID-compliant open-source relational database that integrates seamlessly with Hibernate and handles transactional application data. |
