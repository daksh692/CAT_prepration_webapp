/**
 * Record Session Endpoint - Vercel Serverless Function
 * POST /api/dashboard/session
 */

import { executeQuery } from '../_lib/db.js';
import { handleCORS, errorResponse, validateRequired } from '../_lib/security.js';
import { requireAuth } from '../_lib/auth.js';
import { connectDB } from '../_lib/db.js'; // Need raw connection for internal fetch

async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow POST
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        const userId = req.user.id;
        const { chapter_id, duration, questions_completed } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        // Insert study session for this user
        await executeQuery(
            'INSERT INTO study_sessions (user_id, date, chapter_id, duration, questions_completed, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, today, chapter_id || null, duration || 0, questions_completed || 0, now]
        );
        
        // WARNING: Serverless functions cannot easily call each other via HTTP due to cold starts and URL resolution.
        // Instead, we should execute the logic directly or extract it to a shared library.
        // For now, let's duplicate the simple update logic to avoid an internal HTTP call loop.
        
        // --- DUPLICATED LOGIC FROM STREAK/UPDATE ---
        const [rows] = await executeQuery('SELECT * FROM streaks WHERE user_id = ?', [userId]);
        let streakData = { message: 'Streak updated' };
        
        if (rows.length === 0) {
            await executeQuery(
                'INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date, updated_at) VALUES (?, ?, ?, ?, ?)',
                [userId, 1, 1, today, now]
            );
            streakData = { current_streak: 1, longest_streak: 1 };
        } else {
            const streak = rows[0];
            if (streak.last_study_date !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                let newCurrentStreak = 1;
                if (streak.last_study_date === yesterdayStr) {
                    newCurrentStreak = streak.current_streak + 1;
                }
                
                const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);
                
                await executeQuery(
                    'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_study_date = ?, updated_at = ? WHERE id = ? AND user_id = ?',
                    [newCurrentStreak, newLongestStreak, today, now, streak.id, userId]
                );
                streakData = { current_streak: newCurrentStreak, longest_streak: newLongestStreak };
            } else {
                streakData = { current_streak: streak.current_streak, longest_streak: streak.longest_streak };
            }
        }
        // -------------------------------------------
        
        return res.status(200).json({ 
            message: 'Study session recorded',
            streak: streakData
        });
        
    } catch (error) {
        console.error('Error recording study session:', error);
        return errorResponse(res, 500, 'Failed to record study session');
    }
}

export default requireAuth(handler);
