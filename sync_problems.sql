-- First, clear out any existing problems
DELETE FROM problems;

-- Insert problems from problems.json
INSERT INTO problems (
    pid,
    name,
    tl,
    ml,
    statement,
    inputtxt,
    outputtxt,
    samples,
    points,
    contestid,
    checkerid,
    interactive,
    secret
) VALUES
('CF2094A', '[CF] Trippi Trippi', 2000, 256, 
'This is problem A from Codeforces Round #2094.

Please solve this problem on [Codeforces](https://codeforces.com/contest/2094/problem/A).',
'See on Codeforces', 'See on Codeforces', '[]', 800, -1, -1, false, false),

('CF2091E', '[CF] Interesting Ratio', 2000, 256,
'This is problem E from Codeforces Round #2091.

Please solve this problem on [Codeforces](https://codeforces.com/contest/2091/problem/E).',
'See on Codeforces', 'See on Codeforces', '[]', 1500, -1, -1, false, false); 