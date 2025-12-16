/**
 * Get Today's Stats Endpoint - Vercel Serverless Function
 * GET /api/dashboard/today
 */

import { executeQuery } from '../_lib/db.js';
import { handleCORS, errorResponse } from '../_lib/security.js';
import { requireAuth } from '../_lib/auth.js';

async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        
        const rows = await executeQuery(
            'SELECT SUM(duration) as total_minutes, SUM(questions_completed) as total_questions FROM study_sessions WHERE user_id = ? AND date = ?',
            [userId, today]
        );
        
        const stats = {
            total_minutes: rows[0]?.total_minutes || 0,
            total_questions: rows[0]?.total_questions || 0
        };
        
        return res.status(200).json(stats);
        
    } catch (error) {
        console.error('Error fetching today stats:', error);
        return errorResponse(res, 500, 'Failed to fetch today\'s stats');
    }
}

export default requireAuth(handler);
