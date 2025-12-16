/**
 * Register Endpoint - Vercel Serverless Function
 * POST /api/auth/register
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../_lib/db.js';
import { handleCORS, validateRequired, errorResponse } from '../_lib/security.js';

export default async function handler(req, res) {
    // Handle CORS
    if (handleCORS(req, res)) return;
    
    // Only allow POST
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }
    
    try {
        const { email, password, name } = req.body;
        
        // Validate required fields
        validateRequired(req.body, ['email', 'password', 'name']);
        
        // Check if user already exists
        const existing = await executeQuery(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return errorResponse(res, 400, 'Email already registered');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if this is the first user (make them admin)
        const userCount = await executeQuery('SELECT COUNT(*) as count FROM users');
        const isFirstUser = userCount[0].count === 0;
        const role = isFirstUser ? 'admin' : 'student';
        
        // Create user
        const result = await executeQuery(
            'INSERT INTO users (email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, role, Date.now()]
        );
        
        const userId = result.insertId;
        
        // Generate JWT token
        const token = jwt.sign(
            { userId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: userId,
                email,
                name,
                role
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        return errorResponse(res, 500, error.message || 'Registration failed');
    }
}
