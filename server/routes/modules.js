const express = require('express');
const router = express.Router();
const { Module, Chapter } = require('../models');
const mongoose = require('mongoose');

const getQuery = (id) => mongoose.Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { id: isNaN(Number(id)) ? -1 : Number(id) }] } : { id: Number(id) };

// GET all modules
router.get('/', async (req, res) => {
    try {
        const modules = await Module.find({}).sort({ order: 1 }).lean();
        const chapters = await Chapter.find({}).lean();
        
        // Count chapters for each module
        const chapterCountMap = {};
        for (const ch of chapters) {
            const mId = ch.module_id.toString();
            chapterCountMap[mId] = (chapterCountMap[mId] || 0) + 1;
        }

        const result = modules.map(m => ({
            ...m,
            id: m.id || m._id,
            chapterCount: chapterCountMap[(m.id || m._id).toString()] || 0
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// GET modules by section
router.get('/section/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const modules = await Module.find({ section }).sort({ order: 1 }).lean();
        res.json(modules.map(m => ({ ...m, id: m.id || m._id })));
    } catch (error) {
        console.error('Error fetching modules by section:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// GET single module by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = getQuery(id);
        const moduleDoc = await Module.findOne(query).lean();
        
        if (!moduleDoc) {
            return res.status(404).json({ error: 'Module not found' });
        }
        
        res.json({ ...moduleDoc, id: moduleDoc.id || moduleDoc._id });
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
        
        const newModule = new Module({
            name, section, phase, priority, estimated_hours, order, 
            created_at: now, updated_at: now
        });
        await newModule.save();
        
        res.status(201).json({ id: newModule._id, message: 'Module created successfully' });
    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({ error: 'Failed to create module' });
    }
});

// PUT update module
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, section, phase, priority, estimated_hours, order } = req.body;
        const now = Date.now();
        
        const query = getQuery(id);
        await Module.findOneAndUpdate(query, {
            name, section, phase, priority, estimated_hours, order, updated_at: now
        });
        
        res.json({ message: 'Module updated successfully' });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// DELETE module
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = getQuery(id);
        await Module.findOneAndDelete(query);
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ error: 'Failed to delete module' });
    }
});

module.exports = router;
