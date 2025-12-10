const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        
        // Fetch user from database to ensure they still exist
        const [users] = await pool.query('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        // Attach user to request
        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' });
        }
        
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authenticateToken, requireAdmin };
