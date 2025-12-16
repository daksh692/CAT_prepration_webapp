/**
 * Modules API - Single Entry Point
 * Handles /api/modules/* via vercel.json rewrites
 */

import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';

export default async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        // Parse route from query (set by vercel.json rewrite)
        // or from path if needed.
        // URL: /api/modules/section/VARC -> destination: /api/modules?route=section/VARC
        
        let pathParts = [];
        if (req.query.route) {
             pathParts = Array.isArray(req.query.route) 
                ? req.query.route 
                : req.query.route.split('/');
        }
        
        // Remove empty strings if any
        pathParts = pathParts.filter(p => p);
        
        // Case 1: GET /api/modules (pathParts empty)
        if (pathParts.length === 0) {
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
        if (pathParts[0] === 'section' && pathParts[1]) {
            const section = pathParts[1];
            const modules = await executeQuery(
                'SELECT * FROM modules WHERE section = ? ORDER BY `order`',
                [section]
            );
            return res.status(200).json(modules);
        }
        
        // Case 3: GET /api/modules/[id] (Numeric ID)
        if (pathParts.length === 1 && !isNaN(pathParts[0])) {
            const id = pathParts[0];
            const modules = await executeQuery('SELECT * FROM modules WHERE id = ?', [id]);
            
            if (modules.length === 0) {
                return errorResponse(res, 404, 'Module not found');
            }
            return res.status(200).json(modules[0]);
        }
        
        return errorResponse(res, 400, 'Invalid module route');
        
    } catch (error) {
        console.error('Modules API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}
