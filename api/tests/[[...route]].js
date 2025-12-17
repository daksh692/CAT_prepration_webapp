import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';
import { requireAuth } from './_lib/auth.js';

// CAT marking calculation
function calculateCATMarks(data) {
    const {
        correct_mcq = 0,
        incorrect_mcq = 0,
        correct_fitb = 0,
        incorrect_fitb = 0,
        unattempted_mcq = 0
    } = data;
    
    const mcqMarks = (correct_mcq * 3) - (incorrect_mcq * 1);
    const fitbMarks = (correct_fitb * 3) - (incorrect_fitb * 1);
    const totalMarks = mcqMarks + fitbMarks;
    
    const totalQuestions = correct_mcq + incorrect_mcq + unattempted_mcq + correct_fitb + incorrect_fitb;
    const maxMarks = totalQuestions * 3;
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    
    return {
        total_marks: Math.max(0, totalMarks),
        max_marks: maxMarks,
        percentage: Math.max(0, percentage.toFixed(2))
    };
}

async function handler(req, res) {
    if (handleCORS(req, res)) return;
    
    try {
        const userId = req.user?.id;
        if (!userId) return errorResponse(res, 401, 'Unauthorized');
        
        let pathParts = [];
        if (req.query.route) {
            pathParts = Array.isArray(req.query.route) 
                ? req.query.route 
                : req.query.route.split('/');
        }
        pathParts = pathParts.filter(p => p);
        
        // GET /api/tests/results
        if (req.method === 'GET' && pathParts[0] === 'results') {
            const days = parseInt(req.query.days) || 30;
            const testType = req.query.test_type;
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString().split('T')[0];
            
            let query = `
                SELECT t.*, c.name as chapter_name, m.name as module_name, m.section
                FROM test_results t
                LEFT JOIN chapters c ON t.chapter_id = c.id
                LEFT JOIN modules m ON c.module_id = m.id
                WHERE t.user_id = ? AND t.test_date >= ?
            `;
            const params = [userId, startDateStr];
            
            if (testType) {
                query += ' AND t.test_type = ?';
                params.push(testType);
            }
            
            query += ' ORDER BY t.test_date DESC, t.created_at DESC';
            
            const results = await executeQuery(query, params);
            
            const summary = {
                total_tests: results.length,
                website_tests: results.filter(r => r.test_type === 'website').length,
                external_tests: results.filter(r => r.test_type === 'external').length,
                avg_percentage: results.length > 0 
                    ? results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length
                    : 0,
                total_marks_earned: results.reduce((sum, r) => sum + parseFloat(r.total_marks), 0)
            };
            
            return res.status(200).json({ results, summary });
        }
        
        // POST /api/tests/results/website
        if (req.method === 'POST' && pathParts[0] === 'results' && pathParts[1] === 'website') {
            const { 
                chapter_id, 
                correct_mcq, 
                incorrect_mcq, 
                unattempted_mcq = 0
            } = req.body;
            
            const totalQuestions = correct_mcq + incorrect_mcq + unattempted_mcq;
            const marks = calculateCATMarks({ correct_mcq, incorrect_mcq, unattempted_mcq });
            const today = new Date().toISOString().split('T')[0];
            const now = Date.now();
            
            // Get chapter info for section (with timeout protection)
            let section = null;
            if (chapter_id) {
                try {
                    const ch = await executeQuery(
                        'SELECT m.section FROM chapters c LEFT JOIN modules m ON c.module_id = m.id WHERE c.id = ? LIMIT 1',
                        [chapter_id]
                    );
                    section = ch && ch.length > 0 ? ch[0].section : null;
                } catch (err) {
                    console.error('Chapter lookup error:', err);
                    // Continue without section if lookup fails
                }
            }
            
            await executeQuery(
                `INSERT INTO test_results 
                 (user_id, test_date, chapter_id, section, total_questions, test_type,
                  correct_mcq, incorrect_mcq, correct_fitb, incorrect_fitb,
                  total_marks, max_marks, percentage, created_at) 
                 VALUES (?, ?, ?, ?, ?, 'website', ?, ?, 0, 0, ?, ?, ?, ?)`,
                [userId, today, chapter_id, section, totalQuestions,
                 correct_mcq, incorrect_mcq,
                 marks.total_marks, marks.max_marks, marks.percentage, now]
            );
            
            return res.status(200).json({ 
                message: 'Website test result recorded successfully',
                marks: marks
            });
        }
        
        // POST /api/tests/results/external
        if (req.method === 'POST' && pathParts[0] === 'results' && pathParts[1] === 'external') {
            const { 
                chapter_id, 
                section,
                correct_mcq, 
                incorrect_mcq, 
                correct_fitb = 0, 
                incorrect_fitb = 0,
                unattempted_mcq = 0,
                test_date,
                is_checked = false,
                notes = ''
            } = req.body;
            
            const totalQuestions = correct_mcq + incorrect_mcq + unattempted_mcq + correct_fitb + incorrect_fitb;
            const marks = calculateCATMarks({ correct_mcq, incorrect_mcq, correct_fitb, incorrect_fitb, unattempted_mcq });
            const today = test_date || new Date().toISOString().split('T')[0];
            const now = Date.now();
            
            await executeQuery(
                `INSERT INTO test_results 
                 (user_id, test_date, chapter_id, section, total_questions, test_type,
                  correct_mcq, incorrect_mcq, correct_fitb, incorrect_fitb,
                  total_marks, max_marks, percentage, is_checked, notes, created_at) 
                 VALUES (?, ?, ?, ?, ?, 'external', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, today, chapter_id, section, totalQuestions,
                 correct_mcq, incorrect_mcq, correct_fitb, incorrect_fitb,
                 marks.total_marks, marks.max_marks, marks.percentage, is_checked, notes, now]
            );
            
            return res.status(200).json({ 
                message: 'External test result recorded successfully',
                marks: marks
            });
        }
        
        return errorResponse(res, 404, 'Endpoint not found');
        
    } catch (error) {
        console.error('Tests API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}

export default requireAuth(handler);
