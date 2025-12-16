/**
 * Modules API - Catch All Route
 * Handles:
 * GET /api/modules (All)
 * GET /api/modules/[id] (Single)
 * GET /api/modules/section/[section] (By Section)
 */

import { executeQuery } from '../_lib/db.js';
import { handleCORS, errorResponse } from '../_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        const { route } = req.query;
        
        // Case 1: GET /api/modules (route is undefined or empty)
        if (!route || route.length === 0) {
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
        }
        
        // Case 2: GET /api/modules/section/[section]
        if (route[0] === 'section' && route[1]) {
            const section = route[1];
            const modules = await executeQuery(
                'SELECT * FROM modules WHERE section = ? ORDER BY `order`',
                [section]
            );
            return res.status(200).json(modules);
        }
        
        // Case 3: GET /api/modules/[id] (Numeric ID)
        if (route.length === 1 && !isNaN(route[0])) {
            const id = route[0];
            const modules = await executeQuery('SELECT * FROM modules WHERE id = ?', [id]);
            
            if (modules.length === 0) {
                return errorResponse(res, 404, 'Module not found');
            }
            return res.status(200).json(modules[0]);
        }
        
        return errorResponse(res, 400, 'Invalid route');
        
    } catch (error) {
        console.error('Modules API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}
