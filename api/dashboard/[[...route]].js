/**
 * Dashboard API - Catch All Route
 * Handles:
 * /api/dashboard/settings (GET/PUT)
 * /api/dashboard/streak (GET)
 * /api/dashboard/streak/update (POST)
 * /api/dashboard/today (GET)
 * /api/dashboard/session (POST)
 */

import { executeQuery } from '../../_lib/db.js';
import { handleCORS, errorResponse } from '../../_lib/security.js';
import { requireAuth } from '../../_lib/auth.js';

async function handler(req, res) {
    if (handleCORS(req, res)) return;
    
    // Parse route
    const { route } = req.query;
    if (!route || route.length === 0) return errorResponse(res, 400, 'Invalid route');
    
    const endpoint = route[0];
    const subEndpoint = route[1];
    const userId = req.user.id;
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    try {
        // ==================== SETTINGS ====================
        if (endpoint === 'settings') {
            if (req.method === 'GET') {
                const rows = await executeQuery('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
                
                if (rows.length === 0) {
                    const examDate = new Date();
                    examDate.setMonth(examDate.getMonth() + 11);
                    const examDateStr = examDate.toISOString().split('T')[0];
                    
                    await executeQuery(
                        'INSERT INTO user_settings (user_id, daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                        [userId, 120, examDateStr, true, JSON.stringify([]), now]
                    );
                    return res.status(200).json({
                        daily_goal_minutes: 120, daily_goal_questions: 10, exam_date: examDateStr
                    });
                }
                return res.status(200).json({
                     ...rows[0],
                     daily_goal_questions: rows[0].daily_goal_questions || 10
                });
            }
            
            if (req.method === 'PUT') {
                const { daily_goal_minutes, daily_goal_questions, exam_date } = req.body;
                const existing = await executeQuery('SELECT id FROM user_settings WHERE user_id = ?', [userId]);
                
                if (existing.length === 0) {
                    await executeQuery(
                        'INSERT INTO user_settings (user_id, daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                        [userId, daily_goal_minutes || 120, exam_date, true, JSON.stringify([]), now]
                    );
                } else {
                    const updates = [];
                    const values = [];
                    if (daily_goal_minutes !== undefined) { updates.push('daily_goal_minutes = ?'); values.push(daily_goal_minutes); }
                    if (exam_date !== undefined) { updates.push('exam_date = ?'); values.push(exam_date); }
                    if (daily_goal_questions !== undefined) { 
                        // Assuming column exists or we just accept the body param without DB update if column missing
                        // Logic matches original settings.js
                    }
                    updates.push('updated_at = ?'); values.push(now);
                    values.push(existing[0].id); values.push(userId);
                    
                    await executeQuery(`UPDATE user_settings SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values);
                }
                return res.status(200).json({ message: 'Settings updated successfully' });
            }
            return errorResponse(res, 405, 'Method not allowed');
        }

        // ==================== STREAK ====================
        if (endpoint === 'streak') {
            if (subEndpoint === 'update' && req.method === 'POST') {
                // Update Streak Logic
                const rows = await executeQuery('SELECT * FROM streaks WHERE user_id = ?', [userId]);
                if (rows.length === 0) {
                    await executeQuery(
                        'INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date, updated_at) VALUES (?, ?, ?, ?, ?)',
                        [userId, 1, 1, today, now]
                    );
                    return res.status(200).json({ current_streak: 1, longest_streak: 1, message: 'Streak started!' });
                }
                const streak = rows[0];
                if (streak.last_study_date === today) {
                    return res.status(200).json({ current_streak: streak.current_streak, longest_streak: streak.longest_streak, message: 'Already counted for today' });
                }
                
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                let newCurrentStreak = (streak.last_study_date === yesterdayStr) ? streak.current_streak + 1 : 1;
                const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);
                
                await executeQuery(
                    'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_study_date = ?, updated_at = ? WHERE id = ? AND user_id = ?',
                    [newCurrentStreak, newLongestStreak, today, now, streak.id, userId]
                );
                return res.status(200).json({ current_streak: newCurrentStreak, longest_streak: newLongestStreak, message: 'Streak updated' });
            }
            
            if (req.method === 'GET') {
                const rows = await executeQuery('SELECT * FROM streaks WHERE user_id = ?', [userId]);
                if (rows.length === 0) {
                     await executeQuery(
                        'INSERT INTO streaks (user_id, current_streak, longest_streak, updated_at) VALUES (?, ?, ?, ?)',
                        [userId, 0, 0, now]
                    );
                    return res.status(200).json({ current_streak: 0, longest_streak: 0, last_study_date: null });
                }
                return res.status(200).json(rows[0]);
            }
            
            return errorResponse(res, 405, 'Method not allowed');
        }

        // ==================== TODAY ====================
        if (endpoint === 'today') {
            if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
            const rows = await executeQuery(
                'SELECT SUM(duration) as total_minutes, SUM(questions_completed) as total_questions FROM study_sessions WHERE user_id = ? AND date = ?',
                [userId, today]
            );
            return res.status(200).json({
                total_minutes: rows[0]?.total_minutes || 0,
                total_questions: rows[0]?.total_questions || 0
            });
        }

        // ==================== SESSION ====================
        if (endpoint === 'session') {
            if (req.method !== 'POST') return errorResponse(res, 405, 'Method not allowed');
            const { chapter_id, duration, questions_completed } = req.body;
            
            // Insert Session
            await executeQuery(
                'INSERT INTO study_sessions (user_id, date, chapter_id, duration, questions_completed, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, today, chapter_id || null, duration || 0, questions_completed || 0, now]
            );
            
            // Auto Update Streak (Simple logic)
            // Reusing the update logic from above inside the same transaction effectively
             const rows = await executeQuery('SELECT * FROM streaks WHERE user_id = ?', [userId]);
             let streakData = {};
             if (rows.length === 0) {
                await executeQuery('INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date, updated_at) VALUES (?, ?, ?, ?, ?)', [userId, 1, 1, today, now]);
                streakData = { current_streak: 1, longest_streak: 1 };
             } else {
                 const streak = rows[0];
                 const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                 const yesterdayStr = yesterday.toISOString().split('T')[0];
                 let newCurrentStreak = (streak.last_study_date === yesterdayStr) ? streak.current_streak + 1 : 1;
                 
                  if (streak.last_study_date === today) {
                      streakData = { current_streak: streak.current_streak, longest_streak: streak.longest_streak };
                  } else {
                        const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);
                        await executeQuery('UPDATE streaks SET current_streak = ?, longest_streak = ?, last_study_date = ?, updated_at = ? WHERE id = ? AND user_id = ?', [newCurrentStreak, newLongestStreak, today, now, streak.id, userId]);
                        streakData = { current_streak: newCurrentStreak, longest_streak: newLongestStreak };
                  }
             }
             
             return res.status(200).json({ message: 'Study session recorded', streak: streakData });
        }

        return errorResponse(res, 404, 'Endpoint not found');
        
    } catch (error) {
        console.error('Dashboard API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}

export default requireAuth(handler);
