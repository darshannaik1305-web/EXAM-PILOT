import logging
import sys

def setup_logger(name: str = "ExamPilotAIService") -> logging.Logger:
    """
    Sets up a configured console logger for the application.
    Configures INFO level, console handler, and formatting.
    """
    app_logger = logging.getLogger(name)
    app_logger.setLevel(logging.INFO)
    
    # Avoid duplicate handlers if settings are re-imported
    if not app_logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(levelname)s - [%(name)s] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)
        app_logger.addHandler(console_handler)
        
    return app_logger

# Export one logger instance
logger = setup_logger()
