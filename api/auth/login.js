/**
 * Login Endpoint - Vercel Serverless Function
 * POST /api/auth/login
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
        const { email, password } = req.body;
        
        // Validate required fields
        validateRequired(req.body, ['email', 'password']);
        
        // Find user
        const users = await executeQuery(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return errorResponse(res, 401, 'Invalid credentials');
        }
        
        const user = users[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return errorResponse(res, 401, 'Invalid credentials');
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(res, 500, error.message || 'Login failed');
    }
}
