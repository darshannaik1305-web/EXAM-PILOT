package com.AI_BASED.BACKEND.CONFIG;

import com.AI_BASED.BACKEND.DTO.ExtractionErrorResponseDto;
import com.AI_BASED.BACKEND.EXCEPTION.ExtractionException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ExtractionExceptionHandler {

    @ExceptionHandler(ExtractionException.class)
    public ResponseEntity<ExtractionErrorResponseDto> handleExtractionException(ExtractionException ex) {
        ExtractionErrorResponseDto errorDto = new ExtractionErrorResponseDto(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "EXTRACTION_FAILED",
                ex.getMessage(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ExtractionErrorResponseDto> handleIllegalArgumentException(IllegalArgumentException ex) {
        ExtractionErrorResponseDto errorDto = new ExtractionErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                ex.getMessage(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExtractionErrorResponseDto> handleValidationException(MethodArgumentNotValidException ex) {
        String validationErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        ExtractionErrorResponseDto errorDto = new ExtractionErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_FAILED",
                validationErrors,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExtractionErrorResponseDto> handleGeneralException(Exception ex) {
        ExtractionErrorResponseDto errorDto = new ExtractionErrorResponseDto(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred: " + ex.getMessage(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorDto, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

