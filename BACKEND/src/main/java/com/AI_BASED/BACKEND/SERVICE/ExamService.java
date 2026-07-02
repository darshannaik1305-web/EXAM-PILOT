package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.ExtractedQuestionDTO;
import com.AI_BASED.BACKEND.ENTITY.*;
import com.AI_BASED.BACKEND.REPOSITORY.ExamRepository;
import com.AI_BASED.BACKEND.REPOSITORY.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PdfExtractionService pdfExtractionService;

    // Create Exam
    public Exam createExam(Exam exam) {

        exam.setStatus(ExamStatus.UPLOADED);

        return examRepository.save(exam);
    }

    // Get Exam By ID
    public Exam getExamById(Long examId) {

        return examRepository.findById(examId)
                .orElseThrow(() ->
                        new RuntimeException("Exam not found"));
    }

    // Get All Exams
    public List<Exam> getAllExams() {

        return examRepository.findAll();
    }

    // Update Exam Status
    public Exam updateExamStatus(
            Long examId,
            ExamStatus status) {

        Exam exam = getExamById(examId);

        exam.setStatus(status);

        return examRepository.save(exam);
    }

    // Upload Question Paper + Extract Questions
    public Exam uploadQuestionPaper(
            Long examId,
            MultipartFile file) {

        Exam exam = getExamById(examId);

        if (file.isEmpty()) {
            throw new RuntimeException(
                    "File is empty"
            );
        }

        String fileName =
                file.getOriginalFilename();

        if (fileName == null ||
                !fileName.toLowerCase()
                        .endsWith(".pdf")) {

            throw new RuntimeException(
                    "Only PDF files are allowed"
            );
        }

        String uniqueFileName =
                UUID.randomUUID()
                        + "_"
                        + fileName;

        String uploadPath =
                "E:/ExamPilot/BACKEND/uploads";

        File uploadDir =
                new File(uploadPath);

        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        File destinationFile =
                new File(
                        uploadDir,
                        uniqueFileName
                );

        try {

            Files.copy(
                    file.getInputStream(),
                    destinationFile.toPath(),
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "File upload failed: "
                            + e.getMessage()
            );
        }

        exam.setQuestionPaperPath(
                destinationFile.getAbsolutePath()
        );

        exam.setStatus(
                ExamStatus.PROCESSING
        );

        examRepository.save(exam);

        try {

            List<ExtractedQuestionDTO>
                    extractedQuestions =
                    pdfExtractionService
                            .extractQuestions(
                                    destinationFile
                                            .getAbsolutePath()
                            );

            for (
                    ExtractedQuestionDTO dto
                    : extractedQuestions
            ) {

                Question question =
                        new Question();

                question.setQuestionNumber(
                        dto.getQuestionNumber()
                );

                question.setQuestionText(
                        dto.getQuestionText()
                );

                question.setOptionA(
                        dto.getOptionA()
                );

                question.setOptionB(
                        dto.getOptionB()
                );

                question.setOptionC(
                        dto.getOptionC()
                );

                question.setOptionD(
                        dto.getOptionD()
                );

                question.setCorrectAnswer("");

                question.setMarks(4);

                question.setNegativeMarks(
                        1.0
                );

                question.setSubject("");

                question.setTopic("");

                question.setDifficultyLevel(
                        DifficultyLevel.MEDIUM
                );

                question.setExam(exam);

                questionRepository.save(
                        question
                );
            }

            exam.setStatus(
                    ExamStatus.READY
            );

        } catch (Exception e) {

            exam.setStatus(
                    ExamStatus.FAILED
            );

            examRepository.save(
                    exam
            );

            throw new RuntimeException(
                    "Question extraction failed: "
                            + e.getMessage()
            );
        }

        return examRepository.save(
                exam
        );
    }
}
