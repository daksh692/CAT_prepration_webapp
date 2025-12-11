const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// =================================
// PUBLIC LEADERBOARD (Opt-in)
// =================================

// Get public leaderboard (overall)
router.get('/public', async (req, res) => {
    try {
        const { section = null } = req.query;
        const userId = req.user.id;
        
        let query = `
            SELECT 
                u.id,
                u.name,
                AVG(t.percentage) as avg_score,
                COUNT(t.id) as total_tests,
                u.id = ? as is_me
            FROM users u
            INNER JOIN test_results t ON u.id = t.user_id
            WHERE u.show_on_public_leaderboard = TRUE
        `;
        
        const params = [userId];
        
        if (section) {
            query += ' AND t.section = ?';
            params.push(section);
        }
        
        query += `
            GROUP BY u.id, u.name
            HAVING total_tests >= 5
            ORDER BY avg_score DESC
            LIMIT 100
        `;
        
        const [leaderboard] = await pool.query(query, params);
        
        // Add ranks
        const rankedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            ...user,
            avg_score: parseFloat(user.avg_score).toFixed(1)
        }));
        
        res.json({ leaderboard: rankedLeaderboard });
    } catch (error) {
        console.error('Error fetching public leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Toggle public leaderboard visibility
router.post('/public/toggle', async (req, res) => {
    try {
        const userId = req.user.id;
        const { show } = req.body;
        
        await pool.query(
            'UPDATE users SET show_on_public_leaderboard = ? WHERE id = ?',
            [show, userId]
        );
        
        res.json({ success: true, show });
    } catch (error) {
        console.error('Error toggling leaderboard visibility:', error);
        res.status(500).json({ error: 'Failed to update visibility' });
    }
});

// =================================
// FRIENDS LEADERBOARD (Private with Streaks)
// =================================

// Get friends leaderboard
router.get('/friends', async (req, res) => {
    try {
        const userId = req.user.id;
        const { section = null, sortBy = 'score' } = req.query;
        
        // Get friend IDs
        const [friendships] = await pool.query(
            `SELECT 
                CASE 
                    WHEN user1_id = ? THEN user2_id 
                    ELSE user1_id 
                END as friend_id
             FROM friendships
             WHERE user1_id = ? OR user2_id = ?`,
            [userId, userId, userId]
        );
        
        const friendIds = friendships.map(f => f.friend_id);
        friendIds.push(userId); // Include self
        
        if (friendIds.length === 1) {
            // No friends yet, just return user
            const [userData] = await pool.query(
                `SELECT 
                    u.id,
                    u.name,
                    u.current_streak,
                    u.longest_streak,
                    AVG(t.percentage) as avg_score,
                    COUNT(t.id) as total_tests
                 FROM users u
                 LEFT JOIN test_results t ON u.id = t.user_id ${section ? 'AND t.section = ?' : ''}
                 WHERE u.id = ?
                 GROUP BY u.id, u.name, u.current_streak, u.longest_streak`,
                section ? [section, userId] : [userId]
            );
            
            return res.json({
                leaderboard: [{
                    rank: 1,
                    ...userData[0],
                    avg_score: parseFloat(userData[0].avg_score || 0).toFixed(1),
                    is_me: true
                }]
            });
        }
        
        // Query for friends + self
        let query = `
            SELECT 
                u.id,
                u.name,
                u.current_streak,
                u.longest_streak,
                AVG(t.percentage) as avg_score,
                COUNT(t.id) as total_tests,
                u.id = ? as is_me
            FROM users u
            LEFT JOIN test_results t ON u.id = t.user_id
        `;
        
        const params = [userId];
        
        if (section) {
            query += ' AND t.section = ?';
            params.push(section);
        }
        
        query += `
            WHERE u.id IN (${friendIds.map(() => '?').join(',')})
            GROUP BY u.id, u.name, u.current_streak, u.longest_streak
        `;
        
        params.push(...friendIds);
        
        // Sort
        if (sortBy === 'score') {
            query += ' ORDER BY avg_score DESC';
        } else if (sortBy === 'tests') {
            query += ' ORDER BY total_tests DESC';
        } else if (sortBy === 'streak') {
            query += ' ORDER BY current_streak DESC';
        }
        
        const [leaderboard] = await pool.query(query, params);
        
        // Add ranks
        const rankedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            ...user,
            avg_score: parseFloat(user.avg_score || 0).toFixed(1)
        }));
        
        res.json({ leaderboard: rankedLeaderboard });
    } catch (error) {
        console.error('Error fetching friends leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;
