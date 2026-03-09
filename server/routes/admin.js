const express = require('express');
const router = express.Router();
const { Chapter, Module, StudyMaterial, StudyVideo, StudyPointer, StudyFormula, StudyExample, StudyPracticeProblem } = require('../models');

// Get all chapters with materials status
router.get('/chapters', async (req, res) => {
    try {
        const chapters = await Chapter.find({}).lean();
        const modules = await Module.find({}).lean();
        // create a map of modules for quick lookup
        const moduleMap = modules.reduce((acc, m) => {
            // Mongoose ID is usually ObjectId if auto-generated, but we defined `id` for backwards comp or we use _id.
            // Wait, we defined `id` field in schemas but wait let me check module.
            // If we use Mongoose native, module.id might be undefined if we didn't migrate yet.
            // Assumes module_id in chapter matches module.id
            acc[m.id || m._id] = m;
            return acc;
        }, {});

        const materials = await StudyMaterial.find({}, 'chapter_id').lean();
        const materialChapterIds = new Set(materials.map(m => m.chapter_id.toString()));

        const result = chapters.map(c => {
            const m = moduleMap[c.module_id] || {};
            return {
                id: c.id || c._id,
                name: c.name,
                module_name: m.name || 'Unknown',
                section: m.section || 'Unknown',
                has_materials: materialChapterIds.has(c.id?.toString() || c._id?.toString())
            };
        });
        
        // Sort by section, module order, then chapter id
        result.sort((a, b) => {
            const modA = moduleMap[chapters.find(ch => (ch.id || ch._id) === a.id)?.module_id] || { order: 999 };
            const modB = moduleMap[chapters.find(ch => (ch.id || ch._id) === b.id)?.module_id] || { order: 999 };
            if (a.section !== b.section) return a.section.localeCompare(b.section);
            if (modA.order !== modB.order) return modA.order - modB.order;
            return String(a.id).localeCompare(String(b.id));
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// Get full study materials for a chapter
router.get('/chapters/:chapterId/materials', async (req, res) => {
    try {
        const { chapterId } = req.params;
        
        // We handle string chapterId which could be an ObjectId or numeric ID.
        // If numeric, query by id, if ObjectId query by _id. Or just use findOne with $or.
        const query = isNaN(Number(chapterId)) ? { chapter_id: chapterId } : { chapter_id: Number(chapterId) };

        const material = await StudyMaterial.findOne(query).lean();
        const videos = await StudyVideo.find(query).sort({ order: 1 }).lean();
        const pointers = await StudyPointer.find(query).sort({ order: 1 }).lean();
        const formulas = await StudyFormula.find(query).sort({ order: 1 }).lean();
        const examples = await StudyExample.find(query).sort({ order: 1 }).lean();
        const practiceProblems = await StudyPracticeProblem.find(query).sort({ order: 1 }).lean();
        
        res.json({
            material: material || null,
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
        const chId = isNaN(Number(chapterId)) ? chapterId : Number(chapterId);

        let material = await StudyMaterial.findOne({ chapter_id: chId });
        
        if (material) {
            material.brief_notes = brief_notes;
            material.detailed_notes = detailed_notes;
            material.updated_at = now;
            await material.save();
        } else {
            material = new StudyMaterial({
                chapter_id: chId,
                brief_notes,
                detailed_notes,
                created_at: now,
                updated_at: now
            });
            await material.save();
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
        const chId = isNaN(Number(chapterId)) ? chapterId : Number(chapterId);

        const video = new StudyVideo({
            chapter_id: chId,
            title, url, duration, channel, order: order || 999
        });
        await video.save();
        
        res.json({ success: true, id: video._id });
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
        
        await StudyVideo.findByIdAndUpdate(videoId, { title, url, duration, channel, order });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});

// Delete video
router.delete('/videos/:videoId', async (req, res) => {
    try {
        await StudyVideo.findByIdAndDelete(req.params.videoId);
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
        const chId = isNaN(Number(chapterId)) ? chapterId : Number(chapterId);

        const ptr = new StudyPointer({ chapter_id: chId, content, order: order || 999 });
        await ptr.save();
        res.json({ success: true, id: ptr._id });
    } catch (error) {
        console.error('Error adding pointer:', error);
        res.status(500).json({ error: 'Failed to add pointer' });
    }
});

// Update pointer
router.put('/pointers/:pointerId', async (req, res) => {
    try {
        const { content, order } = req.body;
        await StudyPointer.findByIdAndUpdate(req.params.pointerId, { content, order });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating pointer:', error);
        res.status(500).json({ error: 'Failed to update pointer' });
    }
});

// Delete pointer
router.delete('/pointers/:pointerId', async (req, res) => {
    try {
        await StudyPointer.findByIdAndDelete(req.params.pointerId);
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
        const chId = isNaN(Number(chapterId)) ? chapterId : Number(chapterId);

        const form = new StudyFormula({ chapter_id: chId, formula, description, order: order || 999 });
        await form.save();
        res.json({ success: true, id: form._id });
    } catch (error) {
        console.error('Error adding formula:', error);
        res.status(500).json({ error: 'Failed to add formula' });
    }
});

// Update formula
router.put('/formulas/:formulaId', async (req, res) => {
    try {
        const { formula, description, order } = req.body;
        await StudyFormula.findByIdAndUpdate(req.params.formulaId, { formula, description, order });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating formula:', error);
        res.status(500).json({ error: 'Failed to update formula' });
    }
});

// Delete formula
router.delete('/formulas/:formulaId', async (req, res) => {
    try {
        await StudyFormula.findByIdAndDelete(req.params.formulaId);
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
        const chId = isNaN(Number(chapterId)) ? chapterId : Number(chapterId);

        const ex = new StudyExample({ chapter_id: chId, problem, solution, explanation, order: order || 999 });
        await ex.save();
        res.json({ success: true, id: ex._id });
    } catch (error) {
        console.error('Error adding example:', error);
        res.status(500).json({ error: 'Failed to add example' });
    }
});

// Update example
router.put('/examples/:exampleId', async (req, res) => {
    try {
        const { problem, solution, explanation, order } = req.body;
        await StudyExample.findByIdAndUpdate(req.params.exampleId, { problem, solution, explanation, order });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
});

// Delete example
router.delete('/examples/:exampleId', async (req, res) => {
    try {
        await StudyExample.findByIdAndDelete(req.params.exampleId);
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
        const chId = isNaN(Number(chapterId)) ? chapterId : Number(chapterId);

        const pp = new StudyPracticeProblem({
            chapter_id: chId, question, answer, difficulty, hint, explanation, order: order || 999
        });
        await pp.save();
        res.json({ success: true, id: pp._id });
    } catch (error) {
        console.error('Error adding practice problem:', error);
        res.status(500).json({ error: 'Failed to add practice problem' });
    }
});

// Update practice problem
router.put('/practice-problems/:problemId', async (req, res) => {
    try {
        const { question, answer, difficulty, hint, explanation, order } = req.body;
        await StudyPracticeProblem.findByIdAndUpdate(req.params.problemId, {
            question, answer, difficulty, hint, explanation, order
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating practice problem:', error);
        res.status(500).json({ error: 'Failed to update practice problem' });
    }
});

// Delete practice problem
router.delete('/practice-problems/:problemId', async (req, res) => {
    try {
        await StudyPracticeProblem.findByIdAndDelete(req.params.problemId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting practice problem:', error);
        res.status(500).json({ error: 'Failed to delete practice problem' });
    }
});

module.exports = router;
