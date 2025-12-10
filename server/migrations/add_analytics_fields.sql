-- Add section field to test_results table for subject tracking
-- This enables subject-wise analytics (VARC, DILR, QA)

ALTER TABLE test_results 
ADD COLUMN section ENUM('VARC', 'DILR', 'QA') NULL COMMENT 'CAT exam section';

-- Create achievements table for gamification
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    
    UNIQUE KEY unique_achievement (user_id, achievement_id),
    INDEX idx_user_achievements (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Achievement definitions (stored in backend, this is just documentation)
-- first_test: Complete first test
-- week_streak: 7-day study streak
-- month_streak: 30-day study streak  
-- tests_10: 10 tests completed
-- tests_50: 50 tests completed
-- tests_100: 100 tests completed
-- score_80: First 80%+ score
-- score_90: First 90%+ score
-- questions_100: 100 questions solved
-- questions_500: 500 questions solved
-- questions_1000: 1000 questions solved
