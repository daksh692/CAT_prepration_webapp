/**
 * Security and Utility Helpers for Serverless Functions
 */

/**
 * CORS headers for API responses
 */
export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Handle CORS preflight requests
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {boolean} True if handled
 */
export function handleCORS(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return true;
    }
    
    // Set CORS headers for all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    
    return false;
}

/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {array} requiredFields - Array of required field names
 * @throws {Error} If validation fails
 */
export function validateRequired(body, requiredFields) {
    const missing = requiredFields.filter(field => !body[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Standard error response
 * @param {object} res - Response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 */
export function errorResponse(res, status, message) {
    return res.status(status).json({
        error: true,
        message
    });
}

/**
 * Standard success response
 * @param {object} res - Response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 */
export function successResponse(res, data, message = 'Success') {
    return res.status(200).json({
        success: true,
        message,
        data
    });
}
