const express = require('express');
const router = express.Router();
const { Streak, StudySession, UserSetting } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// =================================
// STREAK ENDPOINTS
// =================================

// Get current streak for logged-in user
router.get('/streak', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        let streak = await Streak.findOne({ user_id: uIdNum }).lean();
        
        if (!streak) {
            // Initialize streak
            const now = Date.now();
            streak = await Streak.create({
                user_id: uIdNum,
                current_streak: 0,
                longest_streak: 0,
                updated_at: now
            });
            return res.json({ current_streak: 0, longest_streak: 0, last_study_date: null });
        }
        
        res.json(streak);
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({ error: 'Failed to fetch streak data' });
    }
});

// Update streak
router.post('/streak/update', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const today = new Date().toISOString().split('T')[0];
        let streak = await Streak.findOne({ user_id: uIdNum });
        
        if (!streak) {
            const now = Date.now();
            streak = await Streak.create({
                user_id: uIdNum,
                current_streak: 1,
                longest_streak: 1,
                last_study_date: today,
                updated_at: now
            });
            return res.json({ current_streak: 1, longest_streak: 1, message: 'Streak started!' });
        }
        
        const lastStudyDate = streak.last_study_date ? new Date(streak.last_study_date).toISOString().split('T')[0] : null;
        
        if (lastStudyDate === today) {
            return res.json({ 
                current_streak: streak.current_streak, 
                longest_streak: streak.longest_streak,
                message: 'Already counted for today'
            });
        }
       
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newCurrentStreak;
        if (lastStudyDate === yesterdayStr) {
            newCurrentStreak = streak.current_streak + 1;
        } else {
            newCurrentStreak = 1;
        }
        
        streak.current_streak = newCurrentStreak;
        streak.longest_streak = Math.max(newCurrentStreak, streak.longest_streak);
        streak.last_study_date = today;
        streak.updated_at = Date.now();
        await streak.save();
        
        res.json({ 
            current_streak: streak.current_streak, 
            longest_streak: streak.longest_streak,
            message: newCurrentStreak > streak.current_streak ? 'Streak increased!' : 'Streak restarted'
        });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

// =================================
// STUDY SESSION ENDPOINTS
// =================================

// Get today's study stats
router.get('/today', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const todayStr = new Date().toISOString().split('T')[0];
        const todayStart = new Date(todayStr);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const sessions = await StudySession.find({
            user_id: uIdNum,
            date: { $gte: todayStart, $lt: todayEnd }
        }).lean();
        
        const total_minutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const total_questions = sessions.reduce((acc, s) => acc + (s.questions_completed || 0), 0);
        
        res.json({ total_minutes, total_questions });
    } catch (error) {
        console.error('Error fetching today stats:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s stats' });
    }
});

// Record study session
router.post('/session', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const { chapter_id, duration, questions_completed } = req.body;
        const now = Date.now();
        const chId = isNaN(Number(chapter_id)) ? null : Number(chapter_id);
        
        await StudySession.create({
            user_id: uIdNum,
            date: new Date(),
            chapter_id: chId,
            duration: duration || 0,
            questions_completed: questions_completed || 0,
            created_at: now
        });
        
        // Auto-update streak by calling our own api equivalent internally
        // (Avoiding fetch to self)
        const today = new Date().toISOString().split('T')[0];
        let streak = await Streak.findOne({ user_id: uIdNum });
        if (!streak) {
            streak = await Streak.create({
                user_id: uIdNum, current_streak: 1, longest_streak: 1, last_study_date: today, updated_at: now
            });
        } else {
            const lastStudyDate = streak.last_study_date ? new Date(streak.last_study_date).toISOString().split('T')[0] : null;
            if (lastStudyDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (lastStudyDate === yesterdayStr) streak.current_streak += 1;
                else streak.current_streak = 1;

                streak.longest_streak = Math.max(streak.current_streak, streak.longest_streak);
                streak.last_study_date = today;
                streak.updated_at = now;
                await streak.save();
            }
        }
        
        res.json({ 
            message: 'Study session recorded',
            streak: streak
        });
    } catch (error) {
        console.error('Error recording study session:', error);
        res.status(500).json({ error: 'Failed to record study session' });
    }
});

// =================================
// USER SETTINGS / GOALS
// =================================

// Get user settings
router.get('/settings', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        let settings = await UserSetting.findOne({ user_id: uIdNum }).lean();
        
        if (!settings) {
            const now = Date.now();
            const examDate = new Date();
            examDate.setMonth(examDate.getMonth() + 11);
            
            settings = await UserSetting.create({
                user_id: uIdNum,
                daily_goal_minutes: 120,
                exam_date: examDate,
                auto_assign_penalties: true,
                custom_penalties: [],
                updated_at: now
            });
        }
        
        settings.daily_goal_questions = settings.daily_goal_questions || 10;
        if (settings.exam_date) {
            settings.exam_date = new Date(settings.exam_date).toISOString().split('T')[0];
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update user settings
router.put('/settings', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const { daily_goal_minutes, daily_goal_questions, exam_date } = req.body;
        const now = Date.now();
        
        let settings = await UserSetting.findOne({ user_id: uIdNum });
        if (!settings) {
            await UserSetting.create({
                user_id: uIdNum,
                daily_goal_minutes: daily_goal_minutes || 120,
                exam_date: exam_date ? new Date(exam_date) : new Date(),
                auto_assign_penalties: true,
                custom_penalties: [],
                updated_at: now
            });
        } else {
            if (daily_goal_minutes !== undefined) settings.daily_goal_minutes = daily_goal_minutes;
            if (exam_date !== undefined) settings.exam_date = new Date(exam_date);
            settings.updated_at = now;
            await settings.save();
        }
        
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
