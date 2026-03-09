const express = require('express');
const router = express.Router();
const { User, Friendship, FriendRequest, TestResult } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

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
router.get('/my-code', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const user = await User.findOne(isNaN(Number(userId)) ? { _id: userId } : { $or: [{ id: uIdNum }, { _id: userId }] }).lean();
        res.json({ code: user ? user.friend_code : '' });
    } catch (error) {
        console.error('Error fetching friend code:', error);
        res.status(500).json({ error: 'Failed to fetch friend code' });
    }
});

// =================================
// FRIEND REQUESTS
// =================================
router.post('/request', async (req, res) => {
    try {
        const senderId = req.user.id || req.user._id;
        const sIdNum = isNaN(Number(senderId)) ? 1 : Number(senderId);

        const { friendCode } = req.body;
        
        if (!friendCode || friendCode.length !== 12) {
            return res.status(400).json({ error: 'Invalid friend code' });
        }
        
        const receiver = await User.findOne({ friend_code: friendCode }).lean();
        if (!receiver) {
            return res.status(404).json({ error: 'User not found with this code' });
        }
        
        const rIdNum = receiver.id || 1;
        
        if (sIdNum === rIdNum) {
            return res.status(400).json({ error: 'Cannot add yourself as a friend' });
        }
        
        const existingRequest = await FriendRequest.findOne({ sender_id: sIdNum, receiver_id: rIdNum });
        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                return res.status(400).json({ error: 'Request already sent' });
            } else if (existingRequest.status === 'rejected' || existingRequest.status === 'accepted') {
                existingRequest.status = 'pending';
                existingRequest.created_at = Date.now();
                await existingRequest.save();
                return res.json({ success: true, message: 'Friend request sent!' });
            }
        } else {
            const newReq = new FriendRequest({ sender_id: sIdNum, receiver_id: rIdNum, status: 'pending', created_at: Date.now() });
            await newReq.save();
        }
        
        res.json({ success: true, message: 'Friend request sent!' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

router.get('/requests/pending', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const requests = await FriendRequest.find({ receiver_id: uIdNum, status: 'pending' }).sort({ created_at: -1 }).lean();
        
        const userIds = requests.map(r => r.sender_id);
        const users = await User.find({ id: { $in: userIds } }).lean();
        const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

        const formattedRequests = requests.map(r => ({
            id: r._id,
            created_at: r.created_at,
            sender_id: r.sender_id,
            sender_name: userMap[r.sender_id]?.name,
            sender_code: userMap[r.sender_id]?.friend_code
        }));
        
        res.json({ requests: formattedRequests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

router.post('/requests/:id/accept', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const request = await FriendRequest.findOne({ _id: req.params.id, receiver_id: uIdNum, status: 'pending' });
        if (!request) return res.status(404).json({ error: 'Request not found' });
        
        const senderId = request.sender_id;
        const receiverId = request.receiver_id;
        
        await Friendship.create({ 
            user1_id: Math.min(senderId, receiverId), 
            user2_id: Math.max(senderId, receiverId), 
            created_at: Date.now() 
        });
        
        request.status = 'accepted';
        request.updated_at = Date.now();
        await request.save();
        
        res.json({ success: true, message: 'Friend request accepted!' });
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ error: 'Failed to accept request' });
    }
});

router.post('/requests/:id/reject', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const request = await FriendRequest.findOne({ _id: req.params.id, receiver_id: uIdNum, status: 'pending' });
        if (!request) return res.status(404).json({ error: 'Request not found' });
        
        request.status = 'rejected';
        request.updated_at = Date.now();
        await request.save();
        
        res.json({ success: true, message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// =================================
// FRIENDS LIST
// =================================
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);

        const friendships = await Friendship.find({ $or: [{ user1_id: uIdNum }, { user2_id: uIdNum }] }).lean();
        const friendIds = friendships.map(f => f.user1_id === uIdNum ? f.user2_id : f.user1_id);
        
        const friendsUsers = await User.find({ id: { $in: friendIds } }).lean();
        const friendStats = await TestResult.aggregate([
            { $match: { user_id: { $in: friendIds } } },
            { $group: { _id: "$user_id", total_tests: { $sum: 1 }, avg_score: { $avg: "$percentage" } } }
        ]);
        const statsMap = friendStats.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});

        const friends = friendsUsers.map(u => ({
            id: u.id,
            name: u.name,
            friend_code: u.friend_code,
            current_streak: u.current_streak,
            longest_streak: u.longest_streak,
            avg_score: statsMap[u.id] ? statsMap[u.id].avg_score : 0,
            total_tests: statsMap[u.id] ? statsMap[u.id].total_tests : 0
        }));
        
        res.json({ friends });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

router.delete('/:friendId', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        const fId = Number(req.params.friendId);

        const result = await Friendship.deleteOne({
            $or: [
                { user1_id: Math.min(uIdNum, fId), user2_id: Math.max(uIdNum, fId) }
            ]
        });
        
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Friendship not found' });
        res.json({ success: true, message: 'Friend removed' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ error: 'Failed to remove friend' });
    }
});

// =================================
// FRIEND ANALYTICS
// =================================
router.get('/:friendId/analytics', async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const uIdNum = isNaN(Number(userId)) ? 1 : Number(userId);
        const friendId = Number(req.params.friendId);
        
        const friendship = await Friendship.findOne({
            user1_id: Math.min(uIdNum, friendId),
            user2_id: Math.max(uIdNum, friendId)
        });
        
        if (!friendship) return res.status(403).json({ error: 'Not friends with this user' });
        
        const friendInfo = await User.findOne({ id: friendId }).lean();
        
        const overallStats = await TestResult.aggregate([
            { $match: { user_id: friendId } },
            { $group: { _id: null, total_tests: { $sum: 1 }, avg_score: { $avg: "$percentage"}, best_score: { $max: "$percentage"} } }
        ]);

        const subjectStats = await TestResult.aggregate([
            { $match: { user_id: friendId, section: { $ne: null } } },
            { $group: { _id: "$section", test_count: { $sum: 1 }, avg_score: { $avg: "$percentage"}, best_score: { $max: "$percentage"} } }
        ]);

        const myFriendships = await Friendship.find({ $or: [{ user1_id: uIdNum }, { user2_id: uIdNum }] }).lean();
        const allFriendIds = myFriendships.map(f => f.user1_id === uIdNum ? f.user2_id : f.user1_id);
        allFriendIds.push(uIdNum);

        const rankings = await TestResult.aggregate([
            { $match: { user_id: { $in: allFriendIds } } },
            { $group: { _id: "$user_id", avg_score: { $avg: "$percentage" } } },
            { $sort: { avg_score: -1 } }
        ]);
        
        const friendRank = rankings.findIndex(r => r._id === friendId) + 1;
        
        res.json({
            friend: {
                name: friendInfo.name,
                current_streak: friendInfo.current_streak,
                longest_streak: friendInfo.longest_streak
            },
            overall: {
                total_tests: overallStats.length > 0 ? overallStats[0].total_tests : 0,
                avg_score: overallStats.length > 0 ? (overallStats[0].avg_score).toFixed(1) : "0.0",
                best_score: overallStats.length > 0 ? (overallStats[0].best_score).toFixed(1) : "0.0"
            },
            subjects: subjectStats.map(s => ({
                section: s._id,
                test_count: s.test_count,
                avg_score: (s.avg_score).toFixed(1),
                best_score: (s.best_score).toFixed(1)
            })),
            rank: {
                position: friendRank === 0 ? allFriendIds.length : friendRank,
                total_friends: allFriendIds.length
            }
        });
    } catch (error) {
        console.error('Error fetching friend analytics:', error);
        res.status(500).json({ error: 'Failed to fetch friend analytics' });
    }
});

module.exports = router;
