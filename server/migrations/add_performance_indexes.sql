-- Performance Optimization: Add Database Indexes
-- Run this after all existing migrations

-- Test Results Performance
CREATE INDEX IF NOT EXISTS idx_test_results_user_date ON test_results(user_id, test_date);
CREATE INDEX IF NOT EXISTS idx_test_results_section ON test_results(section);
CREATE INDEX IF NOT EXISTS idx_test_results_user_section ON test_results(user_id, section);

-- Friend System Performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_status ON friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id);

-- Study Sessions Performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);

-- User Lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_friend_code ON users(friend_code);

-- Achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Chapters and Modules
CREATE INDEX IF NOT EXISTS idx_chapters_module ON chapters(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_section ON modules(section);

-- User Settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

ANALYZE TABLE test_results;
ANALYZE TABLE friend_requests;
ANALYZE TABLE friendships;
ANALYZE TABLE study_sessions;
ANALYZE TABLE users;
