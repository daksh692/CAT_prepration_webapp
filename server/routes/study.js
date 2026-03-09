const express = require('express');
const router = express.Router();
const { Chapter, StudyMaterial, StudyPointer, StudyFormula, StudyExample, StudyPracticeProblem, StudySession, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all study routes
router.use(authenticateToken);

// =================================
// STUDY SESSION ENDPOINTS
// =================================

// Get chapters that have study materials
router.get('/chapters-with-materials', async (req, res) => {
    try {
        const materials = await StudyMaterial.distinct('chapter_id');
        const pointers = await StudyPointer.distinct('chapter_id');
        const formulas = await StudyFormula.distinct('chapter_id');
        const examples = await StudyExample.distinct('chapter_id');
        const practices = await StudyPracticeProblem.distinct('chapter_id');

        const chapterIdsWithMaterials = new Set([
            ...materials.map(id => id.toString()),
            ...pointers.map(id => id.toString()),
            ...formulas.map(id => id.toString()),
            ...examples.map(id => id.toString()),
            ...practices.map(id => id.toString())
        ]);

        const idsArray = Array.from(chapterIdsWithMaterials);
        
        const stringIds = idsArray.filter(id => isNaN(Number(id)));
        const numIds = idsArray.filter(id => !isNaN(Number(id))).map(Number);
        
        const chapters = await Chapter.find({
            $or: [
                { _id: { $in: stringIds } },
                { id: { $in: numIds } }
            ]
        }).select('id _id module_id name').lean();

        res.json(chapters.map(c => ({ id: c.id || c._id, module_id: c.module_id, name: c.name })));
    } catch (error) {
        console.error('Error fetching chapters with materials:', error);
        res.status(500).json({ error: 'Failed to fetch chapters with materials' });
    }
});

// Get all study materials for a specific chapter
router.get('/chapter/:chapterId', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chId = isNaN(Number(chapterId)) ? chapterId : Number(chapterId);

        const query = { chapter_id: chId };

        const [materials, pointers, formulas, examples, practice] = await Promise.all([
            StudyMaterial.find(query).lean(),
            StudyPointer.find(query).sort({ order: 1 }).lean(),
            StudyFormula.find(query).sort({ order: 1 }).lean(),
            StudyExample.find(query).sort({ order: 1 }).lean(),
            StudyPracticeProblem.find(query).sort({ id: 1 }).lean()
        ]);
        
        res.json({
            materials: materials[0] || null,
            pointers: pointers[0] || null,
            formulas: formulas[0] || null,
            examples: examples[0] || null,
            practice: practice[0] || null,
            notes: null // No study_notes model existed previously in index.js
        });
    } catch (error) {
        console.error('Error fetching study materials:', error);
        res.status(500).json({ error: 'Failed to fetch study materials' });
    }
});

// Get session history
router.get('/sessions/history', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sessions = await StudySession.aggregate([
            { $match: { user_id: uIdNum, date: { $gte: startDate } } },
            { $sort: { date: -1, created_at: -1 } },
            { $lookup: {
                from: 'chapters',
                let: { ch_id: "$chapter_id" },
                pipeline: [
                    { $match: { $expr: { $or: [ { $eq: ["$id", "$$ch_id"] }, { $eq: ["$_id", "$$ch_id"] } ] } } }
                ],
                as: 'chapter'
            }},
            { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },
            { $lookup: {
                from: 'modules',
                let: { m_id: "$chapter.module_id" },
                pipeline: [
                    { $match: { $expr: { $or: [ { $eq: ["$id", "$$m_id"] }, { $eq: ["$_id", "$$m_id"] } ] } } }
                ],
                as: 'module'
            }},
            { $unwind: { path: "$module", preserveNullAndEmptyArrays: true } }
        ]);

        const sessionsByDay = {};
        let weekTotalMinutes = 0;
        let weekTotalQuestions = 0;

        sessions.forEach(session => {
            const dateStr = session.date instanceof Date ? session.date.toISOString().split('T')[0] : session.date.toString().split('T')[0];
            if (!sessionsByDay[dateStr]) {
                sessionsByDay[dateStr] = {
                    date: dateStr,
                    total_minutes: 0,
                    total_questions: 0,
                    session_count: 0,
                    sessions: []
                };
            }
            
            sessionsByDay[dateStr].total_minutes += session.duration || 0;
            sessionsByDay[dateStr].total_questions += session.questions_completed || 0;
            sessionsByDay[dateStr].session_count++;
            
            const transformedSession = {
                ...session,
                chapter_name: session.chapter ? session.chapter.name : null,
                module_name: session.module ? session.module.name : null,
                section: session.module ? session.module.section : null
            };
            delete transformedSession.chapter;
            delete transformedSession.module;

            sessionsByDay[dateStr].sessions.push(transformedSession);
            
            weekTotalMinutes += session.duration || 0;
            weekTotalQuestions += session.questions_completed || 0;
        });

        res.json({
            sessions_by_day: Object.values(sessionsByDay),
            week_total_minutes: weekTotalMinutes,
            week_total_questions: weekTotalQuestions,
            days_studied: Object.keys(sessionsByDay).length
        });
    } catch (error) {
        console.error('Error fetching session history:', error);
        res.status(500).json({ error: 'Failed to fetch session history' });
    }
});

// Get today's detailed sessions
router.get('/sessions/today', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const startOfToday = new Date(todayStr);
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        
        const sessions = await StudySession.aggregate([
            { $match: { user_id: uIdNum, date: { $gte: startOfToday, $lt: endOfToday } } },
            { $sort: { created_at: -1 } },
            { $lookup: {
                from: 'chapters',
                let: { ch_id: "$chapter_id" },
                pipeline: [
                    { $match: { $expr: { $or: [ { $eq: ["$id", "$$ch_id"] }, { $eq: ["$_id", "$$ch_id"] } ] } } }
                ],
                as: 'chapter'
            }},
            { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },
            { $lookup: {
                from: 'modules',
                let: { m_id: "$chapter.module_id" },
                pipeline: [
                    { $match: { $expr: { $or: [ { $eq: ["$id", "$$m_id"] }, { $eq: ["$_id", "$$m_id"] } ] } } }
                ],
                as: 'module'
            }},
            { $unwind: { path: "$module", preserveNullAndEmptyArrays: true } }
        ]);

        const formatted = sessions.map(session => ({
            ...session,
            chapter_name: session.chapter ? session.chapter.name : null,
            module_name: session.module ? session.module.name : null,
            section: session.module ? session.module.section : null
        }));
        
        res.json({ sessions: formatted, count: formatted.length });
    } catch (error) {
        console.error('Error fetching today sessions:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s sessions' });
    }
});

// Start new study session
router.post('/sessions/start', async (req, res) => {
    try {
        const { chapter_id, study_mode } = req.body;
        if (!chapter_id) return res.status(400).json({ error: 'Chapter ID is required' });
        
        const chId = isNaN(Number(chapter_id)) ? chapter_id : Number(chapter_id);
        
        const chapterArr = await Chapter.aggregate([
            { $match: { $or: [{ id: chId }, { _id: String(chId) }] } },
            { $lookup: {
                from: 'modules',
                let: { m_id: "$module_id" },
                pipeline: [
                    { $match: { $expr: { $or: [ { $eq: ["$id", "$$m_id"] }, { $eq: ["$_id", "$$m_id"] } ] } } }
                ],
                as: 'module'
            }},
            { $unwind: { path: "$module", preserveNullAndEmptyArrays: true } }
        ]);
        
        if (chapterArr.length === 0) return res.status(404).json({ error: 'Chapter not found' });
        
        const chapterInfo = {
            ...chapterArr[0],
            module_name: chapterArr[0].module?.name,
            section: chapterArr[0].module?.section
        };
        
        res.json({
            session_id: `temp_${Date.now()}`,
            chapter: chapterInfo,
            study_mode: study_mode || 'website',
            started_at: Date.now(),
            message: 'Session started successfully'
        });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// End study session and save
router.post('/sessions/end', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        const { chapter_id, duration, questions_completed, study_mode } = req.body;
        
        if (!duration || duration <= 0) return res.status(400).json({ error: 'Duration must be greater than 0' });
        
        const chId = isNaN(Number(chapter_id)) ? null : Number(chapter_id);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const session = new StudySession({
            user_id: uIdNum,
            date: new Date(),
            chapter_id: chId,
            duration: duration,
            questions_completed: questions_completed || 0,
            created_at: Date.now()
        });
        await session.save();

        const user = await User.findOne({ id: uIdNum });
        if (user) {
            const lastDate = user.last_study_date;
            let currentStreak = user.current_streak || 0;
            let longestStreak = user.longest_streak || 0;
            
            if (!lastDate) {
                currentStreak = 1;
            } else {
                const lastStudyDate = new Date(lastDate);
                const todayDate = new Date(todayStr);
                const diffDays = Math.floor((todayDate - lastStudyDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    currentStreak += 1;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            }
            
            if (currentStreak > longestStreak) longestStreak = currentStreak;
            
            user.current_streak = currentStreak;
            user.longest_streak = longestStreak;
            user.last_study_date = todayStr;
            await user.save();
            
            res.json({
                message: 'Session saved successfully',
                session_id: session._id,
                duration,
                questions_completed: questions_completed || 0,
                streak: { current: currentStreak, longest: longestStreak }
            });
        } else {
            res.json({
                message: 'Session saved successfully',
                session_id: session._id,
                duration,
                questions_completed: questions_completed || 0
            });
        }
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

// Get weekly analytics data
router.get('/analytics/weekly', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0,0,0,0);
        
        const sessions = await StudySession.aggregate([
            { $match: { user_id: uIdNum, date: { $gte: startDate } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                total_minutes: { $sum: "$duration" },
                total_questions: { $sum: "$questions_completed" },
                session_count: { $sum: 1 }
            }}
        ]);
        
        const dataMap = sessions.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});
        const dataPoints = [];
        const days = 7;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const record = dataMap[dateStr] || {};
            
            dataPoints.push({
                date: dateStr,
                day_name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                total_minutes: record.total_minutes || 0,
                total_questions: record.total_questions || 0,
                session_count: record.session_count || 0
            });
        }
        
        const totalMinutes = dataPoints.reduce((sum, day) => sum + day.total_minutes, 0);
        const totalQuestions = dataPoints.reduce((sum, day) => sum + day.total_questions, 0);
        const avgMinutesPerDay = Math.round(totalMinutes / days);
        
        res.json({
            data_points: dataPoints,
            summary: {
                total_minutes: totalMinutes,
                total_questions: totalQuestions,
                avg_minutes_per_day: avgMinutesPerDay,
                days_studied: dataPoints.filter(d => d.total_minutes > 0).length
            }
        });
    } catch (error) {
        console.error('Error fetching weekly analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
