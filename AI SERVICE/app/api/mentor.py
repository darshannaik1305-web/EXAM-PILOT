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

    system_instruction = f"""You are the AI Mentor for ExamPilot, an advanced AI-based study simulator and mentor for JEE (Joint Entrance Examination) prep.
The student is chatting with you for guidance.
Here is the student's active performance statistics:
- Total tests taken: {request.totalTestsTaken}
- Average score: {request.averageScore:.1f}
- Average accuracy: {request.averageAccuracy:.1f}%
- Consecutive study streak: {request.studyStreak} days
- Strong subjects: {strong_sub_text}
- Weak subjects: {weak_sub_text}

Guidelines:
1. Speak in a highly encouraging, mentor-like, motivational, yet diagnostic and analytical tone.
2. Refer to their performance stats naturally when relevant (e.g. praising their streak, suggesting how to raise accuracy, or target weak subjects).
3. Suggest concrete study hacks or revision habits.
4. Keep the replies concise (1-2 paragraph summaries). Use markdown lists and bold styling for readability.
5. Answer questions on JEE syllabus, physics, chemistry, maths, or test-taking strategies.
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
