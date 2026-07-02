# Allowed file formats for document processing
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}

# Default storage directory names
DEFAULT_UPLOAD_DIR = "uploads"
DEFAULT_ARCHIVE_DIR = "archive"
DEFAULT_OUTPUT_DIR = "output"

# API Response and Error messages to keep endpoints identical
UPLOAD_SUCCESS_MESSAGE = "PDF uploaded successfully"
ERROR_INVALID_FORMAT = "Invalid file format. Only PDF files are allowed."
ERROR_INVALID_MIME = "Invalid content type. Only application/pdf is allowed."
