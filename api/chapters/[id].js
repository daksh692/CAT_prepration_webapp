/**
 * Get Chapter by ID - Vercel Serverless Function
 * GET /api/chapters/[id]
 */

import { executeQuery } from '../_lib/db.js';
import { handleCORS, errorResponse } from '../_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        const { id } = req.query;
        if (!id) return errorResponse(res, 400, 'Chapter ID is required');

        const chapters = await executeQuery('SELECT * FROM chapters WHERE id = ?', [id]);
        
        if (chapters.length === 0) {
            return errorResponse(res, 404, 'Chapter not found');
        }
        
        return res.status(200).json(chapters[0]);
    } catch (error) {
        console.error('Error fetching chapter:', error);
        return errorResponse(res, 500, 'Failed to fetch chapter');
    }
}
