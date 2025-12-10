-- Migration: Add questions_completed to study_sessions table
-- Date: 2025-12-10
-- Purpose: Track questions completed in study sessions for goal tracking

USE catprep_tracker;

-- Add questions_completed column if it doesn't exist
ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS questions_completed INT NOT NULL DEFAULT 0 
AFTER duration;

-- Update existing records to have 0 questions if null
UPDATE study_sessions 
SET questions_completed = 0 
WHERE questions_completed IS NULL;

-- Verify the change
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'catprep_tracker' 
AND TABLE_NAME = 'study_sessions';
