package com.AI_BASED.BACKEND.EXCEPTION;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
