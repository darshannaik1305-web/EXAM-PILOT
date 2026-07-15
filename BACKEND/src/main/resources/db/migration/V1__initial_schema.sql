CREATE TABLE IF NOT EXISTS `app_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('STUDENT','ADMIN') DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_1j9d9a06i600gd43uu3km82jw` (`email`),
  UNIQUE KEY `UK_3k4cplvh82srueuttfkwnylq0` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `exam` (
  `exam_id` bigint NOT NULL AUTO_INCREMENT,
  `duration` int DEFAULT NULL,
  `exam_name` varchar(255) DEFAULT NULL,
  `exam_type` enum('JEE','NEET','CUSTOM') DEFAULT NULL,
  `question_paper_path` varchar(255) DEFAULT NULL,
  `status` enum('UPLOADED','PROCESSING','DRAFT','READY','FAILED') DEFAULT NULL,
  PRIMARY KEY (`exam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `practice_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `extraction_verified` bit(1) DEFAULT NULL,
  `file_size_in_bytes` bigint DEFAULT NULL,
  `original_pdf_name` varchar(255) DEFAULT NULL,
  `processing_job_id` varchar(255) DEFAULT NULL,
  `processing_time_seconds` double DEFAULT NULL,
  `status` enum('UPLOADING','EXTRACTING','READY','IN_PROGRESS','COMPLETED','FAILED') DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `total_questions` int NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `upload_type` enum('QUESTION_WITH_ANSWER','QUESTION_AND_SEPARATE_ANSWER_KEY','PDF_MOCK','PRACTICE_PAPER') DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9eg9oftsh7lhjhx6r2alk3bbn` (`user_id`),
  CONSTRAINT `FK9eg9oftsh7lhjhx6r2alk3bbn` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `practice_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correct_answer` varchar(255) DEFAULT NULL,
  `explanation` varchar(5000) DEFAULT NULL,
  `optiona` varchar(1000) DEFAULT NULL,
  `optionb` varchar(1000) DEFAULT NULL,
  `optionc` varchar(1000) DEFAULT NULL,
  `optiond` varchar(1000) DEFAULT NULL,
  `question` varchar(5000) DEFAULT NULL,
  `question_number` int NOT NULL,
  `practice_session_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7is6927atld4vptr04ehtqnpi` (`practice_session_id`),
  CONSTRAINT `FK7is6927atld4vptr04ehtqnpi` FOREIGN KEY (`practice_session_id`) REFERENCES `practice_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `mock_test_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `duration_seconds` int DEFAULT NULL,
  `score` double DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','TERMINATED') DEFAULT NULL,
  `total_questions` int DEFAULT NULL,
  `practice_session_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKrpd8uvr1ftpyrevaw5e9r7qq8` (`practice_session_id`),
  KEY `FKt38p542vbqujdmeeq2tgp5rva` (`user_id`),
  CONSTRAINT `FKrpd8uvr1ftpyrevaw5e9r7qq8` FOREIGN KEY (`practice_session_id`) REFERENCES `practice_sessions` (`id`),
  CONSTRAINT `FKt38p542vbqujdmeeq2tgp5rva` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `mock_test_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_marked_for_review` bit(1) DEFAULT NULL,
  `is_skipped` bit(1) DEFAULT NULL,
  `selected_option` varchar(255) DEFAULT NULL,
  `time_spent_seconds` bigint DEFAULT NULL,
  `mock_test_session_id` bigint NOT NULL,
  `practice_question_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKt47y9m9vsl4kq6ntrnnkxswk5` (`mock_test_session_id`),
  KEY `FK30soy4sf0ecnpx6dkuye8cp93` (`practice_question_id`),
  CONSTRAINT `FK30soy4sf0ecnpx6dkuye8cp93` FOREIGN KEY (`practice_question_id`) REFERENCES `practice_questions` (`id`),
  CONSTRAINT `FKt47y9m9vsl4kq6ntrnnkxswk5` FOREIGN KEY (`mock_test_session_id`) REFERENCES `mock_test_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `mock_test_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `accuracy` double NOT NULL,
  `correct_answers` int NOT NULL,
  `max_score` double NOT NULL,
  `percentage` double NOT NULL,
  `score` double NOT NULL,
  `skipped_questions` int NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `time_taken_seconds` bigint NOT NULL,
  `wrong_answers` int NOT NULL,
  `mock_test_session_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_1psumm3c1danlj2t45k2xobrq` (`mock_test_session_id`),
  CONSTRAINT `FKlfa0ahfwlgjk91eriyeela7o4` FOREIGN KEY (`mock_test_session_id`) REFERENCES `mock_test_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `mock_test_subject_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correct_answers` int NOT NULL,
  `score` double NOT NULL,
  `skipped_questions` int NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `wrong_answers` int NOT NULL,
  `mock_test_session_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdtm8s8sy3c22sl9q8sosm55q3` (`mock_test_session_id`),
  CONSTRAINT `FKdtm8s8sy3c22sl9q8sosm55q3` FOREIGN KEY (`mock_test_session_id`) REFERENCES `mock_test_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `mock_test_difficulty_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correct_answers` int NOT NULL,
  `difficulty_level` varchar(255) DEFAULT NULL,
  `score` double NOT NULL,
  `skipped_questions` int NOT NULL,
  `wrong_answers` int NOT NULL,
  `mock_test_session_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKetw26wn7w5qy8l7smglwm52hq` (`mock_test_session_id`),
  CONSTRAINT `FKetw26wn7w5qy8l7smglwm52hq` FOREIGN KEY (`mock_test_session_id`) REFERENCES `mock_test_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `question` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `correct_answer` varchar(255) DEFAULT NULL,
  `difficulty_level` enum('EASY','MEDIUM','HARD') DEFAULT NULL,
  `marks` int DEFAULT NULL,
  `negative_marks` double DEFAULT NULL,
  `optiona` varchar(255) DEFAULT NULL,
  `optionb` varchar(255) DEFAULT NULL,
  `optionc` varchar(255) DEFAULT NULL,
  `optiond` varchar(255) DEFAULT NULL,
  `question_text` varchar(5000) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `exam_id` bigint DEFAULT NULL,
  `question_number` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhupso6ldavcx993tfnrjsdl1p` (`exam_id`),
  CONSTRAINT `FKhupso6ldavcx993tfnrjsdl1p` FOREIGN KEY (`exam_id`) REFERENCES `exam` (`exam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `result` (
  `result_id` bigint NOT NULL AUTO_INCREMENT,
  `correct_answers` int DEFAULT NULL,
  `exam_id` bigint DEFAULT NULL,
  `score` double DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `total_questions` int DEFAULT NULL,
  `wrong_answers` int DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  KEY `FKe6ufr7mghwr2j7kfrkgm8o4q` (`user_id`),
  CONSTRAINT `FKe6ufr7mghwr2j7kfrkgm8o4q` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `test_result` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correct_answers` int NOT NULL,
  `performance` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `wrong_answers` int NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `score` double NOT NULL,
  `test_session_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnre2qmnqbpvjddugeefjaxir3` (`user_id`),
  KEY `FKmfk8m2q2im517fn387f6ppch4` (`test_session_id`),
  CONSTRAINT `FKmfk8m2q2im517fn387f6ppch4` FOREIGN KEY (`test_session_id`) REFERENCES `test_session` (`id`),
  CONSTRAINT `FKnre2qmnqbpvjddugeefjaxir3` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `test_session` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correct_answers` int NOT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `total_questions` int NOT NULL,
  `wrong_answers` int NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `score` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
