const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all analytics routes
router.use(authenticateToken);

// =================================
// ACHIEVEMENT DEFINITIONS
// =================================
const ACHIEVEMENTS = {
    first_test: {
        id: 'first_test',
        name: 'First Step',
        description: 'Complete your first test',
        icon: '🎯',
        category: 'milestone'
    },
    week_streak: {
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        category: 'streak'
    },
    month_streak: {
        id: 'month_streak',
        name: 'Month Master',
        description: 'Maintain a 30-day study streak',
        icon: '🔥',
        category: 'streak'
    },
    tests_10: {
        id: 'tests_10',
        name: 'Beginner',
        description: 'Complete 10 tests',
        icon: '📝',
        category: 'milestone'
    },
    tests_50: {
        id: 'tests_50',
        name: 'Intermediate',
        description: 'Complete 50 tests',
        icon: '📝',
        category: 'milestone'
    },
    tests_100: {
        id: 'tests_100',
        name: 'Expert',
        description: 'Complete 100 tests',
        icon: '📝',
        category: 'milestone'
    },
    score_80: {
        id: 'score_80',
        name: 'Good Score',
        description: 'Achieve 80%+ on a test',
        icon: '⭐',
        category: 'achievement'
    },
    score_90: {
        id: 'score_90',
        name: 'Excellent Score',
        description: 'Achieve 90%+ on a test',
        icon: '⭐',
        category: 'achievement'
    },
    questions_100: {
        id: 'questions_100',
        name: 'Century',
        description: 'Solve 100 questions',
        icon: '📚',
        category: 'milestone'
    },
    questions_500: {
        id: 'questions_500',
        name: 'Half Thousand',
        description: 'Solve 500 questions',
        icon: '📚',
        category: 'milestone'
    },
    questions_1000: {
        id: 'questions_1000',
        name: 'Thousand Club',
        description: 'Solve 1000 questions',
        icon: '📚',
        category: 'milestone'
    }
};

// =================================
// PERFORMANCE TRENDS
// =================================
router.get('/trends', async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 30;
        
        const startDate = new Date();
        startDate.setDate(startDate.setDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const [data] = await pool.query(
            `SELECT 
                test_date,
                test_type,
                AVG(percentage) as avg_percentage,
                COUNT(*) as test_count,
                SUM(total_questions) as total_questions
             FROM test_results
             WHERE user_id = ? AND test_date >= ?
             GROUP BY test_date, test_type
             ORDER BY test_date ASC`,
            [userId, startDateStr]
        );
        
        res.json({ trends: data });
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ error: 'Failed to fetch performance trends' });
    }
});

// =================================
// SUBJECT-WISE PERFORMANCE
// =================================
router.get('/subjects', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [data] = await pool.query(
            `SELECT 
                section,
                COUNT(*) as test_count,
                AVG(percentage) as avg_percentage,
                SUM(total_questions) as total_questions,
                SUM(total_marks) as total_marks
             FROM test_results
             WHERE user_id = ? AND section IS NOT NULL
             GROUP BY section`,
            [userId]
        );
        
        res.json({ subjects: data });
    } catch (error) {
        console.error('Error fetching subject data:', error);
        res.status(500).json({ error: 'Failed to fetch subject performance' });
    }
});

// =================================
// WEAK AREA ANALYSIS
// =================================
router.get('/weak-areas', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get overall average
        const [overallData] = await pool.query(
            `SELECT AVG(percentage) as overall_avg
             FROM test_results
             WHERE user_id = ?`,
            [userId]
        );
        
        const overallAvg = overallData[0].overall_avg || 0;
        
        // Get subject-wise performance
        const [subjectData] = await pool.query(
            `SELECT 
                section,
                AVG(percentage) as avg_percentage,
                COUNT(*) as test_count
             FROM test_results
             WHERE user_id = ? AND section IS NOT NULL
             GROUP BY section`,
            [userId]
        );
        
        // Identify weak areas (below overall average)
        const weakAreas = subjectData
            .filter(s => s.avg_percentage < overallAvg)
            .map(s => ({
                section: s.section,
                avg_percentage: s.avg_percentage,
                gap: overallAvg - s.avg_percentage,
                test_count: s.test_count,
                recommendation: generateRecommendation(s.section, s.avg_percentage, overallAvg)
            }));
        
        // Identify strong areas
        const strongAreas = subjectData
            .filter(s => s.avg_percentage >= overallAvg)
            .map(s => ({
                section: s.section,
                avg_percentage: s.avg_percentage,
                test_count: s.test_count
            }));
        
        res.json({
            overall_average: overallAvg,
            weak_areas: weakAreas,
            strong_areas: strongAreas
        });
    } catch (error) {
        console.error('Error analyzing weak areas:', error);
        res.status(500).json({ error: 'Failed to analyze weak areas' });
    }
});

function generateRecommendation(section, score, overallAvg) {
    const gap = overallAvg - score;
    const sectionNames = {
        'VARC': 'Verbal Ability & Reading Comprehension',
        'DILR': 'Data Interpretation & Logical Reasoning',
        'QA': 'Quantitative Aptitude'
    };
    
    if (gap > 15) {
        return `Focus heavily on ${sectionNames[section]}. Your score is ${gap.toFixed(1)}% below your average. Schedule daily practice sessions.`;
    } else if (gap > 5) {
        return `Improve ${sectionNames[section]}. Consider taking more practice tests in this section.`;
    } else {
        return `Minor improvement needed in ${sectionNames[section]}. Keep practicing!`;
    }
}

// =================================
// ACHIEVEMENTS
// =================================
router.get('/achievements', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get unlocked achievements
        const [unlocked] = await pool.query(
            `SELECT achievement_id, unlocked_at
             FROM user_achievements
             WHERE user_id = ?
             ORDER BY unlocked_at DESC`,
            [userId]
        );
        
        // Get user stats for progress calculation
        const stats = await getUserStats(userId);
        
        // Build achievement status
        const achievements = Object.values(ACHIEVEMENTS).map(achievement => {
            const unlockedData = unlocked.find(u => u.achievement_id === achievement.id);
            const progress = calculateProgress(achievement.id, stats);
            
            return {
                ...achievement,
                unlocked: !!unlockedData,
                unlocked_at: unlockedData?.unlocked_at || null,
                progress: progress.current,
                target: progress.target,
                percentage: progress.target > 0 ? (progress.current / progress.target) * 100 : 0
            };
        });
        
        res.json({ achievements });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// =================================
// CHECK & AWARD ACHIEVEMENTS
// =================================
router.post('/check-achievements', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const stats = await getUserStats(userId);
        const newAchievements = [];
        
        // Check each achievement
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            // Check if already unlocked
            const [existing] = await pool.query(
                'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
                [userId, achievement.id]
            );
            
            if (existing.length > 0) continue;
            
            // Check if criteria met
            if (checkAchievementCriteria(achievement.id, stats)) {
                const now = Date.now();
                await pool.query(
                    'INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, created_at) VALUES (?, ?, ?, ?)',
                    [userId, achievement.id, now, now]
                );
                
                newAchievements.push(achievement);
            }
        }
        
        res.json({ new_achievements: newAchievements });
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({ error: 'Failed to check achievements' });
    }
});

// =================================
// HELPER FUNCTIONS
// =================================
async function getUserStats(userId) {
    const [testStats] = await pool.query(
        `SELECT 
            COUNT(*) as total_tests,
            SUM(total_questions) as total_questions,
            MAX(percentage) as max_percentage
         FROM test_results
         WHERE user_id = ?`,
        [userId]
    );
    
    const [streakData] = await pool.query(
        `SELECT current_streak, longest_streak
         FROM streaks
         WHERE user_id = ?`,
        [userId]
    );
    
    return {
        total_tests: testStats[0].total_tests || 0,
        total_questions: testStats[0].total_questions || 0,
        max_percentage: testStats[0].max_percentage || 0,
        current_streak: streakData[0]?.current_streak || 0,
        longest_streak: streakData[0]?.longest_streak || 0
    };
}

function checkAchievementCriteria(achievementId, stats) {
    switch (achievementId) {
        case 'first_test':
            return stats.total_tests >= 1;
        case 'week_streak':
            return stats.current_streak >= 7;
        case 'month_streak':
            return stats.current_streak >= 30;
        case 'tests_10':
            return stats.total_tests >= 10;
        case 'tests_50':
            return stats.total_tests >= 50;
        case 'tests_100':
            return stats.total_tests >= 100;
        case 'score_80':
            return stats.max_percentage >= 80;
        case 'score_90':
            return stats.max_percentage >= 90;
        case 'questions_100':
            return stats.total_questions >= 100;
        case 'questions_500':
            return stats.total_questions >= 500;
        case 'questions_1000':
            return stats.total_questions >= 1000;
        default:
            return false;
    }
}

function calculateProgress(achievementId, stats) {
    const progress = { current: 0, target: 0 };
    
    switch (achievementId) {
        case 'first_test':
            progress.current = Math.min(stats.total_tests, 1);
            progress.target = 1;
            break;
        case 'week_streak':
            progress.current = Math.min(stats.current_streak, 7);
            progress.target = 7;
            break;
        case 'month_streak':
            progress.current = Math.min(stats.current_streak, 30);
            progress.target = 30;
            break;
        case 'tests_10':
            progress.current = Math.min(stats.total_tests, 10);
            progress.target = 10;
            break;
        case 'tests_50':
            progress.current = Math.min(stats.total_tests, 50);
            progress.target = 50;
            break;
        case 'tests_100':
            progress.current = Math.min(stats.total_tests, 100);
            progress.target = 100;
            break;
        case 'score_80':
            progress.current = Math.min(stats.max_percentage, 80);
            progress.target = 80;
            break;
        case 'score_90':
            progress.current = Math.min(stats.max_percentage, 90);
            progress.target = 90;
            break;
        case 'questions_100':
            progress.current = Math.min(stats.total_questions, 100);
            progress.target = 100;
            break;
        case 'questions_500':
            progress.current = Math.min(stats.total_questions, 500);
            progress.target = 500;
            break;
        case 'questions_1000':
            progress.current = Math.min(stats.total_questions, 1000);
            progress.target = 1000;
            break;
    }
    
    return progress;
}

// =================================
// STUDY HEATMAP (Phase 2A)
// =================================
router.get('/heatmap', async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 365; // Default to 1 year
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Get study sessions by date
        const [sessionData] = await pool.query(
            `SELECT 
                DATE(FROM_UNIXTIME(start_time/1000)) as date,
                SUM(duration) as total_minutes,
                COUNT(*) as session_count
             FROM study_sessions
             WHERE user_id = ? AND DATE(FROM_UNIXTIME(start_time/1000)) >= ?
             GROUP BY DATE(FROM_UNIXTIME(start_time/1000))
             ORDER BY date ASC`,
            [userId, startDateStr]
        );
        
        // Get test activity by date
        const [testData] = await pool.query(
            `SELECT 
                test_date as date,
                COUNT(*) as test_count,
                SUM(total_questions) as questions
             FROM test_results
             WHERE user_id = ? AND test_date >= ?
             GROUP BY test_date
             ORDER BY test_date ASC`,
            [userId, startDateStr]
        );
        
        // Combine data
        const activityMap = {};
        
        sessionData.forEach(s => {
            activityMap[s.date] = {
                date: s.date,
                study_minutes: s.total_minutes || 0,
                session_count: s.session_count || 0,
                test_count: 0,
                questions: 0
            };
        });
        
        testData.forEach(t => {
            if (activityMap[t.date]) {
                activityMap[t.date].test_count = t.test_count || 0;
                activityMap[t.date].questions = t.questions || 0;
            } else {
                activityMap[t.date] = {
                    date: t.date,
                    study_minutes: 0,
                    session_count: 0,
                    test_count: t.test_count || 0,
                    questions: t.questions || 0
                };
            }
        });
        
        // Calculate activity level (0-4 for color intensity)
        const activity = Object.values(activityMap).map(day => {
            const score = (day.study_minutes * 0.5) + (day.questions * 2);
            let level = 0;
            if (score > 0) level = 1;
            if (score > 30) level = 2;
            if (score > 60) level = 3;
            if (score > 120) level = 4;
            
            return { ...day, level };
        });
        
        res.json({ activity });
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
});

// =================================
// TOPIC-WISE ANALYTICS (Phase 2A)
// =================================
router.get('/topics', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get chapter-level performance
        const [chapterData] = await pool.query(
            `SELECT 
                c.id as chapter_id,
                c.name as chapter_name,
                m.id as module_id,
                m.name as module_name,
                m.section,
                COUNT(t.id) as test_count,
                SUM(t.total_questions) as total_questions,
                AVG(t.percentage) as avg_percentage,
                SUM(CASE WHEN t.test_type = 'website' THEN 1 ELSE 0 END) as website_tests,
                SUM(CASE WHEN t.test_type = 'external' THEN 1 ELSE 0 END) as external_tests
             FROM test_results t
             JOIN chapters c ON t.chapter_id = c.id
             JOIN modules m ON c.module_id = m.id
             WHERE t.user_id = ? AND t.chapter_id IS NOT NULL
             GROUP BY c.id, c.name, m.id, m.name, m.section
             ORDER BY m.section, m.name, c.name`,
            [userId]
        );
        
        // Group by module
        const moduleMap = {};
        chapterData.forEach(chapter => {
            const moduleKey = chapter.module_id;
            if (!moduleMap[moduleKey]) {
                moduleMap[moduleKey] = {
                    module_id: chapter.module_id,
                    module_name: chapter.module_name,
                    section: chapter.section,
                    chapters: [],
                    total_tests: 0,
                    avg_percentage: 0
                };
            }
            
            moduleMap[moduleKey].chapters.push({
                chapter_id: chapter.chapter_id,
                chapter_name: chapter.chapter_name,
                test_count: chapter.test_count,
                total_questions: chapter.total_questions,
                avg_percentage: parseFloat(chapter.avg_percentage),
                website_tests: chapter.website_tests,
                external_tests: chapter.external_tests
            });
            
            moduleMap[moduleKey].total_tests += chapter.test_count;
        });
        
        // Calculate module averages and find weak chapters
        Object.values(moduleMap).forEach(module => {
            const totalPercentage = module.chapters.reduce((sum, ch) => sum + ch.avg_percentage, 0);
            module.avg_percentage = totalPercentage / module.chapters.length;
            
            // Sort chapters by performance (weakest first)
            module.chapters.sort((a, b) => a.avg_percentage - b.avg_percentage);
        });
        
        const modules = Object.values(moduleMap);
        
        // Overall stats
        const overallAvg = chapterData.length > 0
            ? chapterData.reduce((sum, ch) => sum + parseFloat(ch.avg_percentage), 0) / chapterData.length
            : 0;
        
        // Find weakest chapters (below average)
        const weakChapters = chapterData
            .filter(ch => parseFloat(ch.avg_percentage) < overallAvg)
            .sort((a, b) => parseFloat(a.avg_percentage) - parseFloat(b.avg_percentage))
            .slice(0, 5) // Top 5 weakest
            .map(ch => ({
                chapter_name: ch.chapter_name,
                module_name: ch.module_name,
                section: ch.section,
                avg_percentage: parseFloat(ch.avg_percentage),
                test_count: ch.test_count
            }));
        
        res.json({
            modules,
            overall_average: overallAvg,
            weak_chapters: weakChapters
        });
    } catch (error) {
        console.error('Error fetching topic analytics:', error);
        res.status(500).json({ error: 'Failed to fetch topic analytics' });
    }
});

// =================================
// CAT SCORE PREDICTOR (Phase 2A)
// =================================
router.get('/cat-predictor', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get recent test performance (last 30 days, weighted more)
        const [recentTests] = await pool.query(
            `SELECT percentage, section, test_date
             FROM test_results
             WHERE user_id = ? AND test_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
             ORDER BY test_date DESC`,
            [userId]
        );
        
        // Get overall performance
        const [overallStats] = await pool.query(
            `SELECT 
                AVG(percentage) as overall_avg,
                COUNT(*) as total_tests,
                AVG(CASE WHEN section = 'VARC' THEN percentage END) as varc_avg,
                AVG(CASE WHEN section = 'DILR' THEN percentage END) as dilr_avg,
                AVG(CASE WHEN section = 'QA' THEN percentage END) as qa_avg
             FROM test_results
             WHERE user_id = ?`,
            [userId]
        );
        
        if (recentTests.length === 0) {
            return res.json({
                predicted_percentile: null,
                confidence: 'low',
                message: 'Not enough data. Take more tests to see predictions!'
            });
        }
        
        // Calculate weighted average (recent tests weight = 2, older = 1)
        const recentAvg = recentTests.reduce((sum, t) => sum + parseFloat(t.percentage), 0) / recentTests.length;
        const overallAvg = parseFloat(overallStats[0].overall_avg) || 0;
        const weightedScore = (recentAvg * 0.7) + (overallAvg * 0.3);
        
        // Simple percentile estimation (this is a rough approximation)
        // Real CAT percentile calculation is much more complex
        let predictedPercentile = 0;
        if (weightedScore >= 95) predictedPercentile = 99;
        else if (weightedScore >= 90) predictedPercentile = 95 + ((weightedScore - 90) / 5) * 4;
        else if (weightedScore >= 80) predictedPercentile = 85 + ((weightedScore - 80) / 10) * 10;
        else if (weightedScore >= 70) predictedPercentile = 70 + ((weightedScore - 70) / 10) * 15;
        else if (weightedScore >= 60) predictedPercentile = 55 + ((weightedScore - 60) / 10) * 15;
        else predictedPercentile = (weightedScore / 60) * 55;
        
        // Confidence level based on test count
        let confidence = 'low';
        if (overallStats[0].total_tests >= 50) confidence = 'high';
        else if (overallStats[0].total_tests >= 20) confidence = 'medium';
        
        res.json({
            predicted_percentile: Math.round(predictedPercentile * 10) / 10,
            confidence,
            recent_avg: Math.round(recentAvg * 10) / 10,
            overall_avg: Math.round(overallAvg * 10) / 10,
            total_tests: overallStats[0].total_tests,
            section_scores: {
                varc: Math.round((overallStats[0].varc_avg || 0) * 10) / 10,
                dilr: Math.round((overallStats[0].dilr_avg || 0) * 10) / 10,
                qa: Math.round((overallStats[0].qa_avg || 0) * 10) / 10
            }
        });
    } catch (error) {
        console.error('Error calculating CAT prediction:', error);
        res.status(500).json({ error: 'Failed to calculate prediction' });
    }
});

module.exports = router;
