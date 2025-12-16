/**
 * Get Chapters by Module ID - Vercel Serverless Function
 * GET /api/chapters/module/[moduleId]
 */

import { executeQuery } from '../../_lib/db.js';
import { handleCORS, errorResponse } from '../../_lib/security.js';

export default async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        const { moduleId } = req.query;
        
        if (!moduleId) {
            return errorResponse(res, 400, 'Module ID is required');
        }
        
        // Get all chapters for the module
        const chapters = await executeQuery(
            'SELECT * FROM chapters WHERE module_id = ? ORDER BY `order`',
            [moduleId]
        );
        
        return res.status(200).json(chapters);
    } catch (error) {
        console.error('Get chapters error:', error);
        return errorResponse(res, 500, error.message || 'Failed to fetch chapters');
    }
}
