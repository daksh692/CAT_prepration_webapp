const express = require('express');
const router = express.Router();
const { TestResult, Chapter } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

// Apply authentication to all test routes
router.use(authenticateToken);

// =================================
// CAT MARKING CALCULATION FUNCTION
// =================================
function calculateCATMarks(data) {
    const { test_type, correct_mcq, incorrect_mcq, correct_fitb = 0, incorrect_fitb = 0 } = data;
    
    // CAT Marking System:
    // MCQ: +3 for correct, -1 for incorrect
    // FITB (Fill in the Blanks): +3 for correct, 0 for incorrect
    
    const mcqMarks = (correct_mcq * 3) - (incorrect_mcq * 1);
    const fitbMarks = (correct_fitb * 3); // No negative marking for FITB
    
    const totalMarks = mcqMarks + fitbMarks;
    const maxMarks = ((correct_mcq + incorrect_mcq) * 3) + (correct_fitb + incorrect_fitb) * 3;
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    
    return {
        total_marks: totalMarks,
        max_marks: maxMarks,
        percentage: Math.max(0, percentage) // Ensure non-negative
    };
}

// =================================
// TEST RESULT ENDPOINTS
// =================================

// Get all test results for logged-in user
router.get('/results', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const { days = 30, test_type } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const matchStage = { user_id: uIdNum, test_date: { $gte: startDate } };
        if (test_type) {
            matchStage.test_type = test_type;
        }
        
        const rawResults = await TestResult.aggregate([
            { $match: matchStage },
            { $sort: { test_date: -1, created_at: -1 } },
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

        const results = rawResults.map(r => ({
            ...r,
            chapter_name: r.chapter ? r.chapter.name : null,
            module_name: r.module ? r.module.name : null,
            section: r.module ? r.module.section : (r.section || null)
        }));
        
        const summary = {
            total_tests: results.length,
            website_tests: results.filter(r => r.test_type === 'website').length,
            external_tests: results.filter(r => r.test_type === 'external').length,
            total_questions: results.reduce((sum, r) => sum + r.total_questions, 0),
            average_percentage: results.length > 0 
                ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length 
                : 0,
            total_marks_earned: results.reduce((sum, r) => sum + r.total_marks, 0)
        };
        
        res.json({ results, summary });
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).json({ error: 'Failed to fetch test results' });
    }
});

// Record website test result
router.post('/results/website', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const { chapter_id, correct_mcq, incorrect_mcq, unattempted_mcq } = req.body;
        
        const totalQuestions = correct_mcq + incorrect_mcq + unattempted_mcq;
        const marks = calculateCATMarks({ 
            test_type: 'website', 
            correct_mcq, 
            incorrect_mcq 
        });
        
        let section = null;
        if (chapter_id) {
            const chId = isNaN(Number(chapter_id)) ? chapter_id : Number(chapter_id);
            const ch = await Chapter.aggregate([
                { $match: { $or: [{ id: chId }, { _id: String(chId) }] } },
                { $lookup: {
                    from: 'modules',
                    let: { m_id: "$module_id" },
                    pipeline: [
                        { $match: { $expr: { $or: [ { $eq: ["$id", "$$m_id"] }, { $eq: ["$_id", "$$m_id"] } ] } } }
                    ],
                    as: 'module'
                }}
            ]);
            if (ch.length && ch[0].module && ch[0].module.length) {
                section = ch[0].module[0].section;
            }
        }
        
        const newResult = new TestResult({
            user_id: uIdNum,
            test_date: new Date(),
            test_type: 'website',
            chapter_id: isNaN(Number(chapter_id)) ? null : Number(chapter_id),
            section,
            total_questions: totalQuestions,
            correct_mcq,
            incorrect_mcq,
            unattempted_mcq,
            total_marks: marks.total_marks,
            max_marks: marks.max_marks,
            percentage: marks.percentage,
            created_at: Date.now()
        });
        await newResult.save();
        
        // Trigger generic check achievements endpoint, non critical
        try {
            const token = req.headers.authorization;
            await axios.post(`http://localhost:${process.env.PORT || 5000}/api/analytics/check-achievements`, {}, {
                headers: { 'Authorization': token }
            });
        } catch (err) { }
        
        res.json({ message: 'Test result recorded successfully', marks: marks });
    } catch (error) {
        console.error('Error recording website test:', error);
        res.status(500).json({ error: 'Failed to record test result' });
    }
});

// Record external test result
router.post('/results/external', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const { chapter_id, section, correct_mcq, incorrect_mcq, correct_fitb = 0, incorrect_fitb = 0, is_checked = true, notes } = req.body;
        
        const totalQuestions = correct_mcq + incorrect_mcq + correct_fitb + incorrect_fitb;
        const marks = calculateCATMarks({ test_type: 'external', correct_mcq, incorrect_mcq, correct_fitb, incorrect_fitb });
        
        const newResult = new TestResult({
            user_id: uIdNum,
            test_date: new Date(),
            test_type: 'external',
            chapter_id: isNaN(Number(chapter_id)) ? null : Number(chapter_id),
            section,
            total_questions: totalQuestions,
            correct_mcq_external: correct_mcq,
            incorrect_mcq_external: incorrect_mcq,
            correct_fitb,
            incorrect_fitb,
            total_marks: marks.total_marks,
            max_marks: marks.max_marks,
            percentage: marks.percentage,
            is_checked,
            notes,
            created_at: Date.now()
        });
        await newResult.save();
        
        try {
            const token = req.headers.authorization;
            await axios.post(`http://localhost:${process.env.PORT || 5000}/api/analytics/check-achievements`, {}, {
                headers: { 'Authorization': token }
            });
        } catch (err) { }
        
        res.json({ message: 'External test result recorded successfully', marks: marks });
    } catch (error) {
        console.error('Error recording external test:', error);
        res.status(500).json({ error: 'Failed to record test result' });
    }
});

// Get analytics summary
router.get('/analytics', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const days = parseInt(req.query.days) || 30;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0,0,0,0);
        
        // daily data
        const dailyData = await TestResult.aggregate([
            { $match: { user_id: uIdNum, test_date: { $gte: startDate } } },
            { $group: {
                _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$test_date" } }, test_type: "$test_type" },
                test_count: { $sum: 1 },
                questions_attempted: { $sum: "$total_questions" },
                avg_percentage: { $avg: "$percentage" },
                total_marks: { $sum: "$total_marks" }
            }},
            { $sort: { "_id.date": 1 } }
        ]);
        const formattedDailyData = dailyData.map(d => ({
            test_date: d._id.date,
            test_type: d._id.test_type,
            test_count: d.test_count,
            questions_attempted: d.questions_attempted,
            avg_percentage: d.avg_percentage,
            total_marks: d.total_marks
        }));

        // subject data
        const subjectDataAggregate = await TestResult.aggregate([
            { $match: { user_id: uIdNum, test_date: { $gte: startDate } } },
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
            { $unwind: { path: "$module", preserveNullAndEmptyArrays: true } },
            { $group: {
                _id: { $cond: [ { $ifNull: ["$module.section", false] }, "$module.section", "$section" ] },
                test_count: { $sum: 1 },
                questions_attempted: { $sum: "$total_questions" },
                avg_percentage: { $avg: "$percentage" }
            }}
        ]);
        const subjectData = subjectDataAggregate.map(d => ({
            section: d._id,
            test_count: d.test_count,
            questions_attempted: d.questions_attempted,
            avg_percentage: d.avg_percentage
        }));

        // overall stats
        const overallStats = await TestResult.aggregate([
            { $match: { user_id: uIdNum, test_date: { $gte: startDate } } },
            { $group: {
                _id: null,
                total_tests: { $sum: 1 },
                total_questions: { $sum: "$total_questions" },
                avg_percentage: { $avg: "$percentage" },
                website_avg: { $avg: { $cond: [ { $eq: ["$test_type", "website"] }, "$percentage", null ] } },
                external_avg: { $avg: { $cond: [ { $eq: ["$test_type", "external"] }, "$percentage", null ] } }
            }}
        ]);
        
        res.json({
            daily_data: formattedDailyData,
            subject_data: subjectData,
            overall: overallStats.length > 0 ? overallStats[0] : { total_tests: 0, total_questions: 0, avg_percentage: 0 }
        });
    } catch (error) {
        console.error('Error fetching test analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Delete test result
router.delete('/results/:id', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        
        await TestResult.deleteOne({ _id: req.params.id, user_id: uIdNum });
        res.json({ message: 'Test result deleted successfully' });
    } catch (error) {
        console.error('Error deleting test result:', error);
        res.status(500).json({ error: 'Failed to delete test result' });
    }
});

module.exports = router;
