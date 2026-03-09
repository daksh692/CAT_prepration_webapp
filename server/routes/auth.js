const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ==================== PUBLIC ROUTES ====================

// POST /api/auth/register - Register new user (student only)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        console.log(`[REGISTER] Attempting registration for: ${email}`);
        
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`[REGISTER] Email already exists: ${email}`);
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate unique friend code
        function generateFriendCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 12; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            return code;
        }
        
        let friendCode = generateFriendCode();
        let isUnique = false;
        
        // Ensure code is unique
        while (!isUnique) {
            const existingCode = await User.findOne({ friend_code: friendCode });
            if (!existingCode) {
                isUnique = true;
            } else {
                friendCode = generateFriendCode();
            }
        }
        
        const now = Date.now();
        // Insert user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            role: 'user',
            friend_code: friendCode,
            created_at: now,
            updated_at: now
        });
        await newUser.save();
        
        console.log(`[REGISTER] User registered successfully: ${newUser._id}`);
        
        // Generate token
        const token = jwt.sign(
            { id: newUser._id, role: 'user' },
            JWT_SECRET
        );
        
        const user = {
            id: newUser._id,
            email,
            name,
            role: 'user',
            friendCode
        };
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error('[REGISTER] Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

// POST /api/auth/login - Login user or admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Update last login
        user.last_login = Date.now();
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ==================== PROTECTED ROUTES ====================

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
    try {
        res.json({
            id: req.user.id, // comes from token
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
    // Token invalidation happens client-side by removing from localStorage
    res.json({ message: 'Logged out successfully' });
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        // Get current user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // If changing password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password required to set new password' });
            }
            
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters' });
            }
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.updated_at = Date.now();
        }
        
        // Update name and/or email
        if (name) {
            user.name = name;
            user.updated_at = Date.now();
        }
        
        if (email && email !== user.email) {
            const existing = await User.findOne({ email, _id: { $ne: userId } });
            if (existing) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            user.email = email;
            user.updated_at = Date.now();
        }
        
        await user.save();
        
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ==================== ADMIN ONLY ROUTES ====================

// POST /api/auth/admin/create - Create new admin user
router.post('/admin/create', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = Date.now();
        
        const adminUser = new User({
            email,
            password: hashedPassword,
            name,
            role: 'admin',
            created_at: now,
            updated_at: now
        });
        await adminUser.save();
        
        res.status(201).json({
            message: 'Admin user created successfully',
            user: {
                id: adminUser._id,
                email,
                name,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin creation error:', error);
        res.status(500).json({ error: 'Failed to create admin user' });
    }
});

// GET /api/auth/admin/users - Get all users
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'id _id email name role created_at last_login').sort({ created_at: -1 });
        
        // Map _id to id for backwards compatibility in frontend if needed
        const formattedUsers = users.map(user => ({
            id: user._id, // use mongo id
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at,
            last_login: user.last_login
        }));
        
        res.json({ users: formattedUsers });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
