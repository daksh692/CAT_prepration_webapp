/**
 * Study API - Single Entry Point
 * Handles /api/study/* via vercel.json rewrites
 */

import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';
import { requireAuth } from './_lib/auth.js';

async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        let pathParts = [];
        if (req.query.route) {
            pathParts = Array.isArray(req.query.route) 
                ? req.query.route 
                : req.query.route.split('/');
        }
        pathParts = pathParts.filter(p => p);
        
        if (pathParts.length === 0) return errorResponse(res, 400, 'Invalid study route');

        // Case 1: GET /api/study/chapters-with-materials
        if (pathParts[0] === 'chapters-with-materials') {
            const chapters = await executeQuery(`
                SELECT DISTINCT c.id, c.module_id, c.name 
                FROM chapters c
                WHERE EXISTS (SELECT 1 FROM study_materials sm WHERE sm.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_pointers sp WHERE sp.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_formulas sf WHERE sf.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_examples se WHERE se.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_practice_problems spp WHERE spp.chapter_id = c.id)
            `);
            return res.status(200).json(chapters);
        }
        
        // Case 2: GET /api/study/chapter/[chapterId]
        if (pathParts[0] === 'chapter' && pathParts[1]) {
            const chapterId = pathParts[1];
             const [materials, pointers, formulas, examples, practice, notes] = await Promise.all([
                executeQuery('SELECT * FROM study_materials WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_pointers WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_formulas WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_examples WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_practice_problems WHERE chapter_id = ? ORDER BY id', [chapterId]),
                executeQuery('SELECT * FROM study_notes WHERE chapter_id = ? ORDER BY `order`', [chapterId])
            ]);
            
            return res.status(200).json({
                materials, pointers, formulas, examples, practice, notes
            });
        }
        
        // Case 3: GET /api/study/sessions/history
        if (pathParts[0] === 'sessions' && pathParts[1] === 'history') {
            const userId = req.user?.id;
            if (!userId) return errorResponse(res, 401, 'Unauthorized');

            
            const days = parseInt(req.query.days) || 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString().split('T')[0];
            
            const sessions = await executeQuery(
                `SELECT s.*, c.name as chapter_name, m.name as module_name, m.section
                 FROM study_sessions s
                 LEFT JOIN chapters c ON s.chapter_id = c.id
                 LEFT JOIN modules m ON c.module_id = m.id
                 WHERE s.user_id = ? AND s.date >= ?
                 ORDER BY s.date DESC, s.created_at DESC`,
                [userId, startDateStr]
            );
            
            const sessionsByDay = {};
            let weekTotalMinutes = 0;
            let weekTotalQuestions = 0;
            
            sessions.forEach(session => {
                const date = new Date(session.date).toISOString().split('T')[0];
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
            
            return res.status(200).json({
                sessions_by_day: Object.values(sessionsByDay),
                week_total_minutes: weekTotalMinutes,
                week_total_questions: weekTotalQuestions,
                days_studied: Object.keys(sessionsByDay).length
            });
        }
        
        // Case 4: GET /api/study/sessions/today
        if (pathParts[0] === 'sessions' && pathParts[1] === 'today') {
            const userId = req.user?.id;
            if (!userId) return errorResponse(res, 401, 'Unauthorized');
            
            const today = new Date().toISOString().split('T')[0];
            
            const sessions = await executeQuery(
                `SELECT s.*, c.name as chapter_name, m.name as module_name, m.section
                 FROM study_sessions s
                 LEFT JOIN chapters c ON s.chapter_id = c.id
                 LEFT JOIN modules m ON c.module_id = m.id
                 WHERE s.user_id = ? AND s.date = ?
                 ORDER BY s.created_at DESC`,
                [userId, today]
            );
            
            return res.status(200).json({ sessions, count: sessions.length });
        }
        
        // Case 5: GET /api/study/analytics/weekly
        if (pathParts[0] === 'analytics' && pathParts[1] === 'weekly') {
            const userId = req.user?.id;
            if (!userId) return errorResponse(res, 401, 'Unauthorized');
            
            const days = 7;
            const dataPoints = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const result = await executeQuery(
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
                    total_minutes: result[0]?.total_minutes || 0,
                    total_questions: result[0]?.total_questions || 0,
                    session_count: result[0]?.session_count || 0
                });
            }
            
            const totalMinutes = dataPoints.reduce((sum, day) => sum + day.total_minutes, 0);
            const totalQuestions = dataPoints.reduce((sum, day) => sum + day.total_questions, 0);
            const avgMinutesPerDay = Math.round(totalMinutes / days);
            
            return res.status(200).json({
                data_points: dataPoints,
                summary: {
                    total_minutes: totalMinutes,
                    total_questions: totalQuestions,
                    avg_minutes_per_day: avgMinutesPerDay,
                    days_studied: dataPoints.filter(d => d.total_minutes > 0).length
                }
            });
        }
        
        return errorResponse(res, 404, 'Endpoint not found');

        
    } catch (error) {
        console.error('Study API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}
export default requireAuth(handler);
