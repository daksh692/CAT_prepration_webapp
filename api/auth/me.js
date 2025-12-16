/**
 * Get Current User - Vercel Serverless Function
 * GET /api/auth/me
 */

import { handleCORS, errorResponse } from '../_lib/security.js';
import { requireAuth } from '../_lib/auth.js';

async function meHandler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        // User is already attached by requireAuth middleware
        return res.status(200).json({
            user: req.user
        });
    } catch (error) {
        console.error('Get user error:', error);
        return errorResponse(res, 500, error.message || 'Failed to get user');
    }
}

// Wrap with auth middleware
export default requireAuth(meHandler);
