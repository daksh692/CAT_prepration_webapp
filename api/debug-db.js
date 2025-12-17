import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';

async function handler(req, res) {
    if (handleCORS(req, res)) return;
    if (req.method !== 'GET') return errorResponse(res, 405, 'Method not allowed');
    
    try {
        // Check what tables exist
        const tables = await executeQuery("SHOW TABLES");
        
        // Check study_notes structure
        const notesStructure = await executeQuery("DESCRIBE study_notes");
        
        // Count notes rows
        const notesCount = await executeQuery("SELECT COUNT(*) as count FROM study_notes");
        
        // Get sample notes for chapter 21
        const sampleNotes = await executeQuery(
            "SELECT id, chapter_id, LEFT(brief_notes, 50) as brief_preview, LEFT(detailed_notes, 50) as detailed_preview FROM study_notes WHERE chapter_id = 21"
        );
        
        // Get database name
        const dbName = await executeQuery("SELECT DATABASE() as db_name");
        
        return res.status(200).json({
            database: dbName[0]?.db_name,
            tables_count: tables.length,
            study_notes_exists: tables.some(t => Object.values(t)[0] === 'study_notes'),
            notes_table_structure: notesStructure,
            total_notes_count: notesCount[0]?.count,
            sample_chapter_21_notes: sampleNotes
        });
        
    } catch (error) {
        console.error('Debug API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}

export default handler;
