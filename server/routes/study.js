const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all study routes
router.use(authenticateToken);

// =================================
// STUDY SESSION ENDPOINTS
// =================================

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
        
        // Update streak (pass auth token)
        const streakUpdateUrl = 'http://localhost:5000/api/dashboard/streak/update';
        try {
            const streakResponse = await fetch(streakUpdateUrl, { 
                method: 'POST',
                headers: {
                    'Authorization': req.headers.authorization
                }
            });
            const streakData = await streakResponse.json();
            
            res.json({
                message: 'Session saved successfully',
                session_id: result.insertId,
                duration,
                questions_completed: questions_completed || 0,
                streak: streakData
            });
        } catch (streakError) {
            console.error('Error updating streak:', streakError);
            // Still return success for session save
            res.json({
                message: 'Session saved successfully',
                session_id: result.insertId,
                duration,
                questions_completed: questions_completed || 0,
                streak: null
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
