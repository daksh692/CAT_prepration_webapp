-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    last_login BIGINT,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insert default admin account
-- Password: admin123
INSERT INTO users (email, password, name, role, created_at, updated_at) 
VALUES (
    'admin@catprep.com', 
    '$2b$10$Y/9m0M0qs07V1CzFZrAkLOqtiaSG2neBximZw45HwTLVF8C.mFEBK', 
    'Admin User', 
    'admin', 
    UNIX_TIMESTAMP() * 1000, 
    UNIX_TIMESTAMP() * 1000
);

-- Insert test student account  
-- Password: student123
INSERT INTO users (email, password, name, role, created_at, updated_at)
VALUES (
    'student@catprep.com', 
    '$2b$10$1fgOoRf6wb7wn6NPNFROQ.IDxNdwKApD2hIpKJ.yvXcg28ehBjbcy', 
    'Test Student', 
    'user', 
    UNIX_TIMESTAMP() * 1000, 
    UNIX_TIMESTAMP() * 1000
);
