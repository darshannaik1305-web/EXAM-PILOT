-- Alter practice_sessions for configuration fields
ALTER TABLE `practice_sessions`
  ADD COLUMN `exam_duration_seconds` int DEFAULT NULL,
  ADD COLUMN `positive_marks` double DEFAULT NULL,
  ADD COLUMN `negative_marks` double DEFAULT NULL,
  ADD COLUMN `passing_percentage` double DEFAULT NULL,
  ADD COLUMN `exam_structure` varchar(255) DEFAULT NULL,
  ADD COLUMN `exam_name` varchar(255) DEFAULT NULL,
  ADD COLUMN `answer_key_type` varchar(255) DEFAULT NULL,
  ADD COLUMN `maximum_marks` double DEFAULT NULL;

-- Alter practice_questions for subject, difficulty, solution
ALTER TABLE `practice_questions`
  ADD COLUMN `subject` varchar(255) DEFAULT NULL,
  ADD COLUMN `difficulty` varchar(255) DEFAULT NULL,
  ADD COLUMN `solution` text DEFAULT NULL;

-- Alter mock_test_results for rich statistics
ALTER TABLE `mock_test_results`
  ADD COLUMN `attempted_questions` int NOT NULL DEFAULT 0,
  ADD COLUMN `positive_marks_earned` double NOT NULL DEFAULT 0.0,
  ADD COLUMN `negative_marks_deducted` double NOT NULL DEFAULT 0.0,
  ADD COLUMN `average_time_per_question` double NOT NULL DEFAULT 0.0;

-- Alter mock_test_sessions for attempt tracking
ALTER TABLE `mock_test_sessions`
  ADD COLUMN `attempt_number` int DEFAULT NULL;

-- Add uniqueness constraint to mock_test_answers
ALTER TABLE `mock_test_answers`
  ADD UNIQUE KEY `uq_mta_session_question` (`mock_test_session_id`, `practice_question_id`);

-- Add performance indexes
CREATE INDEX `idx_mts_user_status` ON `mock_test_sessions` (`user_id`, `status`);
CREATE INDEX `idx_mts_user_practice` ON `mock_test_sessions` (`user_id`, `practice_session_id`);
CREATE INDEX `idx_mta_session` ON `mock_test_answers` (`mock_test_session_id`);
CREATE INDEX `idx_pq_session` ON `practice_questions` (`practice_session_id`);
