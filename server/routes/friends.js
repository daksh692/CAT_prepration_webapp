const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Helper function to generate unique friend code
function generateFriendCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// =================================
// FRIEND CODE MANAGEMENT
// =================================

// Get my friend code
router.get('/my-code', async (req, res) => {
    try {
        const userId = req.user.id;
        const [user] = await pool.query(
            'SELECT friend_code FROM users WHERE id = ?',
            [userId]
        );
        
        res.json({ code: user[0].friend_code });
    } catch (error) {
        console.error('Error fetching friend code:', error);
        res.status(500).json({ error: 'Failed to fetch friend code' });
    }
});

// =================================
// FRIEND REQUESTS
// =================================

// Send friend request
router.post('/request', async (req, res) => {
    try {
        const senderId = req.user.id;
        const { friendCode } = req.body;
        
        if (!friendCode || friendCode.length !== 12) {
            return res.status(400).json({ error: 'Invalid friend code' });
        }
        
        // Find user with this code
        const [receiver] = await pool.query(
            'SELECT id FROM users WHERE friend_code = ?',
            [friendCode]
        );
        
        if (receiver.length === 0) {
            return res.status(404).json({ error: 'User not found with this code' });
        }
        
        const receiverId = receiver[0].id;
        
        // Can't add yourself
        if (senderId === receiverId) {
            return res.status(400).json({ error: 'Cannot add yourself as a friend' });
        }
        
        // Note: We don't check for existing friendship here because:
        // 1. If they're friends, the earlier friendship check would prevent duplicate requests
        // 2. If friendship was removed, they should be able to re-add
        // 3. The unique constraint on friend_requests table prevents duplicate requests
        
        // Check for existing request
        const [existingRequest] = await pool.query(
            `SELECT id, status FROM friend_requests 
             WHERE sender_id = ? AND receiver_id = ?`,
            [senderId, receiverId]
        );
        
        if (existingRequest.length > 0) {
            if (existingRequest[0].status === 'pending') {
                return res.status(400).json({ error: 'Request already sent' });
            } else if (existingRequest[0].status === 'rejected') {
                // Allow re-request after rejection - update existing request
                await pool.query(
                    `UPDATE friend_requests 
                     SET status = 'pending', created_at = ?, updated_at = NULL 
                     WHERE id = ?`,
                    [Date.now(), existingRequest[0].id]
                );
                return res.json({ success: true, message: 'Friend request sent!' });
            } else if (existingRequest[0].status === 'accepted') {
                // Check if friendship actually exists (might have been removed)
                const [friendship] = await pool.query(
                    `SELECT id FROM friendships 
                     WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
                    [Math.min(senderId, receiverId), Math.max(senderId, receiverId),
                     Math.min(senderId, receiverId), Math.max(senderId, receiverId)]
                );
                
                if (friendship.length > 0) {
                    return res.status(400).json({ error: 'You are already friends!' });
                } else {
                    // Friendship was removed, allow re-request - update existing request
                    await pool.query(
                        `UPDATE friend_requests 
                         SET status = 'pending', created_at = ?, updated_at = NULL 
                         WHERE id = ?`,
                        [Date.now(), existingRequest[0].id]
                    );
                    return res.json({ success: true, message: 'Friend request sent!' });
                }
            }
        }
        
        // Create new request (no existing request found)
        await pool.query(
            `INSERT INTO friend_requests (sender_id, receiver_id, status, created_at) 
             VALUES (?, ?, 'pending', ?)`,
            [senderId, receiverId, Date.now()]
        );
        
        res.json({ success: true, message: 'Friend request sent!' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// Get pending requests (received)
router.get('/requests/pending', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [requests] = await pool.query(
            `SELECT 
                fr.id,
                fr.created_at,
                u.id as sender_id,
                u.name as sender_name,
                u.friend_code as sender_code
             FROM friend_requests fr
             JOIN users u ON fr.sender_id = u.id
             WHERE fr.receiver_id = ? AND fr.status = 'pending'
             ORDER BY fr.created_at DESC`,
            [userId]
        );
        
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Accept friend request
router.post('/requests/:id/accept', async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = req.params.id;
        
        // Get request details
        const [request] = await pool.query(
            'SELECT sender_id, receiver_id FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = "pending"',
            [requestId, userId]
        );
        
        if (request.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        const senderId = request[0].sender_id;
        const receiverId = request[0].receiver_id;
        
        // Create friendship
        await pool.query(
            'INSERT INTO friendships (user1_id, user2_id, created_at) VALUES (?, ?, ?)',
            [Math.min(senderId, receiverId), Math.max(senderId, receiverId), Date.now()]
        );
        
        // Update request status
        await pool.query(
            'UPDATE friend_requests SET status = "accepted", updated_at = ? WHERE id = ?',
            [Date.now(), requestId]
        );
        
        res.json({ success: true, message: 'Friend request accepted!' });
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ error: 'Failed to accept request' });
    }
});

// Reject friend request
router.post('/requests/:id/reject', async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = req.params.id;
        
        const [result] = await pool.query(
            'UPDATE friend_requests SET status = "rejected", updated_at = ? WHERE id = ? AND receiver_id = ? AND status = "pending"',
            [Date.now(), requestId, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        res.json({ success: true, message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// =================================
// FRIENDS LIST
// =================================

// Get my friends
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [friends] = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.friend_code,
                u.current_streak,
                u.longest_streak,
                AVG(t.percentage) as avg_score,
                COUNT(t.id) as total_tests
             FROM friendships f
             JOIN users u ON (
                (f.user1_id = ? AND u.id = f.user2_id) OR
                (f.user2_id = ? AND u.id = f.user1_id)
             )
             LEFT JOIN test_results t ON u.id = t.user_id
             WHERE f.user1_id = ? OR f.user2_id = ?
             GROUP BY u.id, u.name, u.friend_code, u.current_streak, u.longest_streak
             ORDER BY u.name`,
            [userId, userId, userId, userId]
        );
        
        res.json({ friends });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// Remove friend
router.delete('/:friendId', async (req, res) => {
    try {
        const userId = req.user.id;
        const friendId = parseInt(req.params.friendId);
        
        const [result] = await pool.query(
            `DELETE FROM friendships 
             WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
            [Math.min(userId, friendId), Math.max(userId, friendId),
             Math.min(userId, friendId), Math.max(userId, friendId)]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Friendship not found' });
        }
        
        res.json({ success: true, message: 'Friend removed' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ error: 'Failed to remove friend' });
    }
});

// =================================
// FRIEND ANALYTICS
// =================================

// Get friend's analytics/dashboard
router.get('/:friendId/analytics', async (req, res) => {
    try {
        const userId = req.user.id;
        const friendId = parseInt(req.params.friendId);
        
        // Verify they are friends
        const [friendship] = await pool.query(
            `SELECT id FROM friendships 
             WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
            [Math.min(userId, friendId), Math.max(userId, friendId),
             Math.min(userId, friendId), Math.max(userId, friendId)]
        );
        
        if (friendship.length === 0) {
            return res.status(403).json({ error: 'Not friends with this user' });
        }
        
        // Get friend info
        const [friendInfo] = await pool.query(
            'SELECT name, current_streak, longest_streak FROM users WHERE id = ?',
            [friendId]
        );
        
        // Get overall stats
        const [overallStats] = await pool.query(
            `SELECT 
                COUNT(*) as total_tests,
                AVG(percentage) as avg_score,
                MAX(percentage) as best_score
             FROM test_results WHERE user_id = ?`,
            [friendId]
        );
        
        // Get subject performance
        const [subjectStats] = await pool.query(
            `SELECT 
                section,
                COUNT(*) as test_count,
                AVG(percentage) as avg_score,
                MAX(percentage) as best_score
             FROM test_results
             WHERE user_id = ? AND section IS NOT NULL
             GROUP BY section`,
            [friendId]
        );
        
        // Get friend's rank (among your friends)
        const [friendsList] = await pool.query(
            `SELECT CASE WHEN f.user1_id = ? THEN f.user2_id ELSE f.user1_id END as friend_id
             FROM friendships f WHERE f.user1_id = ? OR f.user2_id = ?`,
            [userId, userId, userId]
        );
        
        const allFriendIds = friendsList.map(f => f.friend_id);
        allFriendIds.push(userId);
        
        const [rankings] = await pool.query(
            `SELECT u.id, AVG(t.percentage) as avg_score
             FROM users u LEFT JOIN test_results t ON u.id = t.user_id
             WHERE u.id IN (${allFriendIds.map(() => '?').join(',')})
             GROUP BY u.id ORDER BY avg_score DESC`,
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
                avg_score: parseFloat(s.avg_score).toFixed(1),
                best_score: parseFloat(s.best_score).toFixed(1)
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
