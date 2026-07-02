package com.AI_BASED.BACKEND.DTO;

import com.AI_BASED.BACKEND.ENTITY.PracticeSessionStatus;
import com.AI_BASED.BACKEND.ENTITY.UploadType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionCreateResponse {

    private Long id;

    private String title;

    private UploadType uploadType;

    private PracticeSessionStatus status;
}
