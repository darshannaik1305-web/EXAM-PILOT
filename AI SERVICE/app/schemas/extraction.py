from pydantic import BaseModel
from typing import List, Optional

class QuestionResponse(BaseModel):
    questionNumber: int
    question: str
    optionA: str
    optionB: str
    optionC: str
    optionD: str
    correctAnswer: str
    explanation: Optional[str] = None

class ExtractionResponse(BaseModel):
    success: bool
    processingTimeSeconds: float
    totalQuestions: int
    questions: List[QuestionResponse]
