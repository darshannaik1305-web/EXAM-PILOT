package com.AI_BASED.BACKEND.CONFIG;

import com.AI_BASED.BACKEND.DTO.ExtractionErrorResponseDto;
import com.AI_BASED.BACKEND.EXCEPTION.ExtractionException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

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
}
