const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all study routes
router.use(authenticateToken);

// =================================
// STUDY SESSION ENDPOINTS
// =================================


// Get chapters that have study materials (videos, notes, etc.)
router.get('/chapters-with-materials', async (req, res) => {
    try {
        const [chapters] = await pool.query(`
            SELECT DISTINCT c.id, c.module_id, c.name 
            FROM chapters c
            WHERE EXISTS (SELECT 1 FROM study_materials sm WHERE sm.chapter_id = c.id)
               OR EXISTS (SELECT 1 FROM study_pointers sp WHERE sp.chapter_id = c.id)
               OR EXISTS (SELECT 1 FROM study_formulas sf WHERE sf.chapter_id = c.id)
               OR EXISTS (SELECT 1 FROM study_examples se WHERE se.chapter_id = c.id)
               OR EXISTS (SELECT 1 FROM study_practice_problems spp WHERE spp.chapter_id = c.id)
        `);
        res.json(chapters);
    } catch (error) {
        console.error('Error fetching chapters with materials:', error);
        res.status(500).json({ error: 'Failed to fetch chapters with materials' });
    }
});

// Get all study materials for a specific chapter
router.get('/chapter/:chapterId', async (req, res) => {
    try {
        const { chapterId } = req.params;
        
        // Fetch all types of study materials in parallel
        const [materials, pointers, formulas, examples, practice, notes] = await Promise.all([
            pool.query('SELECT * FROM study_materials WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            pool.query('SELECT * FROM study_pointers WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            pool.query('SELECT * FROM study_formulas WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            pool.query('SELECT * FROM study_examples WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            pool.query('SELECT * FROM study_practice_problems WHERE chapter_id = ? ORDER BY id', [chapterId]),
            pool.query('SELECT * FROM study_notes WHERE chapter_id = ? ORDER BY `order`', [chapterId])
        ]);
        
        res.json({
            materials: materials[0],
            pointers: pointers[0],
            formulas: formulas[0],
            examples: examples[0],
            practice: practice[0],
            notes: notes[0]
        });
    } catch (error) {
        console.error('Error fetching study materials:', error);
        res.status(500).json({ error: 'Failed to fetch study materials' });
    }
});

// Get session history (last N days) for logged-in user
router.get('/sessions/history', async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const [sessions] = await pool.query(
            `SELECT s.*, c.name as chapter_name, m.name as module_name, m.section
             FROM study_sessions s
             LEFT JOIN chapters c ON s.chapter_id = c.id
             LEFT JOIN modules m ON c.module_id = m.id
             WHERE s.user_id = ? AND s.date >= ?
             ORDER BY s.date DESC, s.created_at DESC`,
            [userId, startDateStr]
        );
        
        // Group sessions by date
        const sessionsByDay = {};
        let weekTotalMinutes = 0;
        let weekTotalQuestions = 0;
        
        sessions.forEach(session => {
            const date = session.date.toISOString().split('T')[0];
            if (!sessionsByDay[date]) {
                sessionsByDay[date] = {
                    date,
                    total_minutes: 0,
                    total_questions: 0,
                    session_count: 0,
                    sessions: []
                };
            }
            
            sessionsByDay[date].total_minutes += session.duration;
            sessionsByDay[date].total_questions += session.questions_completed;
            sessionsByDay[date].session_count++;
            sessionsByDay[date].sessions.push(session);
            
            weekTotalMinutes += session.duration;
            weekTotalQuestions += session.questions_completed;
        });
        
        res.json({
            sessions_by_day: Object.values(sessionsByDay),
            week_total_minutes: weekTotalMinutes,
            week_total_questions: weekTotalQuestions,
            days_studied: Object.keys(sessionsByDay).length
        });
    } catch (error) {
        console.error('Error fetching session history:', error);
        res.status(500).json({ error: 'Failed to fetch session history' });
    }
});

// Get today's detailed sessions for logged-in user
router.get('/sessions/today', async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        
        const [sessions] = await pool.query(
            `SELECT s.*, c.name as chapter_name, m.name as module_name, m.section
             FROM study_sessions s
             LEFT JOIN chapters c ON s.chapter_id = c.id
             LEFT JOIN modules m ON c.module_id = m.id
             WHERE s.user_id = ? AND s.date = ?
             ORDER BY s.created_at DESC`,
            [userId, today]
        );
        
        res.json({ sessions, count: sessions.length });
    } catch (error) {
        console.error('Error fetching today sessions:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s sessions' });
    }
});

// Start new study session
router.post('/sessions/start', async (req, res) => {
    try {
        const { chapter_id, study_mode } = req.body; // study_mode: 'website' or 'external'
        
        if (!chapter_id) {
            return res.status(400).json({ error: 'Chapter ID is required' });
        }
        
        // Get chapter details
        const [chapters] = await pool.query(
            `SELECT c.*, m.name as module_name, m.section
             FROM chapters c
             JOIN modules m ON c.module_id = m.id
             WHERE c.id = ?`,
            [chapter_id]
        );
        
        if (chapters.length === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        
        const chapter = chapters[0];
        const sessionId = `temp_${Date.now()}`;
        
        res.json({
            session_id: sessionId,
            chapter,
            study_mode: study_mode || 'website',
            started_at: Date.now(),
            message: 'Session started successfully'
        });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// End study session and save to database for logged-in user
router.post('/sessions/end', async (req, res) => {
    try {
        const userId = req.user.id;
        const { chapter_id, duration, questions_completed, study_mode } = req.body;
        
        if (!duration || duration <= 0) {
            return res.status(400).json({ error: 'Duration must be greater than 0' });
        }
        
        const today = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        // Insert session into database for this user
        const [result] = await pool.query(
            `INSERT INTO study_sessions 
             (user_id, date, chapter_id, duration, questions_completed, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, today, chapter_id || null, duration, questions_completed || 0, now]
        );
        
        // Update streak for Phase 2C
        
        const [user] = await pool.query(
            'SELECT last_study_date, current_streak, longest_streak FROM users WHERE id = ?',
            [userId]
        );
        
        if (user.length > 0) {
            const lastDate = user[0].last_study_date;
            let currentStreak = user[0].current_streak || 0;
            let longestStreak = user[0].longest_streak || 0;
            
            if (!lastDate) {
                // First study session
                currentStreak = 1;
            } else {
                const lastStudyDate = new Date(lastDate);
                const todayDate = new Date(today);
                const diffDays = Math.floor((todayDate - lastStudyDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    // Same day, no change
                } else if (diffDays === 1) {
                    // Consecutive day, increment
                    currentStreak += 1;
                } else {
                    // Missed days, reset
                    currentStreak = 1;
                }
            }
            
            // Update longest if current exceeds it
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
            
            await pool.query(
                'UPDATE users SET current_streak = ?, longest_streak = ?, last_study_date = ? WHERE id = ?',
                [currentStreak, longestStreak, today, userId]
            );
            
            res.json({
                message: 'Session saved successfully',
                session_id: result.insertId,
                duration,
                questions_completed: questions_completed || 0,
                streak: {
                    current: currentStreak,
                    longest: longestStreak
                }
            });
        } else {
            res.json({
                message: 'Session saved successfully',
                session_id: result.insertId,
                duration,
                questions_completed: questions_completed || 0
            });
        }
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

// Get weekly analytics data for logged-in user
router.get('/analytics/weekly', async (req, res) => {
    try {
        const userId = req.user.id;
        const days = 7;
        const dataPoints = [];
        
        // Get data for each of the last 7 days for this user
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const [result] = await pool.query(
                `SELECT 
                    COALESCE(SUM(duration), 0) as total_minutes,
                    COALESCE(SUM(questions_completed), 0) as total_questions,
                    COUNT(*) as session_count
                 FROM study_sessions
                 WHERE user_id = ? AND date = ?`,
                [userId, dateStr]
            );
            
            dataPoints.push({
                date: dateStr,
                day_name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                total_minutes: result[0].total_minutes || 0,
                total_questions: result[0].total_questions || 0,
                session_count: result[0].session_count || 0
            });
        }
        
        const totalMinutes = dataPoints.reduce((sum, day) => sum + day.total_minutes, 0);
        const totalQuestions = dataPoints.reduce((sum, day) => sum + day.total_questions, 0);
        const avgMinutesPerDay = Math.round(totalMinutes / days);
        
        res.json({
            data_points: dataPoints,
            summary: {
                total_minutes: totalMinutes,
                total_questions: totalQuestions,
                avg_minutes_per_day: avgMinutesPerDay,
                days_studied: dataPoints.filter(d => d.total_minutes > 0).length
            }
        });
    } catch (error) {
        console.error('Error fetching weekly analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
