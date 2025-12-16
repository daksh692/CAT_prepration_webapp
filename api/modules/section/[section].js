/**
 * Get Modules by Section - Vercel Serverless Function
 * GET /api/modules/section/[section]
 */

import { executeQuery } from '../../../_lib/db.js';
import { handleCORS, errorResponse } from '../../../_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        const { section } = req.query;
        const modules = await executeQuery(
            'SELECT * FROM modules WHERE section = ? ORDER BY `order`',
            [section]
        );
        
        return res.status(200).json(modules);
    } catch (error) {
        console.error('Error fetching modules by section:', error);
        return errorResponse(res, 500, 'Failed to fetch modules');
    }
}
