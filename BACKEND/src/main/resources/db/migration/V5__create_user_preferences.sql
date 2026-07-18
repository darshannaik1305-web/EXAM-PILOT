-- 1. Add created_at timestamp to user table to trace registration date
ALTER TABLE app_user 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Create user preferences table with optimistic locking version and audit columns
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    target_exam VARCHAR(255) DEFAULT 'General',
    default_subject VARCHAR(255) DEFAULT 'General',
    study_goal_hours INT DEFAULT 10,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Pre-populate user preferences for existing users to avoid side-effect writes on GET
INSERT INTO user_preferences (user_id, target_exam, default_subject, study_goal_hours, version)
SELECT id, 'General', 'General', 10, 0 FROM app_user
ON DUPLICATE KEY UPDATE user_id=user_id;
