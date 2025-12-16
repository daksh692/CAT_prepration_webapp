/**
 * Study API - Single Entry Point
 * Handles /api/study/* via vercel.json rewrites
 */

import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';
import { requireAuth } from './_lib/auth.js';

async function handler(req, res) {
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
        
        if (pathParts.length === 0) return errorResponse(res, 400, 'Invalid study route');

        // Case 1: GET /api/study/chapters-with-materials
        if (pathParts[0] === 'chapters-with-materials') {
            const chapters = await executeQuery(`
                SELECT DISTINCT c.id, c.module_id, c.name 
                FROM chapters c
                WHERE EXISTS (SELECT 1 FROM study_materials sm WHERE sm.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_pointers sp WHERE sp.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_formulas sf WHERE sf.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_examples se WHERE se.chapter_id = c.id)
                   OR EXISTS (SELECT 1 FROM study_practice_problems spp WHERE spp.chapter_id = c.id)
            `);
            return res.status(200).json(chapters);
        }
        
        // Case 2: GET /api/study/chapter/[chapterId]
        if (pathParts[0] === 'chapter' && pathParts[1]) {
            const chapterId = pathParts[1];
             const [materials, pointers, formulas, examples, practice, notes] = await Promise.all([
                executeQuery('SELECT * FROM study_materials WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_pointers WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_formulas WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_examples WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
                executeQuery('SELECT * FROM study_practice_problems WHERE chapter_id = ? ORDER BY id', [chapterId]),
                executeQuery('SELECT * FROM study_notes WHERE chapter_id = ? ORDER BY `order`', [chapterId])
            ]);
            
            return res.status(200).json({
                materials, pointers, formulas, examples, practice, notes
            });
        }
        
        return errorResponse(res, 404, 'Endpoint not found');
        
    } catch (error) {
        console.error('Study API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}
export default requireAuth(handler);
