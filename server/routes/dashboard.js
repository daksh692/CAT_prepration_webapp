const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// =================================
// STREAK ENDPOINTS
// =================================

// Get current streak for logged-in user
router.get('/streak', async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT * FROM streaks WHERE user_id = ?', [userId]);
        
        if (rows.length === 0) {
            // Initialize streak if doesn't exist for this user
            const now = Date.now();
            await pool.query(
                'INSERT INTO streaks (user_id, current_streak, longest_streak, updated_at) VALUES (?, ?, ?, ?)',
                [userId, 0, 0, now]
            );
            return res.json({ current_streak: 0, longest_streak: 0, last_study_date: null });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({ error: 'Failed to fetch streak data' });
    }
});

// Update streak (called when user completes study activity)
router.post('/streak/update', async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const [rows] = await pool.query('SELECT * FROM streaks WHERE user_id = ?', [userId]);
        
        if (rows.length === 0) {
            // Initialize with streak of 1 for this user
            const now = Date.now();
            await pool.query(
                'INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date, updated_at) VALUES (?, ?, ?, ?, ?)',
                [userId, 1, 1, today, now]
            );
            return res.json({ current_streak: 1, longest_streak: 1, message: 'Streak started!' });
        }
        
        const streak = rows[0];
        const lastStudyDate = streak.last_study_date;
        
        // If already studied today, no change
        if (lastStudyDate === today) {
            return res.json({ 
                current_streak: streak.current_streak, 
                longest_streak: streak.longest_streak,
                message: 'Already counted for today'
            });
        }
       
        // Calculate days difference
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newCurrentStreak;
        if (lastStudyDate === yesterdayStr) {
            // Consecutive day - increment streak
            newCurrentStreak = streak.current_streak + 1;
        } else {
            // Streak broken - restart at 1
            newCurrentStreak = 1;
        }
        
        const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);
        const now = Date.now();
        
        await pool.query(
            'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_study_date = ?, updated_at = ? WHERE id = ? AND user_id = ?',
            [newCurrentStreak, newLongestStreak, today, now, streak.id, userId]
        );
        
        res.json({ 
            current_streak: newCurrentStreak, 
            longest_streak: newLongestStreak,
            message: newCurrentStreak > streak.current_streak ? 'Streak increased!' : 'Streak restarted'
        });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

// =================================
// STUDY SESSION ENDPOINTS
// =================================

// Get today's study stats for logged-in user
router.get('/today', async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await pool.query(
            'SELECT SUM(duration) as total_minutes, SUM(questions_completed) as total_questions FROM study_sessions WHERE user_id = ? AND date = ?',
            [userId, today]
        );
        
        const stats = {
            total_minutes: rows[0]?.total_minutes || 0,
            total_questions: rows[0]?.total_questions || 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching today stats:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s stats' });
    }
});

// Record study session for logged-in user
router.post('/session', async (req, res) => {
    try {
        const userId = req.user.id;
        const { chapter_id, duration, questions_completed } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        // Insert study session for this user
        await pool.query(
            'INSERT INTO study_sessions (user_id, date, chapter_id, duration, questions_completed, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, today, chapter_id || null, duration || 0, questions_completed || 0, now]
        );
        
        // Auto-update streak when session is recorded (will use authenticateToken automatically)
        const streakResponse = await fetch('http://localhost:5000/api/dashboard/streak/update', {
            method: 'POST',
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        const streakData = await streakResponse.json();
        
        res.json({ 
            message: 'Study session recorded',
            streak: streakData
        });
    } catch (error) {
        console.error('Error recording study session:', error);
        res.status(500).json({ error: 'Failed to record study session' });
    }
});

// =================================
// USER SETTINGS / GOALS
// =================================

// Get user settings for logged-in user
router.get('/settings', async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
        
        if (rows.length === 0) {
            // Initialize default settings for this user
            const now = Date.now();
            const examDate = new Date();
            examDate.setMonth(examDate.getMonth() + 11); // 11 months from now
            const examDateStr = examDate.toISOString().split('T')[0];
            
            await pool.query(
                'INSERT INTO user_settings (user_id, daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, 120, examDateStr, true, JSON.stringify([]), now]
            );
            
            return res.json({
                daily_goal_minutes: 120,
                daily_goal_questions: 10,
                exam_date: examDateStr
            });
        }
        
        // Add default questions goal if not in database
        const settings = {
            ...rows[0],
            daily_goal_questions: rows[0].daily_goal_questions || 10
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update user settings for logged-in user
router.put('/settings', async (req, res) => {
    try {
        const userId = req.user.id;
        const { daily_goal_minutes, daily_goal_questions, exam_date } = req.body;
        const now = Date.now();
        
        // First check if settings exist for this user
        const [existing] = await pool.query('SELECT id FROM user_settings WHERE user_id = ?', [userId]);
        
        if (existing.length === 0) {
            // Insert new for this user
            await pool.query(
                'INSERT INTO user_settings (user_id, daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, daily_goal_minutes || 120, exam_date, true, JSON.stringify([]), now]
            );
        } else {
            // Update existing for this user
            const updates = [];
            const values = [];
            
            if (daily_goal_minutes !== undefined) {
                updates.push('daily_goal_minutes = ?');
                values.push(daily_goal_minutes);
            }
            if (exam_date !== undefined) {
                updates.push('exam_date = ?');
                values.push(exam_date);
            }
            updates.push('updated_at = ?');
            values.push(now);
            values.push(existing[0].id);
            values.push(userId);
            
            await pool.query(
                `UPDATE user_settings SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
                values
            );
        }
        
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;

// =================================
// STREAK ENDPOINTS
// =================================

// Get current streak
router.get('/streak', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM streaks LIMIT 1');
        
        if (rows.length === 0) {
            // Initialize streak if doesn't exist
            const now = Date.now();
            await pool.query(
                'INSERT INTO streaks (current_streak, longest_streak, updated_at) VALUES (?, ?, ?)',
                [0, 0, now]
            );
            return res.json({ current_streak: 0, longest_streak: 0, last_study_date: null });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({ error: 'Failed to fetch streak data' });
    }
});

// Update streak (called when user completes study activity)
router.post('/streak/update', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const [rows] = await pool.query('SELECT * FROM streaks LIMIT 1');
        
        if (rows.length === 0) {
            // Initialize with streak of 1
            const now = Date.now();
            await pool.query(
                'INSERT INTO streaks (current_streak, longest_streak, last_study_date, updated_at) VALUES (?, ?, ?, ?)',
                [1, 1, today, now]
            );
            return res.json({ current_streak: 1, longest_streak: 1, message: 'Streak started!' });
        }
        
        const streak = rows[0];
        const lastStudyDate = streak.last_study_date;
        
        // If already studied today, no change
        if (lastStudyDate === today) {
            return res.json({ 
                current_streak: streak.current_streak, 
                longest_streak: streak.longest_streak,
                message: 'Already counted for today'
            });
        }
       
        // Calculate days difference
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newCurrentStreak;
        if (lastStudyDate === yesterdayStr) {
            // Consecutive day - increment streak
            newCurrentStreak = streak.current_streak + 1;
        } else {
            // Streak broken - restart at 1
            newCurrentStreak = 1;
        }
        
        const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);
        const now = Date.now();
        
        await pool.query(
            'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_study_date = ?, updated_at = ? WHERE id = ?',
            [newCurrentStreak, newLongestStreak, today, now, streak.id]
        );
        
        res.json({ 
            current_streak: newCurrentStreak, 
            longest_streak: newLongestStreak,
            message: newCurrentStreak > streak.current_streak ? 'Streak increased!' : 'Streak restarted'
        });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

// =================================
// STUDY SESSION ENDPOINTS
// =================================

// Get today's study stats
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await pool.query(
            'SELECT SUM(duration) as total_minutes, SUM(questions_completed) as total_questions FROM study_sessions WHERE date = ?',
            [today]
        );
        
        const stats = {
            total_minutes: rows[0]?.total_minutes || 0,
            total_questions: rows[0]?.total_questions || 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching today stats:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s stats' });
    }
});

// Record study session
router.post('/session', async (req, res) => {
    try {
        const { chapter_id, duration, questions_completed } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        // Insert study session
        await pool.query(
            'INSERT INTO study_sessions (date, chapter_id, duration, questions_completed, created_at) VALUES (?, ?, ?, ?, ?)',
            [today, chapter_id || null, duration || 0, questions_completed || 0, now]
        );
        
        // Auto-update streak when session is recorded
        const streakResponse = await fetch('http://localhost:5000/api/dashboard/streak/update', {
            method: 'POST'
        });
        const streakData = await streakResponse.json();
        
        res.json({ 
            message: 'Study session recorded',
            streak: streakData
        });
    } catch (error) {
        console.error('Error recording study session:', error);
        res.status(500).json({ error: 'Failed to record study session' });
    }
});

// =================================
// USER SETTINGS / GOALS
// =================================

// Get user settings (daily goal, exam date, etc.)
router.get('/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM user_settings LIMIT 1');
        
        if (rows.length === 0) {
            // Initialize default settings
            const now = Date.now();
            const examDate = new Date();
            examDate.setMonth(examDate.getMonth() + 11); // 11 months from now
            const examDateStr = examDate.toISOString().split('T')[0];
            
            await pool.query(
                'INSERT INTO user_settings (daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?)',
                [120, examDateStr, true, JSON.stringify([]), now]
            );
            
            return res.json({
                daily_goal_minutes: 120,
                daily_goal_questions: 10,
                exam_date: examDateStr
            });
        }
        
        // Add default questions goal if not in database
        const settings = {
            ...rows[0],
            daily_goal_questions: rows[0].daily_goal_questions || 10
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update user settings
router.put('/settings', async (req, res) => {
    try {
        const { daily_goal_minutes, daily_goal_questions, exam_date } = req.body;
        const now = Date.now();
        
        // First check if settings exist
        const [existing] = await pool.query('SELECT id FROM user_settings LIMIT 1');
        
        if (existing.length === 0) {
            // Insert new
            await pool.query(
                'INSERT INTO user_settings (daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?)',
                [daily_goal_minutes || 120, exam_date, true, JSON.stringify([]), now]
            );
        } else {
            // Update existing
            const updates = [];
            const values = [];
            
            if (daily_goal_minutes !== undefined) {
                updates.push('daily_goal_minutes = ?');
                values.push(daily_goal_minutes);
            }
            if (exam_date !== undefined) {
                updates.push('exam_date = ?');
                values.push(exam_date);
            }
            updates.push('updated_at = ?');
            values.push(now);
            values.push(existing[0].id);
            
            await pool.query(
                `UPDATE user_settings SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }
        
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
