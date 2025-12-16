/**
 * Authentication Middleware for Vercel Serverless Functions
 * Handles JWT verification and user authorization
 */

import jwt from 'jsonwebtoken';
import { executeQuery } from './db.js';

/**
 * Verify JWT token and return user data
 * @param {string} token - JWT token
 * @returns {Promise<object>} User data
 */
export async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Get user from authorization header
 * @param {object} req - Request object
 * @returns {Promise<object>} User data
 */
export async function getUserFromRequest(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No authorization token provided');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = await verifyToken(token);
    
    // Fetch full user data from database
    const users = await executeQuery(
        'SELECT id, email, name, role FROM users WHERE id = ?',
        [decoded.userId]
    );
    
    if (users.length === 0) {
        throw new Error('User not found');
    }
    
    return users[0];
}

/**
 * Check if user is admin
 * @param {object} user - User object
 * @returns {boolean}
 */
export function isAdmin(user) {
    return user && user.role === 'admin';
}

/**
 * Require authentication middleware
 * @param {function} handler - Request handler
 * @returns {function} Wrapped handler with auth
 */
export function requireAuth(handler) {
    return async (req, res) => {
        try {
            const user = await getUserFromRequest(req);
            req.user = user;
            return await handler(req, res);
        } catch (error) {
            return res.status(401).json({ 
                error: 'Unauthorized', 
                message: error.message 
            });
        }
    };
}

/**
 * Require admin role middleware
 * @param {function} handler - Request handler
 * @returns {function} Wrapped handler with admin check
 */
export function requireAdmin(handler) {
    return requireAuth(async (req, res) => {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'Admin access required' 
            });
        }
        return await handler(req, res);
    });
}
