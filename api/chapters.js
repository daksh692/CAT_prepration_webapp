/**
 * Chapters API - Single Entry Point
 * Handles /api/chapters/* via vercel.json rewrites
 */

import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        let pathParts = [];
        if (req.query.route) {
             pathParts = Array.isArray(req.query.route) 
                ? req.query.route 
                : req.query.route.split('/');
        }
        pathParts = pathParts.filter(p => p);

        // Case 1: GET /api/chapters (All)
        if (pathParts.length === 0) {
            const chapters = await executeQuery('SELECT * FROM chapters ORDER BY id');
            return res.status(200).json(chapters);
        }
        
        // Case 2: GET /api/chapters/module/[moduleId]
        if (pathParts[0] === 'module' && pathParts[1]) {
            const moduleId = pathParts[1];
            const chapters = await executeQuery(
                'SELECT * FROM chapters WHERE module_id = ? ORDER BY `order`',
                [moduleId]
            );
            return res.status(200).json(chapters);
        }
        
        // Case 3: GET /api/chapters/name/[name]
        if (pathParts[0] === 'name' && pathParts[1]) {
            const name = decodeURIComponent(pathParts[1]);
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
        if (pathParts.length === 1 && !isNaN(pathParts[0])) {
            const id = pathParts[0];
            const chapters = await executeQuery('SELECT * FROM chapters WHERE id = ?', [id]);
            
            if (chapters.length === 0) {
                return errorResponse(res, 404, 'Chapter not found');
            }
            return res.status(200).json(chapters[0]);
        }
        
        return errorResponse(res, 400, 'Invalid chapter route');
        
    } catch (error) {
        console.error('Chapters API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}
