/**
 * Get Study Materials by Chapter ID - Vercel Serverless Function
 * GET /api/study/chapter/[chapterId]
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
        const { chapterId } = req.query;
        
        if (!chapterId) {
            return errorResponse(res, 400, 'Chapter ID is required');
        }
        
        // Fetch all types of study materials in parallel
        const [materials, pointers, formulas, examples, practice, notes] = await Promise.all([
            executeQuery('SELECT * FROM study_materials WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            executeQuery('SELECT * FROM study_pointers WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            executeQuery('SELECT * FROM study_formulas WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            executeQuery('SELECT * FROM study_examples WHERE chapter_id = ? ORDER BY `order`', [chapterId]),
            executeQuery('SELECT * FROM study_practice_problems WHERE chapter_id = ? ORDER BY id', [chapterId]),
            executeQuery('SELECT * FROM study_notes WHERE chapter_id = ? ORDER BY `order`', [chapterId])
        ]);
        
        return res.status(200).json({
            materials,
            pointers,
            formulas,
            examples,
            practice,
            notes
        });
    } catch (error) {
        console.error('Get study materials error:', error);
        return errorResponse(res, 500, error.message || 'Failed to fetch study materials');
    }
}
