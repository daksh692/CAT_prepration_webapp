const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all chapters
router.get('/', async (req, res) => {
    try {
        const [chapters] = await pool.query('SELECT * FROM chapters');
        res.json(chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// GET chapters by module ID
router.get('/module/:moduleId', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const [chapters] = await pool.query(
            'SELECT * FROM chapters WHERE module_id = ? ORDER BY id',
            [moduleId]
        );
        res.json(chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// GET single chapter by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [chapters] = await pool.query(
            'SELECT * FROM chapters WHERE id = ?',
            [id]
        );
        
        if (chapters.length === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        
        res.json(chapters[0]);
    } catch (error) {
        console.error('Error fetching chapter:', error);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});

// GET chapter by name
router.get('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const [chapters] = await pool.query(
            'SELECT * FROM chapters WHERE name = ?',
            [name]
        );
        
        if (chapters.length === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        
        res.json(chapters[0]);
    } catch (error) {
        console.error('Error fetching chapter:', error);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});

// POST create new chapter
router.post('/', async (req, res) => {
    try {
        const { module_id, name, topics, estimated_hours, difficulty } = req.body;
        const now = Date.now();
        
        const [result] = await pool.query(
            'INSERT INTO chapters (module_id, name, topics, estimated_hours, difficulty, completed, skipped, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [module_id, name, JSON.stringify(topics), estimated_hours, difficulty, false, false, now]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Chapter created successfully' });
    } catch (error) {
        console.error('Error creating chapter:', error);
        res.status(500).json({ error: 'Failed to create chapter' });
    }
});

// PUT update chapter
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed, skipped, skip_test_score, notes } = req.body;
        
        let query = 'UPDATE chapters SET ';
        const params = [];
        
        if (completed !== undefined) {
            query += 'completed = ?, ';
            params.push(completed);
        }
        if (skipped !== undefined) {
            query += 'skipped = ?, ';
            params.push(skipped);
        }
        if (skip_test_score !== undefined) {
            query += 'skip_test_score = ?, ';
            params.push(skip_test_score);
        }
        if (notes !== undefined) {
            query += 'notes = ?, ';
            params.push(notes);
        }
        
        if (completed) {
            query += 'completed_at = ?, ';
            params.push(Date.now());
        }
        
        // Remove trailing comma
        query = query.slice(0, -2);
        query += ' WHERE id = ?';
        params.push(id);
        
        await pool.query(query, params);
        res.json({ message: 'Chapter updated successfully' });
    } catch (error) {
        console.error('Error updating chapter:', error);
        res.status(500).json({ error: 'Failed to update chapter' });
    }
});

// DELETE chapter
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM chapters WHERE id = ?', [id]);
        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error('Error deleting chapter:', error);
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
});

module.exports = router;
