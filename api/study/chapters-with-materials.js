/**
 * Get Chapters that have Study Materials - Vercel Serverless Function
 * GET /api/study/chapters-with-materials
 */

import { executeQuery } from '../_lib/db.js';
import { handleCORS, errorResponse } from '../_lib/security.js';
import { requireAuth } from '../_lib/auth.js';

async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow GET
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        // Find chapters that have any content in related tables
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
    } catch (error) {
        console.error('Error fetching chapters with materials:', error);
        return errorResponse(res, 500, 'Failed to fetch chapters with materials');
    }
}

export default requireAuth(handler);
