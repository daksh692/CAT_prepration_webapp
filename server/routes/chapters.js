const express = require('express');
const router = express.Router();
const { Chapter } = require('../models');
const mongoose = require('mongoose');

const getQuery = (id) => mongoose.Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { id: isNaN(Number(id)) ? -1 : Number(id) }] } : { id: Number(id) };

// GET all chapters
router.get('/', async (req, res) => {
    try {
        const chapters = await Chapter.find({}).lean();
        res.json(chapters.map(c => ({ ...c, id: c.id || c._id })));
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// GET chapters by module ID
router.get('/module/:moduleId', async (req, res) => {
    try {
        const mId = req.params.moduleId;
        const query = isNaN(Number(mId)) ? { module_id: mId } : { module_id: Number(mId) };
        const chapters = await Chapter.find(query).sort({ _id: 1 }).lean();
        res.json(chapters.map(c => ({ ...c, id: c.id || c._id })));
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// GET single chapter by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = getQuery(id);
        const chapter = await Chapter.findOne(query).lean();
        
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        
        res.json({ ...chapter, id: chapter.id || chapter._id });
    } catch (error) {
        console.error('Error fetching chapter:', error);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});

// GET chapter by name
router.get('/name/:name', async (req, res) => {
    try {
        const chapter = await Chapter.findOne({ name: req.params.name }).lean();
        
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        
        res.json({ ...chapter, id: chapter.id || chapter._id });
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
        const mId = isNaN(Number(module_id)) ? module_id : Number(module_id);
        
        const newChapter = new Chapter({
            module_id: mId,
            name,
            topics, // already array or parseable
            estimated_hours,
            difficulty,
            completed: false,
            skipped: false,
            created_at: now
        });
        await newChapter.save();
        
        res.status(201).json({ id: newChapter._id, message: 'Chapter created successfully' });
    } catch (error) {
        console.error('Error creating chapter:', error);
        res.status(500).json({ error: 'Failed to create chapter' });
    }
});

// PUT update chapter
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { completed, skipped, skip_test_score, notes } = req.body;
        
        const updateData = {};
        if (completed !== undefined) updateData.completed = completed;
        if (skipped !== undefined) updateData.skipped = skipped;
        if (skip_test_score !== undefined) updateData.skip_test_score = skip_test_score;
        if (notes !== undefined) updateData.notes = notes;
        if (completed) updateData.completed_at = Date.now();
        
        const query = getQuery(id);
        await Chapter.findOneAndUpdate(query, updateData);
        
        res.json({ message: 'Chapter updated successfully' });
    } catch (error) {
        console.error('Error updating chapter:', error);
        res.status(500).json({ error: 'Failed to update chapter' });
    }
});

// DELETE chapter
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = getQuery(id);
        await Chapter.findOneAndDelete(query);
        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error('Error deleting chapter:', error);
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
});

module.exports = router;
