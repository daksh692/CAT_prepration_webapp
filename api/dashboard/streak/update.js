/**
 * Update Streak Endpoint - Vercel Serverless Function
 * POST /api/dashboard/streak/update
 */

import { executeQuery } from '../../_lib/db.js';
import { handleCORS, errorResponse } from '../../_lib/security.js';
import { requireAuth } from '../../_lib/auth.js';

async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow POST
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        const rows = await executeQuery(
            'SELECT * FROM streaks WHERE user_id = ?', 
            [userId]
        );
        
        if (rows.length === 0) {
            // Initialize with streak of 1 for this user
            const now = Date.now();
            await executeQuery(
                'INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date, updated_at) VALUES (?, ?, ?, ?, ?)',
                [userId, 1, 1, today, now]
            );
            return res.status(200).json({ current_streak: 1, longest_streak: 1, message: 'Streak started!' });
        }
        
        const streak = rows[0];
        const lastStudyDate = streak.last_study_date;
        
        // If already studied today, no change
        if (lastStudyDate === today) {
            return res.status(200).json({ 
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
        
        await executeQuery(
            'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_study_date = ?, updated_at = ? WHERE id = ? AND user_id = ?',
            [newCurrentStreak, newLongestStreak, today, now, streak.id, userId]
        );
        
        return res.status(200).json({ 
            current_streak: newCurrentStreak, 
            longest_streak: newLongestStreak,
            message: newCurrentStreak > streak.current_streak ? 'Streak increased!' : 'Streak restarted'
        });
        
    } catch (error) {
        console.error('Error updating streak:', error);
        return errorResponse(res, 500, 'Failed to update streak');
    }
}

export default requireAuth(handler);
