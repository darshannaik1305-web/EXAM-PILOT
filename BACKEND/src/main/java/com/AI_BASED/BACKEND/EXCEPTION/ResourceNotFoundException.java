package com.AI_BASED.BACKEND.EXCEPTION;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
