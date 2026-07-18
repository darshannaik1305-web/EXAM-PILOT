package com.AI_BASED.BACKEND.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteAccountRequestDto {

    @NotBlank(message = "Password verification is required to delete account")
    private String password;
}
