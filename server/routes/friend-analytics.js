const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get friend's analytics
router.get('/:friendId/analytics', async (req, res) => {
    try {
        const userId = req.user.id;
        const friendId = parseInt(req.params.friendId);
        
        // Verify they are friends first
        const [friendship] = await pool.query(
            `SELECT id FROM friendships 
             WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
            [Math.min(userId, friendId), Math.max(userId, friendId),
             Math.min(userId, friendId), Math.max(userId, friendId)]
        );
        
        if (friendship.length === 0) {
            return res.status(403).json({ error: 'Not friends with this user' });
        }
        
        // Get friend's basic info and streaks
        const [friendInfo] = await pool.query(
            'SELECT name, current_streak, longest_streak FROM users WHERE id = ?',
            [friendId]
        );
        
        if (friendInfo.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get overall stats
        const [overallStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_tests,
                AVG(percentage) as avg_score,
                MAX(percentage) as best_score
             FROM test_results
             WHERE user_id = ?`,
            [friendId]
        );
        
        // Get subject-wise performance
        const [subjectStats] = await pool.query(
            `SELECT 
                section,
                COUNT(*) as test_count,
                AVG(percentage) as avg_score
             FROM test_results
             WHERE user_id = ? AND section IS NOT NULL
             GROUP BY section`,
            [friendId]
        );
        
        // Get friend's rank among all friends (for this user's friend group)
        const [friendsList] = await pool.query(
            `SELECT 
                CASE 
                    WHEN f.user1_id = ? THEN f.user2_id 
                    ELSE f.user1_id 
                END as friend_id
             FROM friendships f
             WHERE f.user1_id = ? OR f.user2_id = ?`,
            [userId, userId, userId]
        );
        
        const allFriendIds = friendsList.map(f => f.friend_id);
        allFriendIds.push(userId); // Include self for ranking
        
        // Get rankings
        const [rankings] = await pool.query(
            `SELECT 
                u.id,
                AVG(t.percentage) as avg_score
             FROM users u
             LEFT JOIN test_results t ON u.id = t.user_id
             WHERE u.id IN (${allFriendIds.map(() => '?').join(',')})
             GROUP BY u.id
             ORDER BY avg_score DESC`,
            allFriendIds
        );
        
        const friendRank = rankings.findIndex(r => r.id === friendId) + 1;
        
        res.json({
            friend: {
                name: friendInfo[0].name,
                current_streak: friendInfo[0].current_streak,
                longest_streak: friendInfo[0].longest_streak
            },
            overall: {
                total_tests: overallStats[0].total_tests,
                avg_score: parseFloat(overallStats[0].avg_score || 0).toFixed(1),
                best_score: parseFloat(overallStats[0].best_score || 0).toFixed(1)
            },
            subjects: subjectStats.map(s => ({
                section: s.section,
                test_count: s.test_count,
                avg_score: parseFloat(s.avg_score).toFixed(1)
            })),
            rank: {
                position: friendRank,
                total_friends: rankings.length
            }
        });
    } catch (error) {
        console.error('Error fetching friend analytics:', error);
        res.status(500).json({ error: 'Failed to fetch friend analytics' });
    }
});

module.exports = router;
