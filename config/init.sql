ALTER USER postgres WITH PASSWORD 'postgres';

\connect autograder

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    display_name     VARCHAR(255) NOT NULL,
    username         VARCHAR(255) NOT NULL,
    admin            BOOLEAN NOT NULL,
    email            VARCHAR(255) NOT NULL,
    pass             VARCHAR(255) NOT NULL,
    cf_handle        VARCHAR(255),
    cf_rating        SMALLINT DEFAULT 0,
    usaco_division   VARCHAR(50)
);

-- CONTESTS
CREATE TABLE IF NOT EXISTS contests (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    start      TIMESTAMP NOT NULL,
    "end"      TIMESTAMP NOT NULL,
    editorial  TEXT,
    tjioi      BOOLEAN DEFAULT FALSE,
    season     SMALLINT,
    rated      BOOLEAN DEFAULT FALSE
);

-- CHECKER
CREATE TABLE IF NOT EXISTS checker (
    id     SERIAL PRIMARY KEY,
    code   TEXT NOT NULL,
    lang   VARCHAR(100) NOT NULL
);

-- PROBLEMS
CREATE TABLE IF NOT EXISTS problems (
    pid         SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    statement   TEXT,
    secret      BOOLEAN DEFAULT FALSE,
    tl          INTEGER,
    ml          INTEGER,
    contestid   INTEGER REFERENCES contests(id),
    checkerid   INTEGER REFERENCES checker(id),
    solution    TEXT,
    sollang     VARCHAR(50),
    interactive BOOLEAN DEFAULT FALSE,
    inputtxt    TEXT,
    outputtxt   TEXT,
    samples     TEXT,
    points      INTEGER DEFAULT 0
);

-- SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
    id           SERIAL PRIMARY KEY,
    usr          INTEGER REFERENCES users(id),
    code         TEXT NOT NULL,
    problemid    INTEGER REFERENCES problems(pid),
    language     VARCHAR(100) NOT NULL,
    runtime      INTEGER DEFAULT -1,
    memory       INTEGER DEFAULT -1,
    verdict      VARCHAR(100) DEFAULT 'Running',
    problemname  VARCHAR(255),
    contest      INTEGER REFERENCES contests(id),
    timestamp    TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    insight      TEXT
);

-- TESTS
CREATE TABLE IF NOT EXISTS test (
    id     SERIAL PRIMARY KEY,
    points INTEGER NOT NULL,
    pid    INTEGER REFERENCES problems(pid),
    test   TEXT NOT NULL
);


-- example data begins here
INSERT INTO contests (
    id, name, start, "end", editorial, tjioi, season, rated
) VALUES (
    1,
    'Sample Contest',
    NOW(),
    NOW() + interval '2 hours',
    'editorial text here',
    false,
    2024,
    false
);

INSERT INTO contests (
    id, name, start, "end", editorial, tjioi, season, rated
) VALUES (
    2,
    'Sample Contest 2',
    NOW(),
    NOW() + interval '2 hours',
    'editorial text here',
    false,
    6969,
    false
);

INSERT INTO checker (code, lang)
VALUES (
    $$import sys

expected = sys.stdin.readline().strip()
actual = sys.stdin.readline().strip()
print("ok" if expected == actual else "wrong")$$,
    'python3'
);

INSERT INTO problems (
    pid, name, contestid, checkerid, solution, statement, tl, ml,
    interactive, secret, inputtxt, outputtxt, samples, points
) VALUES
(1, 'Problem 1', 1, 1, 'print(1)', 'Problem 1 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 1\n Output: 1\n', 1),
(2, 'Problem 2', 1, 1, 'print(2)', 'Problem 2 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 2\n Output: 2\n', 2),
(3, 'Problem 3', 1, 1, 'print(3)', 'Problem 3 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 3\n Output: 3\n', 3),
(4, 'Problem 4', 1, 1, 'print(4)', 'Problem 4 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 4\n Output: 4\n', 4),
(5, 'Problem 5', 1, 1, 'print(5)', 'Problem 5 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 5\n Output: 5\n', 5),
(6, 'Problem 6', 2, 1, 'print(6)', 'Problem 6 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 6\n Output: 6\n', 6),
(7, 'Problem 7', 2, 1, 'print(7)', 'Problem 7 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 7\n Output: 7\n', 7),
(8, 'Problem 8', 2, 1, 'print(8)', 'Problem 8 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 8\n Output: 8\n', 8),
(9, 'Problem 9', 2, 1, 'print(9)', 'Problem 9 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 9\n Output: 9\n', 9),
(10, 'Problem 10', 2, 1, 'print(10)', 'Problem 10 description', 1, 256, false, false, 'Input format', 'Output format', 'Input: 10\n Output: 10\n', 10);