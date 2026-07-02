class ExamPilotAIException(Exception):
    """Base exception for all ExamPilot AI Service errors."""
    pass


class ExtractionException(ExamPilotAIException):
    """Exception raised during PDF text or data extraction errors."""
    pass


class GeminiException(ExamPilotAIException):
    """Exception raised during Google Gemini API integration errors."""
    pass


class InvalidPdfException(ExamPilotAIException):
    """Exception raised when an uploaded file is invalid or not a PDF."""
    pass


class FileStorageException(ExamPilotAIException):
    """Exception raised when saving, reading, or moving project files fails."""
    pass
