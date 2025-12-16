/**
 * Chapters API - Catch All Route
 * Handles:
 * GET /api/chapters (All)
 * GET /api/chapters/[id] (Single)
 * GET /api/chapters/module/[moduleId] (By Module)
 * GET /api/chapters/name/[name] (By Name)
 */

import { executeQuery } from '../_lib/db.js';
import { handleCORS, errorResponse } from '../_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        const { route } = req.query;
        
        // Case 1: GET /api/chapters (route is undefined or empty)
        if (!route || route.length === 0) {
            const chapters = await executeQuery('SELECT * FROM chapters ORDER BY id');
            return res.status(200).json(chapters);
        }
        
        // Case 2: GET /api/chapters/module/[moduleId]
        if (route[0] === 'module' && route[1]) {
            const moduleId = route[1];
            const chapters = await executeQuery(
                'SELECT * FROM chapters WHERE module_id = ? ORDER BY `order`',
                [moduleId]
            );
            return res.status(200).json(chapters);
        }
        
        // Case 3: GET /api/chapters/name/[name]
        if (route[0] === 'name' && route[1]) {
            const name = route[1]; // Vercel automatically decodes URL params? usually.
            // But we should be careful.
            const chapters = await executeQuery(
                'SELECT * FROM chapters WHERE name = ?',
                [name]
            );
             if (chapters.length === 0) {
                return errorResponse(res, 404, 'Chapter not found');
            }
            return res.status(200).json(chapters[0]);
        }
        
        // Case 4: GET /api/chapters/[id] (Numeric ID)
        if (route.length === 1 && !isNaN(route[0])) {
            const id = route[0];
            const chapters = await executeQuery('SELECT * FROM chapters WHERE id = ?', [id]);
            
            if (chapters.length === 0) {
                return errorResponse(res, 404, 'Chapter not found');
            }
            return res.status(200).json(chapters[0]);
        }
        
        return errorResponse(res, 400, 'Invalid route');
        
    } catch (error) {
        console.error('Chapters API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}
