-- Create test_results table for tracking practice tests and marks
CREATE TABLE IF NOT EXISTS test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    test_date DATE NOT NULL,
    test_type ENUM('website', 'external') NOT NULL DEFAULT 'website',
    chapter_id INT NULL,
    
    -- Question counts
    total_questions INT NOT NULL DEFAULT 0,
    
    -- For website tests (auto-calculated)
    correct_mcq INT DEFAULT 0,
    incorrect_mcq INT DEFAULT 0,
    unattempted_mcq INT DEFAULT 0,
    
    -- For external tests (user input)
    correct_mcq_external INT DEFAULT 0,
    incorrect_mcq_external INT DEFAULT 0,
    correct_fitb INT DEFAULT 0,
    incorrect_fitb INT DEFAULT 0,
    
    -- Marks calculation (CAT system: MCQ +3/-1, FITB +3/0)
    total_marks DECIMAL(10, 2) DEFAULT 0,
    max_marks DECIMAL(10, 2) DEFAULT 0,
    percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    is_checked BOOLEAN DEFAULT FALSE COMMENT 'For external tests - has user checked answers',
    notes TEXT NULL,
    created_at BIGINT NOT NULL,
    
    INDEX idx_user_date (user_id, test_date),
    INDEX idx_user_type (user_id, test_type),
    INDEX idx_chapter (chapter_id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
