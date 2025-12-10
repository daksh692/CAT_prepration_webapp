-- Add user_id column to streaks table
ALTER TABLE streaks ADD COLUMN user_id INT NOT NULL DEFAULT 1;
ALTER TABLE streaks ADD INDEX idx_user_id (user_id);

-- Add user_id column to study_sessions table  
ALTER TABLE study_sessions ADD COLUMN user_id INT NOT NULL DEFAULT 1;
ALTER TABLE study_sessions ADD INDEX idx_user_id_date (user_id, date);

-- Add user_id column to user_settings table
ALTER TABLE user_settings ADD COLUMN user_id INT NOT NULL DEFAULT 1;
ALTER TABLE user_settings ADD UNIQUE INDEX idx_user_id (user_id);

-- Note: After running this migration, you may want to delete existing test data
-- so each user starts fresh:
-- DELETE FROM streaks;
-- DELETE FROM study_sessions;
-- DELETE FROM user_settings;
