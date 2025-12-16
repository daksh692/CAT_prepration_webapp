/**
 * Get Module by ID - Vercel Serverless Function
 * GET /api/modules/[id]
 */

import { executeQuery } from '../../_lib/db.js';
import { handleCORS, errorResponse } from '../../_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        const { id } = req.query;
        const modules = await executeQuery('SELECT * FROM modules WHERE id = ?', [id]);
        
        if (modules.length === 0) {
            return errorResponse(res, 404, 'Module not found');
        }
        
        return res.status(200).json(modules[0]);
    } catch (error) {
        console.error('Error fetching module:', error);
        return errorResponse(res, 500, 'Failed to fetch module');
    }
}
