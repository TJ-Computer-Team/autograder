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
    cf_rating        SMALLINT,
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
(1001, 'Sum of Two Numbers', 1, 1, 'print(a + b)', 'Add two integers a and b.', 1, 256, false, false, '1 2', '3', '[{"input": "1 2", "output": "3"}]', 100),
(1002, 'Max of Array', 1, 1, 'print(max(arr))', 'Find the maximum element in the array.', 1, 256, false, false, '1 3 2 5', '5', '[{"input": "1 3 2 5", "output": "5"}]', 100),
(1003, 'Reverse String', 1, 1, 'print(s[::-1])', 'Reverse a given string.', 1, 128, false, false, 'hello', 'olleh', '[{"input": "hello", "output": "olleh"}]', 100),
(1004, 'Even or Odd', 1, 1, 'print("Even" if n % 2 == 0 else "Odd")', 'Determine if a number is even or odd.', 0.5, 64, false, false, '4', 'Even', '[{"input": "3", "output": "Odd"}]', 50),
(1005, 'Factorial', 1, 1, 'print(math.factorial(n))', 'Compute the factorial of a number.', 2, 512, false, false, '5', '120', '[{"input": "4", "output": "24"}]', 150);
