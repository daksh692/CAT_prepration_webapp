const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

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
        const userId = req.user.id;
        const { days = 30, test_type } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const startDateStr = startDate.toISOString().split('T')[0];
        
        let query = `
            SELECT t.*, c.name as chapter_name, m.name as module_name, m.section
            FROM test_results t
            LEFT JOIN chapters c ON t.chapter_id = c.id
            LEFT JOIN modules m ON c.module_id = m.id
            WHERE t.user_id = ? AND t.test_date >= ?
        `;
        const params = [userId, startDateStr];
        
        if (test_type) {
            query += ' AND t.test_type = ?';
            params.push(test_type);
        }
        
        query += ' ORDER BY t.test_date DESC, t.created_at DESC';
        
        const [results] = await pool.query(query, params);
        
        // Calculate summary statistics
        const summary = {
            total_tests: results.length,
            website_tests: results.filter(r => r.test_type === 'website').length,
            external_tests: results.filter(r => r.test_type === 'external').length,
            total_questions: results.reduce((sum, r) => sum + r.total_questions, 0),
            average_percentage: results.length > 0 
                ? results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length 
                : 0,
            total_marks_earned: results.reduce((sum, r) => sum + parseFloat(r.total_marks), 0)
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
        const userId = req.user.id;
        const { chapter_id, correct_mcq, incorrect_mcq, unattempted_mcq } = req.body;
        
        const totalQuestions = correct_mcq + incorrect_mcq + unattempted_mcq;
        const marks = calculateCATMarks({ 
            test_type: 'website', 
            correct_mcq, 
            incorrect_mcq 
        });
        
        // Get section from chapter if chapter_id provided
        let section = null;
        if (chapter_id) {
            const [chapterData] = await pool.query(
                `SELECT m.section FROM chapters c 
                 JOIN modules m ON c.module_id = m.id 
                 WHERE c.id = ?`,
                [chapter_id]
            );
            section = chapterData[0]?.section || null;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        await pool.query(
            `INSERT INTO test_results 
             (user_id, test_date, test_type, chapter_id, section, total_questions, 
              correct_mcq, incorrect_mcq, unattempted_mcq, 
              total_marks, max_marks, percentage, created_at)
             VALUES (?, ?, 'website', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, today, chapter_id, section, totalQuestions, 
             correct_mcq, incorrect_mcq, unattempted_mcq,
             marks.total_marks, marks.max_marks, marks.percentage, now]
        );
        
        // Check for achievements
        const axios = require('axios');
        try {
            const token = req.headers.authorization;
            await axios.post('http://localhost:5000/api/analytics/check-achievements', {}, {
                headers: { 'Authorization': token }
            });
        } catch (err) {
            console.log('Achievement check failed (non-critical):', err.message);
        }
        
        res.json({ 
            message: 'Test result recorded successfully',
            marks: marks
        });
    } catch (error) {
        console.error('Error recording website test:', error);
        res.status(500).json({ error: 'Failed to record test result' });
    }
});

// Record external test result
router.post('/results/external', async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            chapter_id, 
            section,  // Now accepting section from frontend
            correct_mcq, 
            incorrect_mcq, 
            correct_fitb = 0, 
            incorrect_fitb = 0,
            is_checked = true,
            notes 
        } = req.body;
        
        const totalQuestions = correct_mcq + incorrect_mcq + correct_fitb + incorrect_fitb;
        const marks = calculateCATMarks({ 
            test_type: 'external', 
            correct_mcq, 
            incorrect_mcq,
            correct_fitb,
            incorrect_fitb
        });
        
        const today = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        await pool.query(
            `INSERT INTO test_results 
             (user_id, test_date, test_type, chapter_id, section, total_questions,
              correct_mcq_external, incorrect_mcq_external, 
              correct_fitb, incorrect_fitb,
              total_marks, max_marks, percentage, is_checked, notes, created_at)
             VALUES (?, ?, 'external', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, today, chapter_id, section, totalQuestions,
             correct_mcq, incorrect_mcq, correct_fitb, incorrect_fitb,
             marks.total_marks, marks.max_marks, marks.percentage, is_checked, notes, now]
        );
        
        // Check for achievements
        const axios = require('axios');
        try {
            const token = req.headers.authorization;
            await axios.post('http://localhost:5000/api/analytics/check-achievements', {}, {
                headers: { 'Authorization': token }
            });
        } catch (err) {
            console.log('Achievement check failed (non-critical):', err.message);
        }
        
        res.json({ 
            message: 'External test result recorded successfully',
            marks: marks
        });
    } catch (error) {
        console.error('Error recording external test:', error);
        res.status(500).json({ error: 'Failed to record test result' });
    }
});

// Get analytics summary
router.get('/analytics', async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 30;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Get daily test data
        const [dailyData] = await pool.query(
            `SELECT 
                test_date,
                test_type,
                COUNT(*) as test_count,
                SUM(total_questions) as questions_attempted,
                AVG(percentage) as avg_percentage,
                SUM(total_marks) as total_marks
             FROM test_results
             WHERE user_id = ? AND test_date >= ?
             GROUP BY test_date, test_type
             ORDER BY test_date ASC`,
            [userId, startDateStr]
        );
        
        // Get subject-wise performance
        const [subjectData] = await pool.query(
            `SELECT 
                m.section,
                COUNT(*) as test_count,
                SUM(t.total_questions) as questions_attempted,
                AVG(t.percentage) as avg_percentage
             FROM test_results t
             LEFT JOIN chapters c ON t.chapter_id = c.id
             LEFT JOIN modules m ON c.module_id = m.id
             WHERE t.user_id = ? AND t.test_date >= ?
             GROUP BY m.section`,
            [userId, startDateStr]
        );
        
        // Get overall stats
        const [overallStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_tests,
                SUM(total_questions) as total_questions,
                AVG(percentage) as avg_percentage,
                AVG(CASE WHEN test_type = 'website' THEN percentage END) as website_avg,
                AVG(CASE WHEN test_type = 'external' THEN percentage END) as external_avg
             FROM test_results
             WHERE user_id = ? AND test_date >= ?`,
            [userId, startDateStr]
        );
        
        res.json({
            daily_data: dailyData,
            subject_data: subjectData,
            overall: overallStats[0]
        });
    } catch (error) {
        console.error('Error fetching test analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Delete test result
router.delete('/results/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const testId = req.params.id;
        
        await pool.query(
            'DELETE FROM test_results WHERE id = ? AND user_id = ?',
            [testId, userId]
        );
        
        res.json({ message: 'Test result deleted successfully' });
    } catch (error) {
        console.error('Error deleting test result:', error);
        res.status(500).json({ error: 'Failed to delete test result' });
    }
});

module.exports = router;
