const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all modules
router.get('/', async (req, res) => {
    try {
        const [modules] = await pool.query(
            'SELECT * FROM modules ORDER BY `order`'
        );
        res.json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// GET modules by section
router.get('/section/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const [modules] = await pool.query(
            'SELECT * FROM modules WHERE section = ? ORDER BY `order`',
            [section]
        );
        res.json(modules);
    } catch (error) {
        console.error('Error fetching modules by section:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// GET single module by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [modules] = await pool.query(
            'SELECT * FROM modules WHERE id = ?',
            [id]
        );
        
        if (modules.length === 0) {
            return res.status(404).json({ error: 'Module not found' });
        }
        
        res.json(modules[0]);
    } catch (error) {
        console.error('Error fetching module:', error);
        res.status(500).json({ error: 'Failed to fetch module' });
    }
});

// POST create new module
router.post('/', async (req, res) => {
    try {
        const { name, section, phase, priority, estimated_hours, order } = req.body;
        const now = Date.now();
        
        const [result] = await pool.query(
            'INSERT INTO modules (name, section, phase, priority, estimated_hours, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, section, phase, priority, estimated_hours, order, now, now]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Module created successfully' });
    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({ error: 'Failed to create module' });
    }
});

// PUT update module
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, section, phase, priority, estimated_hours, order } = req.body;
        const now = Date.now();
        
        await pool.query(
            'UPDATE modules SET name = ?, section = ?, phase = ?, priority = ?, estimated_hours = ?, `order` = ?, updated_at = ? WHERE id = ?',
            [name, section, phase, priority, estimated_hours, order, now, id]
        );
        
        res.json({ message: 'Module updated successfully' });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// DELETE module
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM modules WHERE id = ?', [id]);
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ error: 'Failed to delete module' });
    }
});

module.exports = router;
