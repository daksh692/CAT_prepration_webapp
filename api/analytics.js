import { executeQuery } from './_lib/db.js';
import { handleCORS, errorResponse } from './_lib/security.js';
import { requireAuth } from './_lib/auth.js';

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
        
        const endpoint = pathParts[0] || '';
        
        //  /api/analytics/trends
        if (endpoint === 'trends') {
            const days = parseInt(req.query.days) || 30;
            // Return empty data for now - frontend won't crash
            return res.status(200).json({
                daily_data: [],
                summary: {
                    tests_taken: 0,
                    avg_percentage: 0,
                    total_questions: 0
                }
            });
        }
        
        // /api/analytics/subjects
        if (endpoint === 'subjects') {
            return res.status(200).json([]);
        }
        
        // /api/analytics/weak-areas
        if (endpoint === 'weak-areas') {
            return res.status(200).json({
                overall_average: 0,
                weak_areas: [],
                strong_areas: []
            });
        }
        
        // /api/analytics/achievements
        if (endpoint === 'achievements') {
            return res.status(200).json({
                achievements: []
            });
        }
        
        // /api/analytics/heatmap
        if (endpoint === 'heatmap') {
            const days = parseInt(req.query.days) || 30;
            return res.status(200).json({
                heatmap_data: [],
                total_sessions: 0,
                longest_streak: 0
            });
        }
        
        // /api/analytics/topics
        if (endpoint === 'topics') {
            return res.status(200).json([]);
        }
        
        // /api/analytics/cat-predictor
        if (endpoint === 'cat-predictor') {
            return res.status(200).json({
                predicted_score: 0,
                predicted_percentile: 0,
                confidence: 'low',
                recommendation: 'Complete more tests to get accurate predictions'
            });
        }
        
        return errorResponse(res, 404, 'Endpoint not found');
        
    } catch (error) {
        console.error('Analytics API error:', error);
        return errorResponse(res, 500, error.message || 'Server error');
    }
}

export default requireAuth(handler);
