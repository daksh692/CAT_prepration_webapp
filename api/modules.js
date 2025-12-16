/**
 * Get All Modules - Vercel Serverless Function
 * GET /api/modules
 */

import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';

export default async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        // Get all modules with chapter counts
        const modules = await executeQuery(`
            SELECT 
                m.*,
                COUNT(c.id) as chapterCount
            FROM modules m
            LEFT JOIN chapters c ON m.id = c.module_id
            GROUP BY m.id
            ORDER BY m.\`order\`
        `);
        
        return res.status(200).json(modules);
    } catch (error) {
        console.error('Get modules error:', error);
        return errorResponse(res, 500, error.message || 'Failed to fetch modules');
    }
}
