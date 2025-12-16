/**
 * Get All Chapters - Vercel Serverless Function
 * GET /api/chapters
 */

import { executeQuery } from '../_lib/db.js';
import { handleCORS, errorResponse } from '../_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        const chapters = await executeQuery('SELECT * FROM chapters ORDER BY id');
        return res.status(200).json(chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return errorResponse(res, 500, 'Failed to fetch chapters');
    }
}
