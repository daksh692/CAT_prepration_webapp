/**
 * Audit Logging Module
 * Logs security-relevant events for monitoring and compliance
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const auditLogFile = path.join(logsDir, 'audit.log');

/**
 * Log an audit event
 * @param {string} action - Action being performed
 * @param {object} details - Additional details
 */
function logAudit(action, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,
        ...details
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Console log for development
    console.log(`[AUDIT] ${timestamp} | ${action} |`, JSON.stringify(details));
    
    // File log for production
    fs.appendFile(auditLogFile, logLine, (err) => {
        if (err) console.error('Failed to write audit log:', err);
    });
}

/**
 * Log authentication events
 */
function logAuth(event, userId, email, success, ip, details = {}) {
    logAudit('AUTH', {
        event,
        userId,
        email,
        success,
        ip,
        ...details
    });
}

/**
 * Log admin actions
 */
function logAdmin(action, adminId, targetId, details = {}) {
    logAudit('ADMIN', {
        action,
        adminId,
        targetId,
        ...details
    });
}

/**
 * Log security events
 */
function logSecurity(event, severity, details = {}) {
    logAudit('SECURITY', {
        event,
        severity,
        ...details
    });
}

module.exports = {
    logAudit,
    logAuth,
    logAdmin,
    logSecurity
};
