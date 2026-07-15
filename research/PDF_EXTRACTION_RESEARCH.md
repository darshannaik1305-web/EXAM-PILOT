# ExamPilot: PDF Question and Diagram Extraction Engine Evolution
## Technical Research Paper & Architectural Documentation

---

## 1. Introduction

Extracting structured questions, options, mathematical representations, and illustrative figures from competitive examination documents is one of the most complex and challenging problems in educational AI engineering. Unlike standard document digitizations, exam papers possess severe structural complexities that render traditional Optical Character Recognition (OCR) systems highly inaccurate.

### Core Challenges in Exam PDF Parsing

*   **Diverse Examination Formats**: Every competitive exam (e.g., KCET, JEE Main, NEET, SAT, Board Exams) has unique layout templates, typography, and ordering rules.
*   **Multi-Column Layouts**: Exam papers frequently use side-by-side split layouts to save paper. Traditional text line extractors read horizontally across columns, scramble sentences, and completely destroy the logical question flow.
*   **Mathematical and Scientific Equations**: Equations represent complex hierarchical relationships (such as superscripts, subscripts, fractions, square roots, and integrals). Standard text extraction collapses these expressions into a single string of garbled characters (e.g., $\int x^2 dx$ becomes `f x2 dx`).
*   **Chemical Formulas**: Structural drawings and chemical formula equations containing molecular rings, arrows, valency bounds, and subscripts require visual semantic understanding that plain text engines cannot grasp.
*   **Physics, Geometry, and Technical Diagrams**: Physics force vectors, circuit schematics, geometric shapes, and coordinate graphs are critical context for questions. Without them, the text is unanswerable.
*   **Scanned PDFs vs. Vector Graphics**: Some PDFs are clean, vector-based files with searchable text and distinct layers, while others are low-resolution scans containing scan tilts, page folds, coffee stains, and visual noise.
*   **Embedded Images**: Diagrams in PDFs are often stored in proprietary image containers, compressed streams, or drawn dynamically using vector draw paths (lines, curves), making them difficult to locate programmatically.
*   **Varying Answer Key Structures**: Answer keys may be appended as tabular grids, bullet points, text descriptions, or separate documents, requiring custom parsing strategies.

### Why Traditional OCR Systems Struggle

Traditional OCR systems (like Tesseract or basic cloud document parsers) operate on a **bottom-up text reconstruction** heuristic: they locate pixel clusters (blobs), identify them as characters, and group adjacent characters into lines. 

This approach fails in exam parsing because:
1.  **Lack of Semantic Context**: They do not understand the difference between a question, an option choice, a page footer, or a question label.
2.  **Layout Breakdown**: Multi-column documents cause lines from Column A to merge with Column B.
3.  **Math Representation Failures**: OCR cannot format equations into LaTeX notation, which is required for high-fidelity frontend web rendering.
4.  **No Image Association**: Standard OCR ignores diagrams entirely or fails to link them to the question text they illustrate.

---

## 2. Research Timeline

This section documents the chronological progression of the ExamPilot PDF Extraction Engine, detailing the stages researched, evaluated, and rejected on our path to the production design.

```text
[Stage 0: Tesseract OCR] ➔ [Stage 1: Local OCR (Paddle)] ➔ [Stage 2: Gemini Image Batching] ➔ [Stage 3: Gemini Native PDF] ➔ [Stage 4: Diagram Cropping (Planned)]
```

---

### Stage 0 — Initial OCR Research (Tesseract OCR)

*   **Goal**: Determine whether a completely free and open-source OCR engine could accurately extract questions from competitive examination PDFs.
*   **Architecture & Workflow**:
    ```text
    PDF
     │
     ▼
    pdf2image
     │
     ▼
    Page Images
     │
     ▼
    Tesseract OCR
     │
     ▼
    Raw Text
     │
     ▼
    Regex / Manual Parsing
     │
     ▼
    Structured Data
    ```
*   **Tools Used**: `Tesseract OCR`, `pytesseract`, `pdf2image`, `Poppler`, `Pillow (PIL)`, `Python`.
*   **Evaluation Metrics**:
    *   *Approximate Extraction Accuracy*: **45% – 60%** (engineering estimate based on project experimentation and is not an official benchmark).
*   **Key Findings**:
    *   *Advantages*: Completely free; open source; easy to install; good for plain English text; large community support; useful for initial proof-of-concept experiments.
    *   *Limitations*: Poor mathematical equation recognition; Greek symbols incorrectly recognized; difficulty with superscripts and subscripts; multi-column pages mixed together; tables not preserved; diagram labels extracted incorrectly; unable to understand document structure; large amount of preprocessing required; no semantic understanding; high manual post-processing.
*   **Why This Approach Was Abandoned**: Tesseract performs optical character recognition only. It recognizes characters but does not understand question boundaries, layout, tables, mathematical structures, or relationships between options and answers. Competitive examination papers require document understanding rather than simple OCR.
*   **Lessons Learned**:
    *   OCR alone is insufficient for competitive exam papers.
    *   Layout understanding is essential.
    *   Mathematical content requires AI-based document understanding.
    *   This research motivated the move to PaddleOCR for improved layout handling.

---

### Stage 1: Local OCR Pipeline (PaddleOCR)

*   **Goal**: Create a fully local, offline pipeline to convert uploaded exam PDFs into structured database records without external cloud dependencies.
*   **Architecture & Workflow**:
    ```text
    [PDF Input]
         │
         ▼
    (pdf2image / Poppler)
         │
         ▼
    [High-Res Page Images]
         │
         ▼
    (PaddleOCR Engine)
         │
         ▼
    [Raw OCR Text Output]
         │
         ▼
    (Python Manual Parsers) -> [Rule-Based Regex Regex Classifier]
         │
         ▼
    [MySQL Database Schema]
    ```
*   **Tools Used**: `PaddleOCR` (English model), `pdf2image`, `Poppler` (system binary dependency), `Python` (Regex text normalizers).
*   **Evaluation Metrics**:
    *   *Estimated Extraction Accuracy*: **60% – 70%** (drops below 40% on papers containing complex math equations or chemical layouts).
*   **Key Findings**:
    *   *Advantages*: Operates completely offline; does not require cloud API tokens or usage costs; simple sequential execution.
    *   *Disadvantages*: High OCR error rates; fails on mathematical symbols; weak table recognition; slow execution speeds due to local CPU bottlenecks; heavy native system dependencies (requires Poppler libraries configured on host system PATH).
*   **Rejection Rationale**: Abandoned due to unstable text parsing. The rule-based Python parsers crashed frequently because the OCR engine output was inconsistent. Equations were regularly converted into random noise, and multi-column papers were read incorrectly.

---

### Stage 2: Gemini Image Batch Processing

*   **Goal**: Leverage Large Language Model (LLM) vision capabilities to analyze PDF pages as images, bypassing regex parsing issues and improving LaTeX mathematical rendering.
*   **Architecture & Workflow**:
    ```text
    [PDF Input]
         │
         ▼
    (pdf2image / Poppler)
         │
         ▼
    [Page Images Folder]
         │
         ▼
    (Batching Logic: 5-Page Splits)
         │
         ▼
    (Gemini 2.0 Flash API) -> [Vision Prompt & PIL Image Array]
         │
         ▼
    [Structured JSON Output]
         │
         ▼
    [MySQL Database Schema]
    ```
*   **Tools Used**: `pdf2image`, `Google Generative AI SDK` (`gemini-2.0-flash` model), `PIL` (Pillow).
*   **Evaluation Metrics**:
    *   *Estimated Extraction Accuracy*: **80% – 88%** (successfully formatted math symbols into valid LaTeX math notation).
*   **Key Findings**:
    *   *Advantages*: Significant improvement in math symbol rendering; layout-agnostic parsing; cleaner structured output.
    *   *Disadvantages*: Encountered severe API rate limits (HTTP 429) due to high volume parallel page-image uploads; high token usage costs; slow for large files (each page uploaded as a separate image); hardcoded exam-to-subject index mapping assumptions.
*   **Rejection Rationale**: The process was slow and expensive. Converting a 30-page PDF to images and uploading them in separate API request batches hit model rate-limit ceilings, resulting in pipeline failures. Hardcoded indices also made the system rigid.

---

### Stage 3: Gemini Native PDF Upload (Production Architecture)

*   **Goal**: Achieve high-accuracy, cost-efficient, and fast question extraction directly from raw PDF files in a single API call, bypassing local image conversions.
*   **Architecture & Workflow**:
    ```text
    [Student Uploads PDF]
         │
         ▼
    (Spring Boot REST API)
         │
         ▼
    (FastAPI AI Microservice)
         │
         ▼
    (Google Files API) -> [Direct PDF Upload]
         │
         ▼
    (Gemini 2.5 Flash API) -> [System Prompt + Native PDF File Object]
         │
         ▼
    [JSON Output] -> (Spring Boot Parser) -> [MySQL Database]
    ```
*   **Tools Used**: `Google GenAI SDK` (`gemini-2.5-flash` model), `FastAPI`, `Spring Boot`, `MySQL`.
*   **Evaluation Metrics**:
    *   *Estimated Extraction Accuracy*: **93% – 97%**
*   **Key Findings**:
    *   *Advantages*: Native document parsing; no local OCR or pre-rendering needed; excellent multi-column layout handling; clean LaTeX formulas; minimal token usage; faster processing times.
    *   *Disadvantages*: The Gemini API cannot return binary image data directly inside the JSON payload, leaving questions with missing diagrams on the frontend.
*   **Selection Rationale**: Chosen as the production architecture. The model parses entire PDF textbooks and papers directly with minimal errors. It accurately resolves multi-column formatting and translates equations into LaTeX.

---

### Stage 4: Diagram Research (Active R&D Phase)

#### The Problem Statement
While the Stage 3 production engine successfully extracts all text, option choices, correct keys, and explanations, **it cannot extract the visual diagrams, circuits, or graphs embedded in the PDF**. 

During test taking or review, any question that references a figure (e.g., *"In the given circuit, find the value of R..."*) displays as plain text without the image, rendering the question unanswerable.

We researched four solutions to resolve this:

---

#### Solution A: Native Image Extraction
*   **Mechanism**: Use `PyMuPDF` (`fitz`) programmatically to scan the PDF's internal catalog structure and extract raw binary image objects.
*   **Advantages**: Fast; does not require calling the Gemini model; retrieves the original high-resolution image file.
*   **Disadvantages**: **Fails on vector graphics.** In academic and technical PDF papers, diagrams (circuits, coordinate graphs, geometry shapes) are rarely stored as embedded image objects. Instead, they are drawn dynamically on the page as vector paths (line instructions). This programmatic method misses them completely. It is also difficult to match the raw extracted images with their corresponding question numbers.

---

#### Solution B: Base64 Storage
*   **Mechanism**: Convert extracted diagrams into Base64-encoded text strings and store them inline inside the database questions table.
*   **Advantages**: Simple; no external hosting or static folder configurations required; self-contained database.
*   **Disadvantages**: **Database Bloat.** Base64 text increases file sizes by approximately 33%. Storing thousands of large Base64 image strings directly inside a MySQL database dramatically slows down query response speeds, bloats transaction memory, and degrades overall database performance.

---

#### Solution C: Cloud Storage
*   **Mechanism**: Upload cropped diagrams to a cloud media hosting service and store the public CDN URL in the database.
*   **Advantages**: Prevents database bloat; offloads asset hosting to an optimized Content Delivery Network (CDN); improves frontend page load speeds.
*   **Disadvantages**: Requires external cloud account setup, credentials configuration, and relies on an internet connection during the extraction process.

---

#### Solution D: Bounding Box + Coordinate Crop (Chosen Design)
This is our planned diagram-extraction architecture. It combines **Gemini's visual layout parsing** with **local coordinate cropping** to capture both embedded images and vector graphics.

```text
  [PDF Upload]
       │
       ▼
  (Gemini API) ──➔ [Extracts Text + Bounding Box Coordinates: [ymin, xmin, ymax, xmax]]
       │
       ▼
  (PyMuPDF) ──➔ [Flattens Page to Local Image]
       │
       ▼
  (Pillow PIL) ──➔ [Crops Bounding Box Area]
       │
       ▼
  [WebP Compression & Local Temp Images Cleanup]
       │
       ▼
  (Cloudinary / Supabase Storage) ──➔ [Saves WebP Diagram & Generates CDN Link]
       │
       ▼
  [Spring Boot saves CDN Link in Database] ──➔ [React renders <img> tag]
```

*   **Why it is superior**:
    *   **Captures all graphics**: Because PyMuPDF flattens the page into an image first before cropping, it captures vector paths, embedded drawings, labels, and graphs identically.
    *   **High Accuracy**: Relying on Gemini to determine the coordinates avoids complex programmatic guessing, ensuring diagrams are matched to the correct question numbers.

---

## 3. Tool Evolution Comparison

The following table tracks the specific tools evaluated during our research sprints:

| Stage | Tool | Purpose | Key Advantages | Key Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 0** | **Tesseract OCR** | Basic OCR | Free, open-source, large community support. | Poor mathematical extraction and no document understanding. |
| **Stage 1** | **PaddleOCR** | Local OCR text extraction | 100% offline, free. | Fails on math formulas and tables; high error rates. |
| **Stage 1** | **pdf2image** | Converts PDF pages to images | Easy Python API. | Slow; relies on external Poppler binary dependencies. |
| **Stage 1** | **Poppler** | PDF rendering utility | High rendering quality. | System installation dependency; path issues on Windows. |
| **Stage 2/4**| **PyMuPDF** | High-speed PDF rendering | $3\times$ faster than Poppler; pure Python dependency. | None for flat image exports. |
| **Stage 2/4**| **Pillow (PIL)** | Image cropping & adjustments | Lightweight; fast. | Limited to raster formats. |
| **Stage 2** | **Gemini 2.0 Flash** | Batch page-image parser | Strong visual OCR. | Slow on multi-page batches; hit API rate limits. |
| **Stage 3** | **Gemini 2.5 Flash** | Native PDF parsing | Native document parsing; formats math to LaTeX. | Cannot return cropped binary image files directly. |
| **Stage 3** | **Google GenAI SDK** | Google API wrapper | Structured JSON configuration support. | Requires active internet access and API keys. |
| **Stage 3** | **FastAPI** | AI processing microservice | High performance; fast. | Requires Python runtime maintenance alongside Spring Boot. |
| **Stage 3** | **Spring Boot** | Core REST API backend | Secure; robust database transaction support. | Higher boilerplate compared to Node/Python servers. |
| **Stage 3** | **MySQL** | Relational database | Stable; transactional. | Storage bloats if binary assets are saved directly. |
| **Future** | **Cloudinary** | Media CDN hosting | Generous 25 GB free tier; automatic WebP compression. | Requires cloud account setup. |
| **Future** | **Supabase** | Cloud Postgres database | Free Postgres hosting; includes Supabase storage. | Free database size limited to 500 MB. |

---

## 4. Accuracy Evolution Timeline

The table below outlines our estimated extraction quality improvements across iterations:

| Stage | Approximate Accuracy | Main Improvement | Example Result |
| :--- | :---: | :--- | :--- |
| **Stage 0: Tesseract OCR** | **45% – 60%** | Basic character recognition | Equations, subscripts/superscripts, and layouts completely broken. |
| **Stage 1: Local OCR (Paddle)** | **60% – 70%** | Layout analysis addition | Math equations rendered as garbage text like `f x2 dx`. |
| **Stage 2: Gemini Images** | **85%** | AI Vision | Correctly parsed questions and formatted math to LaTeX, but rate limits caused batch failures. |
| **Stage 3: Native PDF** | **95%** | Direct Document Parsing | Clean, error-free parsing of text, multi-column layouts, and complex LaTeX equations. |
| **Stage 4: Diagram Cropping** | **98%+** | Complete Question Representation (Projected end-to-end visual completeness) | Displays complete questions containing all text, options, answers, and visual diagrams. |

> [!NOTE]
> *Accuracy rates are engineering estimates based on internal testing and evaluation runs, not standardized scientific benchmarks.*

---

## 5. Current Production Architecture

The active ExamPilot production application is structured as a decoupled microservices pipeline:

```text
[React SPA] ──➔ [Spring Boot Backend] ──➔ [FastAPI AI Service] ──➔ [Google Gemini 2.5 API]
                   │                                │
                   ▼                                ▼
            [MySQL Database]                [Parsed JSON Output]
```

### Component Responsibilities

1.  **React Frontend Client**:
    Provides the user interface for taking tests, monitoring upload status, and viewing graded result sheets. Uses MathJax for high-fidelity LaTeX equation rendering.
2.  **Spring Boot Core Backend**:
    Serves as the central data gateway. Handles user authentication (JWT), manages the relational database schemas, tracks practice session states, and orchestrates calls to the AI microservice.
3.  **FastAPI AI Microservice**:
    Handles PDF document upload integration, manages Gemini API prompts, validates structured JSON responses via Pydantic schemas, and writes output cache files.
4.  **Google Gemini 2.5 Flash**:
    Acts as the primary model engine. Parses the document structure to extract questions, options, keys, difficulty, subject, and solution logic.
5.  **MySQL Database**:
    Provides transactional persistence for users, practice papers, questions, answers, and analytics scorecards.

---

## 6. Future Development Roadmap

To prepare the platform for production deployment, the following sprints are planned:

*   **Integrated Diagram Slicing (Phase 1)**:
    Integrate PyMuPDF rendering and Pillow cropping within the FastAPI service to slice diagrams using coordinates generated by the Gemini model.
*   **Cloudinary CDN Integration (Phase 2)**:
    Configure FastAPI to upload cropped diagrams directly to Cloudinary, saving public URLs in the database to keep the storage footprint lightweight.
*   **Supabase PostgreSQL Migration (Phase 3)**:
    Migrate the database from local MySQL to Supabase PostgreSQL for cloud hosting.
*   **Enhanced Answer Key Extraction**:
    Build dedicated sub-prompts in FastAPI to parse diverse answer key layouts (e.g., grids, columns, split keys).
*   **Auto-Validation Engine**:
    Implement a verification routine to ensure the number of extracted questions matches the total question count identified on the paper cover.

---

## 7. Key Engineering Decisions

### Why Tesseract OCR Was Replaced
*   **Problem**: Low extraction accuracy for competitive examination papers.
*   **Options Considered**:
    *   Improve OCR preprocessing
    *   Switch to another OCR engine
    *   Move to AI-based document understanding
*   **Decision Taken**: Move to PaddleOCR.
*   **Reason**: Better layout analysis, rotated text handling, and improved OCR quality.
*   **Trade-off**: Slightly higher dependency complexity but significantly improved extraction quality.

### Why We Abandoned Traditional OCR
Traditional OCR was too rigid, had high character error rates on complex math equations, and lacked the visual understanding needed to parse split multi-column layouts.

### Why We Selected Native Gemini PDF Uploads
Uploading PDFs directly to Gemini uses the model's native document processing capabilities. It extracts structured text, options, and LaTeX math formatting in a single API call with minimal errors.

### Why We Replaced Poppler with PyMuPDF
Poppler requires installing native C++ libraries on the host operating system, which is complex to set up. PyMuPDF is a lightweight, pure Python dependency that installs easily via `pip` and renders pages much faster.

### Why We Delete Temporary Page Images
To prevent disk storage bloat on our server, full-page images are deleted immediately after the diagrams are cropped.

### Why We Use WebP Compression
WebP provides superior compression compared to PNG, keeping diagrams small (typically 15 KB to 30 KB) while preserving clean lines for text, equations, and diagrams.

### Why We Store URLs Instead of Images in the Database
Storing image bytes directly in the database slows down queries. Saving CDN links keeps the database lightweight and fast.

### Why We Plan to Use Cloudinary and Supabase
Combining Supabase (for database hosting) and Cloudinary (for image hosting) utilizes their generous free tiers to provide a highly scalable, fast, and free production deployment.

---

## 8. Documentation References

*   [Google Gemini API Overview](https://ai.google.dev/gemini-api/docs)
*   [Google GenAI Python SDK Guide](https://github.com/google/generative-ai-python)
*   [PyMuPDF (Fitz) API Reference](https://pymupdf.readthedocs.io/en/latest/)
*   [Pillow (PIL) Image Processing Library](https://pillow.readthedocs.io/en/stable/)
*   [FastAPI Documentation](https://fastapi.tiangolo.com/)
*   [Spring Boot REST Reference Guides](https://spring.io/projects/spring-boot)
*   [Cloudinary Python Integration SDK](https://cloudinary.com/documentation/python_integration)
*   [Supabase Database & Storage APIs](https://supabase.com/docs)
