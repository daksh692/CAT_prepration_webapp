/**
 * Get Streak Endpoint - Vercel Serverless Function
 * GET /api/dashboard/streak
 */

import { executeQuery } from '../../_lib/db.js';
import { handleCORS, errorResponse } from '../../_lib/security.js';
import { requireAuth } from '../../_lib/auth.js';

async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        const userId = req.user.id;
        
        // Check for existing streak
        const rows = await executeQuery(
            'SELECT * FROM streaks WHERE user_id = ?', 
            [userId]
        );
        
        if (rows.length === 0) {
            // Initialize streak if doesn't exist for this user
            const now = Date.now();
            await executeQuery(
                'INSERT INTO streaks (user_id, current_streak, longest_streak, updated_at) VALUES (?, ?, ?, ?)',
                [userId, 0, 0, now]
            );
            return res.status(200).json({ current_streak: 0, longest_streak: 0, last_study_date: null });
        }
        
        return res.status(200).json(rows[0]);
        
    } catch (error) {
        console.error('Error fetching streak:', error);
        return errorResponse(res, 500, 'Failed to fetch streak data');
    }
}

export default requireAuth(handler);
