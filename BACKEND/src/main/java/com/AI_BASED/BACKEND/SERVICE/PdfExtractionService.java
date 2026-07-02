package com.AI_BASED.BACKEND.SERVICE;

import com.AI_BASED.BACKEND.DTO.ExtractedQuestionDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.List;

@Service
public class PdfExtractionService {

    private static final String PYTHON_SCRIPT =
            "E:/ExamPilot/BACKEND/python-ocr/extractor.py";

    private static final String OUTPUT_JSON =
            "E:/ExamPilot/BACKEND/python-ocr/output/output.json";

    public List<ExtractedQuestionDTO> extractQuestions(
            String pdfPath
    ) throws Exception {

        ProcessBuilder pb =
                new ProcessBuilder(
                        "python",
                        PYTHON_SCRIPT,
                        pdfPath,
                        OUTPUT_JSON
                );

        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                process.getInputStream()
                        )
                );

        String line;

        while ((line = reader.readLine()) != null) {

            System.out.println(
                    "[PYTHON] " + line
            );
        }

        int exitCode =
                process.waitFor();

        if (exitCode != 0) {

            throw new RuntimeException(
                    "Python extraction failed"
            );
        }

        File outputFile =
                new File(
                        OUTPUT_JSON
                );

        if (!outputFile.exists()) {

            throw new RuntimeException(
                    "output.json not generated"
            );
        }

        ObjectMapper mapper =
                new ObjectMapper();

        return mapper.readValue(
                outputFile,
                new TypeReference<
                        List<ExtractedQuestionDTO>>() {
                }
        );
    }
}
