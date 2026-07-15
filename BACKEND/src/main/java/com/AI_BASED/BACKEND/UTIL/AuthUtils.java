package com.AI_BASED.BACKEND.UTIL;

import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.EXCEPTION.ExtractionException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtils {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new ExtractionException("Authentication required. Please login.");
        }
        return (User) authentication.getPrincipal();
    }
}
