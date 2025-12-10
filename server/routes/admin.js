const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all chapters with materials status
router.get('/chapters', async (req, res) => {
    try {
        const [chapters] = await pool.query(`
            SELECT 
                c.id,
                c.name,
                m.name as module_name,
                m.section,
                EXISTS(SELECT 1 FROM study_materials sm WHERE sm.chapter_id = c.id) as has_materials
            FROM chapters c
            JOIN modules m ON c.module_id = m.id
            ORDER BY m.section, m.\`order\`, c.id
        `);
        
        res.json(chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// Get full study materials for a chapter
router.get('/chapters/:chapterId/materials', async (req, res) => {
    try {
        const { chapterId } = req.params;
        
        // Get main material
        const [materials] = await pool.query(
            'SELECT * FROM study_materials WHERE chapter_id = ?',
            [chapterId]
        );
        
        // Get videos
        const [videos] = await pool.query(
            'SELECT * FROM study_videos WHERE chapter_id = ? ORDER BY `order`',
            [chapterId]
        );
        
        // Get pointers
        const [pointers] = await pool.query(
            'SELECT * FROM study_pointers WHERE chapter_id = ? ORDER BY `order`',
            [chapterId]
        );
        
        // Get formulas
        const [formulas] = await pool.query(
            'SELECT * FROM study_formulas WHERE chapter_id = ? ORDER BY `order`',
            [chapterId]
        );
        
        // Get examples
        const [examples] = await pool.query(
            'SELECT * FROM study_examples WHERE chapter_id = ? ORDER BY `order`',
            [chapterId]
        );
        
        // Get practice problems
        const [practiceProblems] = await pool.query(
            'SELECT * FROM study_practice_problems WHERE chapter_id = ? ORDER BY `order`',
            [chapterId]
        );
        
        res.json({
            material: materials[0] || null,
            videos,
            pointers,
            formulas,
            examples,
            practiceProblems
        });
    } catch (error) {
        console.error('Error fetching study materials:', error);
        res.status(500).json({ error: 'Failed to fetch study materials' });
    }
});

// Update study material notes
router.put('/chapters/:chapterId/materials', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { brief_notes, detailed_notes } = req.body;
        const now = Date.now();
        
        // Check if material exists
        const [existing] = await pool.query(
            'SELECT id FROM study_materials WHERE chapter_id = ?',
            [chapterId]
        );
        
        if (existing.length > 0) {
            // Update existing
            await pool.query(
                'UPDATE study_materials SET brief_notes = ?, detailed_notes = ?, updated_at = ? WHERE chapter_id = ?',
                [brief_notes, detailed_notes, now, chapterId]
            );
        } else {
            // Create new
            await pool.query(
                'INSERT INTO study_materials (chapter_id, brief_notes, detailed_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
                [chapterId, brief_notes, detailed_notes, now, now]
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating study materials:', error);
        res.status(500).json({ error: 'Failed to update study materials' });
    }
});

// ===== VIDEOS CRUD =====

// Add video
router.post('/chapters/:chapterId/videos', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { title, url, duration, channel, order } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO study_videos (chapter_id, title, url, duration, channel, `order`) VALUES (?, ?, ?, ?, ?, ?)',
            [chapterId, title, url, duration, channel, order || 999]
        );
        
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ error: 'Failed to add video' });
    }
});

// Update video
router.put('/videos/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { title, url, duration, channel, order } = req.body;
        
        await pool.query(
            'UPDATE study_videos SET title = ?, url = ?, duration = ?, channel = ?, `order` = ? WHERE id = ?',
            [title, url, duration, channel, order, videoId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});

// Delete video
router.delete('/videos/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        await pool.query('DELETE FROM study_videos WHERE id = ?', [videoId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// ===== POINTERS CRUD =====

// Add pointer
router.post('/chapters/:chapterId/pointers', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { content, order } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO study_pointers (chapter_id, content, `order`) VALUES (?, ?, ?)',
            [chapterId, content, order || 999]
        );
        
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding pointer:', error);
        res.status(500).json({ error: 'Failed to add pointer' });
    }
});

// Update pointer
router.put('/pointers/:pointerId', async (req, res) => {
    try {
        const { pointerId } = req.params;
        const { content, order } = req.body;
        
        await pool.query(
            'UPDATE study_pointers SET content = ?, `order` = ? WHERE id = ?',
            [content, order, pointerId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating pointer:', error);
        res.status(500).json({ error: 'Failed to update pointer' });
    }
});

// Delete pointer
router.delete('/pointers/:pointerId', async (req, res) => {
    try {
        const { pointerId } = req.params;
        await pool.query('DELETE FROM study_pointers WHERE id = ?', [pointerId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting pointer:', error);
        res.status(500).json({ error: 'Failed to delete pointer' });
    }
});

// ===== FORMULAS CRUD =====

// Add formula
router.post('/chapters/:chapterId/formulas', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { formula, description, order } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO study_formulas (chapter_id, formula, description, `order`) VALUES (?, ?, ?, ?)',
            [chapterId, formula, description, order || 999]
        );
        
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding formula:', error);
        res.status(500).json({ error: 'Failed to add formula' });
    }
});

// Update formula
router.put('/formulas/:formulaId', async (req, res) => {
    try {
        const { formulaId } = req.params;
        const { formula, description, order } = req.body;
        
        await pool.query(
            'UPDATE study_formulas SET formula = ?, description = ?, `order` = ? WHERE id = ?',
            [formula, description, order, formulaId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating formula:', error);
        res.status(500).json({ error: 'Failed to update formula' });
    }
});

// Delete formula
router.delete('/formulas/:formulaId', async (req, res) => {
    try {
        const { formulaId } = req.params;
        await pool.query('DELETE FROM study_formulas WHERE id = ?', [formulaId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting formula:', error);
        res.status(500).json({ error: 'Failed to delete formula' });
    }
});

// ===== EXAMPLES CRUD =====

// Add example
router.post('/chapters/:chapterId/examples', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { problem, solution, explanation, order } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO study_examples (chapter_id, problem, solution, explanation, `order`) VALUES (?, ?, ?, ?, ?)',
            [chapterId, problem, solution, explanation, order || 999]
        );
        
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding example:', error);
        res.status(500).json({ error: 'Failed to add example' });
    }
});

// Update example
router.put('/examples/:exampleId', async (req, res) => {
    try {
        const { exampleId } = req.params;
        const { problem, solution, explanation, order } = req.body;
        
        await pool.query(
            'UPDATE study_examples SET problem = ?, solution = ?, explanation = ?, `order` = ? WHERE id = ?',
            [problem, solution, explanation, order, exampleId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
});

// Delete example
router.delete('/examples/:exampleId', async (req, res) => {
    try {
        const { exampleId } = req.params;
        await pool.query('DELETE FROM study_examples WHERE id = ?', [exampleId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting example:', error);
        res.status(500).json({ error: 'Failed to delete example' });
    }
});

// ===== PRACTICE PROBLEMS CRUD =====

// Add practice problem
router.post('/chapters/:chapterId/practice-problems', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { question, answer, difficulty, hint, explanation, order } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO study_practice_problems (chapter_id, question, answer, difficulty, hint, explanation, `order`) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [chapterId, question, answer, difficulty, hint, explanation, order || 999]
        );
        
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding practice problem:', error);
        res.status(500).json({ error: 'Failed to add practice problem' });
    }
});

// Update practice problem
router.put('/practice-problems/:problemId', async (req, res) => {
    try {
        const { problemId } = req.params;
        const { question, answer, difficulty, hint, explanation, order } = req.body;
        
        await pool.query(
            'UPDATE study_practice_problems SET question = ?, answer = ?, difficulty = ?, hint = ?, explanation = ?, `order` = ? WHERE id = ?',
            [question, answer, difficulty, hint, explanation, order, problemId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating practice problem:', error);
        res.status(500).json({ error: 'Failed to update practice problem' });
    }
});

// Delete practice problem
router.delete('/practice-problems/:problemId', async (req, res) => {
    try {
        const { problemId } = req.params;
        await pool.query('DELETE FROM study_practice_problems WHERE id = ?', [problemId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting practice problem:', error);
        res.status(500).json({ error: 'Failed to delete practice problem' });
    }
});

module.exports = router;
