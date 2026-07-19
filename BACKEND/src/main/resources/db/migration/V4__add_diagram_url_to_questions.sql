ALTER TABLE practice_questions
  ADD COLUMN diagram_url varchar(500) DEFAULT NULL,
  ADD COLUMN diagram_type varchar(100) DEFAULT NULL,
  ADD COLUMN diagram_confidence double precision DEFAULT NULL,
  ADD COLUMN diagram_width int DEFAULT NULL,
  ADD COLUMN diagram_height int DEFAULT NULL;
