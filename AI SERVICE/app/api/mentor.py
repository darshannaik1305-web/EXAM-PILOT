from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import os

from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.utils.config import Settings, get_settings
from app.core.logger import logger

router = APIRouter()

class SubjectStats(BaseModel):
    subject: str
    correctAnswers: int
    wrongAnswers: int
    skippedQuestions: int
    averageScore: float
    accuracy: float

class ChatMessage(BaseModel):
    role: str  # 'user' or 'model'
    content: str

class MentorChatRequest(BaseModel):
    messages: List[ChatMessage]
    totalTestsTaken: int
    averageScore: float
    averageAccuracy: float
    studyStreak: int
    weakSubjects: List[str]
    strongSubjects: List[str]
    latestScore: float | None = None
    latestAccuracy: float | None = None
    bestScore: float | None = None
    bestAccuracy: float | None = None
    totalAttempts: int | None = None
    totalQuestionsAttempted: int | None = None
    subjectBreakdown: List[SubjectStats] = []

class MentorChatResponse(BaseModel):
    reply: str

@router.post("/mentor/chat", response_model=MentorChatResponse)
async def chat_with_mentor(
    request: MentorChatRequest,
    settings: Settings = Depends(get_settings)
):
    """
    Exposes a chatbot route for the AI Mentor.
    - Resolves settings and Google GenAI client credentials.
    - Injects the student's learning history metrics as a system instruction.
    - Sends history and messages to the gemini-2.5-flash model.
    - Returns the generated mentor explanation/guidance response.
    """
    # 1. API Key Loading
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("AI Mentor Chat Failed: Missing GEMINI_API_KEY")
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the AI microservice."
        )

    # 2. Prepare Context System Instruction
    weak_sub_text = ", ".join(request.weakSubjects) if request.weakSubjects else "None"
    strong_sub_text = ", ".join(request.strongSubjects) if request.strongSubjects else "None"

    subject_stats_text = ""
    if request.subjectBreakdown:
        for s in request.subjectBreakdown:
            subject_stats_text += f"- **{s.subject}**: {s.accuracy:.1f}% accuracy ({s.correctAnswers} Correct, {s.wrongAnswers} Wrong, {s.skippedQuestions} Skipped)\n"
    else:
        subject_stats_text = "- No subject breakdown statistics available yet.\n"

    system_instruction = f"""You are the AI Guidance Mentor for ExamPilot, an advanced AI-based study simulator and mentor for student exam preparation.
The student is chatting with you for guidance.
Here is the student's active performance statistics:
- Total tests taken: {request.totalTestsTaken}
- Average score: {request.averageScore:.1f}
- Average accuracy: {request.averageAccuracy:.1f}%
- Consecutive study streak: {request.studyStreak} days
- Strong subjects: {strong_sub_text}
- Weak subjects: {weak_sub_text}

Subject-by-subject accuracy details:
{subject_stats_text}
"""
    if request.latestScore is not None:
        system_instruction += f"- Latest test score: {request.latestScore:.1f}\n"
    if request.latestAccuracy is not None:
        system_instruction += f"- Latest test accuracy: {request.latestAccuracy:.1f}%\n"
    if request.bestScore is not None:
        system_instruction += f"- Best test score: {request.bestScore:.1f}\n"
    if request.bestAccuracy is not None:
        system_instruction += f"- Best test accuracy: {request.bestAccuracy:.1f}%\n"
    if request.totalAttempts is not None:
        system_instruction += f"- Total attempts: {request.totalAttempts}\n"
    if request.totalQuestionsAttempted is not None:
        system_instruction += f"- Total questions attempted: {request.totalQuestionsAttempted}\n"

    system_instruction += """
Guidelines:
1. Speak in a highly encouraging, structured, mentor-like, motivational, yet diagnostic and analytical tone.
2. Refer to their performance stats naturally when relevant. Since you now have full access to their detailed subject-by-subject accuracy (correct/wrong/skipped counts), speak very accurately and intelligently about all of their subjects—including subjects labeled "Developing" or middle-range accuracy (like Physics, Chemistry, Biology, Mathematics, or History). If a student asks how they are doing in a subject (e.g. Physics), read their exact accuracy, correct answers, and wrong answers from the stats above to provide specific feedback. Never say you don't have information about a subject if it is present in their subject-by-subject stats.
3. Structure your responses beautifully:
   - Use clear sections with bold titles or bullet lists.
   - Begin with a brief, encouraging diagnostic summary of what their data shows.
   - Provide concrete, actionable study steps, revision strategies, or topic-wise guidance.
   - Conclude with a motivational question or prompt to keep them engaged.
4. Keep the replies highly readable and structured for student revision guidance. Avoid wall-of-text formatting.
5. Answer questions on syllabus, study strategies, exam confidence, time-management, or subject-specific topics.
"""

    # 3. Format GenAI Content History
    contents = []
    for msg in request.messages:
        role = "user" if msg.role == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg.content)]
            )
        )

    # 4. Generate Content
    try:
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7
        )
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=config
        )
        
        reply = response.text or "I am sorry, but I couldn't formulate a suggestion right now. Please try again!"
        return MentorChatResponse(reply=reply)

    except APIError as api_err:
        logger.error(f"AI Mentor Chat API Error: {str(api_err)}")
        raise HTTPException(
            status_code=502,
            detail=f"Google Gemini API error: {str(api_err)}"
        )
    except Exception as e:
        logger.error(f"AI Mentor Chat Exception: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to communicate with AI Mentor: {str(e)}"
        )
