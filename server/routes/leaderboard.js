const express = require('express');
const router = express.Router();
const { User, TestResult, Friendship } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// =================================
// PUBLIC LEADERBOARD (Opt-in)
// =================================
router.get('/public', async (req, res) => {
    try {
        const { section = null } = req.query;
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        
        const matchStage = { show_on_public_leaderboard: true };

        const testMatchStage = {};
        if (section) {
            testMatchStage["tests.section"] = section;
        }

        const leaderboard = await User.aggregate([
            { $match: matchStage },
            { $lookup: {
                from: 'testresults',
                localField: 'id',
                foreignField: 'user_id',
                as: 'tests'
            }},
            { $unwind: "$tests" },
            { $match: testMatchStage },
            { $group: {
                _id: "$id",
                name: { $first: "$name" },
                total_tests: { $sum: 1 },
                avg_score: { $avg: "$tests.percentage" }
            }},
            { $match: { total_tests: { $gte: 5 } } },
            { $sort: { avg_score: -1 } },
            { $limit: 100 }
        ]);

        const rankedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            name: user.name,
            total_tests: user.total_tests,
            avg_score: (user.avg_score || 0).toFixed(1),
            is_me: user._id === uIdNum
        }));
        
        res.json({ leaderboard: rankedLeaderboard });
    } catch (error) {
        console.error('Error fetching public leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

router.post('/public/toggle', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const { show } = req.body;
        
        await User.updateOne({ id: uIdNum }, { show_on_public_leaderboard: show });
        
        res.json({ success: true, show });
    } catch (error) {
        console.error('Error toggling leaderboard visibility:', error);
        res.status(500).json({ error: 'Failed to update visibility' });
    }
});

// =================================
// FRIENDS LEADERBOARD (Private with Streaks)
// =================================
router.get('/friends', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        const { section = null, sortBy = 'score' } = req.query;
        
        const friendships = await Friendship.find({ $or: [{ user1_id: uIdNum }, { user2_id: uIdNum }] }).lean();
        const friendIds = friendships.map(f => f.user1_id === uIdNum ? f.user2_id : f.user1_id);
        friendIds.push(uIdNum);

        const testMatchStage = {};
        if (section) {
            testMatchStage["tests.section"] = section;
        }

        const leaderboard = await User.aggregate([
            { $match: { id: { $in: friendIds } } },
            { $lookup: {
                from: 'testresults',
                localField: 'id',
                foreignField: 'user_id',
                as: 'tests'
            }},
            { $unwind: { path: "$tests", preserveNullAndEmptyArrays: true } },
            { $match: testMatchStage },
            { $group: {
                _id: "$id",
                name: { $first: "$name" },
                current_streak: { $first: "$current_streak" },
                longest_streak: { $first: "$longest_streak" },
                total_tests: { $sum: { $cond: [ { $ifNull: ["$tests._id", false] }, 1, 0 ] } },
                avg_score: { $avg: "$tests.percentage" }
            }}
        ]);

        if (sortBy === 'score') {
            leaderboard.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0));
        } else if (sortBy === 'tests') {
            leaderboard.sort((a, b) => (b.total_tests || 0) - (a.total_tests || 0));
        } else if (sortBy === 'streak') {
            leaderboard.sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));
        }

        const rankedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            id: user._id, // This is user.id from schema since we grouped by $id
            name: user.name,
            current_streak: user.current_streak || 0,
            longest_streak: user.longest_streak || 0,
            avg_score: (user.avg_score || 0).toFixed(1),
            total_tests: user.total_tests || 0,
            is_me: user._id === uIdNum
        }));
        
        res.json({ leaderboard: rankedLeaderboard });
    } catch (error) {
        console.error('Error fetching friends leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;
