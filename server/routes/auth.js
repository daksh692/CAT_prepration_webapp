const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ==================== PUBLIC ROUTES ====================

// POST /api/auth/register - Register new user (student only)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if user already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
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
            const [existing] = await pool.query(
                'SELECT id FROM users WHERE friend_code = ?',
                [friendCode]
            );
            if (existing.length === 0) {
                isUnique = true;
            } else {
                friendCode = generateFriendCode();
            }
        }
        
        // Insert user (role defaults to 'user')
        const [result] = await pool.query(
            'INSERT INTO users (email, password, name, role, friend_code) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, 'user', friendCode]
        );
        
        // Generate token (no expiration - persists until logout)
        const token = jwt.sign(
            { id: result.insertId, role: 'user' },
            JWT_SECRET
        );
        
        const user = {
            id: result.insertId,
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
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
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
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const user = users[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Update last login
        await pool.query('UPDATE users SET last_login = ? WHERE id = ?', [Date.now(), user.id]);
        
        // Generate token (no expiration - persists until logout)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
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
            id: req.user.id,
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

// PUT /api/auth/profile - Update user profile (authenticated users)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        // Get current user data
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];
        
        // If changing password, verify current password
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
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', [hashedPassword, Date.now(), userId]);
        }
        
        // Update name and/or email
        if (name || email) {
            const updates = [];
            const values = [];
            
            if (name) {
                updates.push('name = ?');
                values.push(name);
            }
            
            if (email && email !== user.email) {
                // Check if email already exists
                const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
                if (existing.length > 0) {
                    return res.status(400).json({ error: 'Email already in use' });
                }
                updates.push('email = ?');
                values.push(email);
            }
            
            if (updates.length > 0) {
                updates.push('updated_at = ?');
                values.push(Date.now());
                values.push(userId);
                
                await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
            }
        }
        
        // Fetch updated user
        const [updatedUsers] = await pool.query('SELECT id, email, name, role FROM users WHERE id = ?', [userId]);
        
        res.json({
            message: 'Profile updated successfully',
            user: updatedUsers[0]
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ==================== ADMIN ONLY ROUTES ====================

// POST /api/auth/admin/create - Create new admin user (admin only)
router.post('/admin/create', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if user already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = Date.now();
        
        // Insert admin user
        const [result] = await pool.query(
            'INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, name, 'admin', now, now]
        );
        
        res.status(201).json({
            message: 'Admin user created successfully',
            user: {
                id: result.insertId,
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

// GET /api/auth/admin/users - Get all users (admin only)
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, name, role, created_at, last_login FROM users ORDER BY created_at DESC');
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
