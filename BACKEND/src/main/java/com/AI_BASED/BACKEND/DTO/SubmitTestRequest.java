package com.AI_BASED.BACKEND.DTO;

import lombok.Data;
import java.util.List;

@Data
public class SubmitTestRequest {

    private Long examId;

    private List<AnswerDTO> answers;

}
