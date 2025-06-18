-- Create problems table if it doesn't exist
CREATE TABLE IF NOT EXISTS problems (
    pid VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200),
    contestid INTEGER,
    checkerid INTEGER,
    solution TEXT,
    statement TEXT,
    tl INTEGER,
    ml INTEGER,
    interactive BOOLEAN,
    secret BOOLEAN,
    inputtxt TEXT,
    outputtxt TEXT,
    samples TEXT,
    points INTEGER
);

-- Insert a test problem
INSERT INTO problems (pid, name, tl, ml, statement, inputtxt, outputtxt) VALUES
('CF2094A', 'Trippi Trippi', 2000, 256, 'Test problem', 'Input format', 'Output format')
ON CONFLICT (pid) DO UPDATE SET
    name = EXCLUDED.name,
    tl = EXCLUDED.tl,
    ml = EXCLUDED.ml; 