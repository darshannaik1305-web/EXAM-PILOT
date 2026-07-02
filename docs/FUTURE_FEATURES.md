# ExamPilot Future Features 🔮

This document details the upcoming capabilities and technical designs planned for future iterations of the ExamPilot platform.

---

## 💻 Interactive Practice & Testing

### 1. Online Test Engine
- **Concept**: A mock exam interface mimicking actual competitive test environments (like JEE Computer Based Test or SAT online interface).
- **Core Elements**:
  - **Dynamic Session Loading**: Fetches the structured list of questions from `practice_questions` dynamically.
  - **Choice Selections**: Tracks user-selected choices per question dynamically in state.
  - **Navigation & Review Flags**: Allows students to skip questions, mark questions for review, and easily navigate via a status sidebar layout.
  - **Time Tracking**: Logs time spent per question to identify time-sink problem areas.

### 2. Live Testing Timer
- **Concept**: Configurable time constraints for tests.
- **Core Elements**:
  - **Strict Time Limits**: Automatically submits the active test session when the clock reaches zero.
  - **Pacing Alerts**: Warns students if their average speed per question falls behind target velocities.

---

## 🔍 AI-Driven Evaluation & Analytics

### 3. Detailed Question Review Screen
- **Concept**: A study dashboard rendering side-by-side solutions.
- **Core Elements**:
  - **Visual Error Diffing**: Displays user choices against the correct extracted answer.
  - **AI Explanations**: Renders Gemini-generated step-by-step mathematical or conceptual explanations.
  - **Flag for Human Verification**: Allows users to flag suspect OCR/AI extractions for manual review (with corrections logged to improve the prompting parser).

### 4. Weak Topic Detection
- **Concept**: Diagnostic tagging of student test errors.
- **Core Elements**:
  - **Topic Classification**: Gemini automatically tags questions with core subject domains and sub-topics (e.g., Physics ➔ Thermodynamics ➔ Carnot Cycle).
  - **Topic Accuracy Matrix**: Aggregates cumulative history to generate a heat map indicating where accuracy drops below 60%.

### 5. AI Recommendations
- **Concept**: Personalized, automated study paths.
- **Core Elements**:
  - **Custom Mini-Quiz Generator**: Automatically creates small 5-question quizzes focusing exclusively on the student's identified weak sub-topics.
  - **Explanatory Insights**: Gemini analyzes error patterns across sessions and writes recommendations (e.g., *"You frequently confuse sign conventions in Thermodynamics. We suggest reviewing Carnot cycle formulas."*).

---

## 📈 Personalization & Adaptive Systems

### 6. Performance Dashboard
- **Concept**: Chronological dashboard representing student preparation metrics.
- **Core Elements**:
  - **Accuracy Vectors**: Displays graphs depicting accuracy trends over time.
  - **Speed Profiles**: Tracks velocity increases/decreases across successive mock tests.
  - **Estimated Rank/Score Predictor**: Projects performance outputs compared to historic cutoffs.

### 7. Adaptive Difficulty Engine
- **Concept**: Smart test adjustments matching student skill levels.
- **Core Elements**:
  - **Dynamic Scaling**: Increases or decreases question difficulty levels dynamically as a student takes a test, ensuring high-performing students are challenged and struggling students get foundational reinforcement.
