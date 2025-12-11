-- Phase 2C: Dual Leaderboard System
-- Add friend system and leaderboard fields to users

-- Add friend code and streak tracking (friend_code nullable for now, will update after generating codes)
ALTER TABLE users 
    ADD COLUMN friend_code VARCHAR(12) UNIQUE NULL,
    ADD COLUMN current_streak INT DEFAULT 0,
    ADD COLUMN longest_streak INT DEFAULT 0,
    ADD COLUMN last_study_date DATE NULL,
    ADD COLUMN show_on_public_leaderboard BOOLEAN DEFAULT FALSE;

-- Create friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_request (sender_id, receiver_id),
    INDEX idx_receiver_status (receiver_id, status),
    INDEX idx_sender_status (sender_id, status)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    created_at BIGINT NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user1_id, user2_id),
    INDEX idx_user1 (user1_id),
    INDEX idx_user2 (user2_id)
);
