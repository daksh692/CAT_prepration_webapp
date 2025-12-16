/**
 * User Settings Endpoint - Vercel Serverless Function
 * GET/PUT /api/dashboard/settings
 */

import { executeQuery } from '../../_lib/db.js';
import { handleCORS, errorResponse } from '../../_lib/security.js';
import { requireAuth } from '../../_lib/auth.js';

async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    const userId = req.user.id;
    const now = Date.now();
    
    // GET Settings
    if (req.method === 'GET') {
        try {
            const rows = await executeQuery('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
            
            if (rows.length === 0) {
                // Initialize default settings for this user
                const examDate = new Date();
                examDate.setMonth(examDate.getMonth() + 11); // 11 months from now
                const examDateStr = examDate.toISOString().split('T')[0];
                
                await executeQuery(
                    'INSERT INTO user_settings (user_id, daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, 120, examDateStr, true, JSON.stringify([]), now]
                );
                
                return res.status(200).json({
                    daily_goal_minutes: 120,
                    daily_goal_questions: 10,
                    exam_date: examDateStr
                });
            }
            
            // Add default questions goal if not in database
            const settings = {
                ...rows[0],
                daily_goal_questions: rows[0].daily_goal_questions || 10
            };
            
            return res.status(200).json(settings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            return errorResponse(res, 500, 'Failed to fetch settings');
        }
    }
    
    // PUT Settings
    else if (req.method === 'PUT') {
        try {
            const { daily_goal_minutes, daily_goal_questions, exam_date } = req.body;
            
            // First check if settings exist
            const existing = await executeQuery('SELECT id FROM user_settings WHERE user_id = ?', [userId]);
            
            if (existing.length === 0) {
                // Insert new
                await executeQuery(
                    'INSERT INTO user_settings (user_id, daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, daily_goal_minutes || 120, exam_date, true, JSON.stringify([]), now]
                );
            } else {
                // Update existing
                const updates = [];
                const values = [];
                
                if (daily_goal_minutes !== undefined) {
                    updates.push('daily_goal_minutes = ?');
                    values.push(daily_goal_minutes);
                }
                if (exam_date !== undefined) {
                    updates.push('exam_date = ?');
                    values.push(exam_date);
                }
                // Add update for daily_goal_questions if column exists (assuming yes based on usage)
                if (daily_goal_questions !== undefined) {
                    // Check if column exists or just assume for now? 
                    // Based on express code, it wasn't being updated explicitely in query but was in body.
                    // The express code only updated daily_goal_minutes and exam_date.
                    // I will stick to express implementation.
                }
                
                updates.push('updated_at = ?');
                values.push(now);
                values.push(existing[0].id);
                values.push(userId);
                
                await executeQuery(
                    `UPDATE user_settings SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
                    values
                );
            }
            
            return res.status(200).json({ message: 'Settings updated successfully' });
        } catch (error) {
            console.error('Error updating settings:', error);
            return errorResponse(res, 500, 'Failed to update settings');
        }
    }
    
    // Unsupported Method
    else {
        return errorResponse(res, 405, 'Method not allowed');
    }
}

export default requireAuth(handler);
