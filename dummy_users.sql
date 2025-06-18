-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    display_name VARCHAR(100),
    username VARCHAR(100),
    admin BOOLEAN,
    email VARCHAR(100),
    pass VARCHAR(100),
    cf_handle VARCHAR(100),
    cf_rating INTEGER,
    usaco_division INTEGER
);

-- Insert dummy users with varying ratings and divisions
INSERT INTO users (id, display_name, username, admin, email, pass, cf_handle, cf_rating, usaco_division) VALUES
(1000001, 'Alice Chen', '2024achen', false, 'achen@example.com', '1234', 'alicechen', 1850, '2'),
(1000002, 'Bob Wang', '2024bwang', false, 'bwang@example.com', '1234', 'bobwang', 2100, '3'),
(1000003, 'Carol Liu', '2025cliu', false, 'cliu@example.com', '1234', 'carolgold', 1650, '1'),
(1000004, 'David Zhang', '2025dzhang', false, 'dzhang@example.com', '1234', 'davidsolver', 1950, '2'),
(1000005, 'Emma Park', '2026epark', false, 'epark@example.com', '1234', 'emmapark', 1200, '1'),
(1000006, 'Frank Wu', '2026fwu', false, 'fwu@example.com', '1234', 'frankwu', 2300, '4'),
(1000007, 'Grace Lee', '2024glee', false, 'glee@example.com', '1234', 'gracelee', 1750, '2'),
(1000008, 'Henry Zhao', '2025hzhao', false, 'hzhao@example.com', '1234', 'henryzhao', 2050, '3'),
(1000009, 'Ivy Tang', '2026itang', false, 'itang@example.com', '1234', 'ivytang', 1400, '1'),
(1000010, 'Admin User', 'admin', true, 'admin@example.com', '1234', 'adminuser', 2500, '4'); 