const {
    Pool
} = require('pg');
const pl = new Pool({
    user: "postgres",
    password: process.env.PGPASSWORD,
    port: 5432,
    database: "autograder",
    max: 100,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true
});
const crypto = require('crypto');

async function grab(id) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM problems WHERE pid = $1";
            client.query(qry, [id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    let ret = {
                        id: id,
                        title: results.rows[0].name,
                        statement: results.rows[0].statement,
                        secret: results.rows[0].secret,
                        tl: results.rows[0].tl,
                        ml: results.rows[0].ml,
                        contestid: results.rows[0].contestid,
                        checkerid: results.rows[0].checkerid
                    }
                    resolve(ret);
                }
            });
        });
    });
}
async function grabChecker(id) { // not in use
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM checker WHERE id= $1";
            client.query(qry, [id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for checker", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    let ret = {
                        id: id,
                        code: results.rows[0].code,
                        lang: results.rows[0].lang
                    }
                    resolve(ret);
                }
            });
        });
    });
}
async function grabAllProblems(isAdmin) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM problems WHERE (problems.secret IS NULL OR problems.secret = false OR problems.secret = $1)";
            let params = [];
            if (isAdmin) {
                params.push(true)
            } else {
                params.push(null)
            }
            client.query(qry, params, (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for problems", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    resolve(results.rows);
                }
            });
        });
    });
}
async function grabSubs(user, contest) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            if (isNaN(contest)) {
                contest = undefined;
            }
            if (isNaN(user)) {
                user = undefined;
            }
            let qry = undefined;
            let params = [];
            if (contest == undefined && user == undefined) {
                qry = "SELECT * FROM submissions ORDER BY id ASC;";
            } else if (contest == undefined) {
                qry = "SELECT * FROM submissions WHERE submissions.usr = $1 ORDER BY id ASC;";
                params.push(user);
            } else if (user == undefined) {
                qry = "SELECT * FROM submissions WHERE submissions.contest = $1 ORDER BY id ASC;";
                params.push(contest);
            } else {
                qry = "SELECT * FROM submissions WHERE submissions.usr = $1 AND submissions.contest = $2 ORDER BY id ASC;";
                params.push(user);
                params.push(contest);
            }
            client.query(qry, params, (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for submissions", err);
                    resolve([]);
                } else if (results.rows.length == 0) {
                    resolve([]);
                } else {
                    retarr = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        let ret = {
                            user: results.rows[i].usr,
                            id: results.rows[i].id,
                            verdict: results.rows[i].verdict,
                            runtime: results.rows[i].runtime,
                            problemname: results.rows[i].problemname,
                            problemid: results.rows[i].problemid,
                            timestamp: results.rows[i].timestamp,
                            language: results.rows[i].language,
                            contest: results.rows[i].contest
                        }
                        retarr.push(ret);
                    }
                    resolve(retarr);
                }
            });
        });
    });
}
async function grabStatus(id) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM submissions WHERE id = $1";
            client.query(qry, [id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for status", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    let ret = {
                        user: results.rows[0].usr,
                        verdict: results.rows[0].verdict,
                        runtime: results.rows[0].runtime,
                        problemname: results.rows[0].problemname,
                        problemid: results.rows[0].problemid,
                        code: results.rows[0].code,
                        language: results.rows[0].language,
                        insight: results.rows[0].insight,
                        timestamp: results.rows[0].timestamp
                    }
                    resolve(ret);
                }
            });
        });
    });
}
async function grabProblem(id) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM problems WHERE pid = $1";
            client.query(qry, [id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for problem", err);
                    console.log(err);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    let ret = {
                        name: results.rows[0].name,
                        cid: results.rows[0].contestid,
                        tl: results.rows[0].tl,
                        ml: results.rows[0].ml,
                        sol: results.rows[0].solution,
                        lang: results.rows[0].sollang,
                        checkid: results.rows[0].checkerid,
                        pts: results.rows[0].points,
                        secret: results.rows[0].secret,
                        statement: results.rows[0].statement,
                        inputtxt: results.rows[0].inputtxt,
                        outputtxt: results.rows[0].outputtxt,
                        samples: results.rows[0].samples
                    }
                    resolve(ret);
                }
            });
        });
    });
}
async function insertSubmission(id, verdict, runtime, memory, insight) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE submissions SET verdict = $1, runtime = $2, memory = $3, insight = $4 WHERE id = $5;`;
            client.query(qry, [verdict, runtime, memory, insight, id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to insert submission", err);
                    resolve(false);
                }
                resolve(true);
            });
        });
    });
}
async function createSubmission(user, code, problem, language, problemname, cid, timestamp) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `INSERT INTO submissions (usr, code, problemid, language, runtime, memory, verdict, problemname, contest, timestamp) values ($1, $2, $3, $4, -1, -1, 'Running', $5, $6, $7) RETURNING id`;
            let vals = [user, code, problem, language, problemname, cid, timestamp];
            client.query(qry, vals, (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to create submission", err);
                    resolve(false);
                } else if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    resolve(results.rows[0].id);
                }
            });
        });
    });
}
async function grabProfile(id) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users WHERE id = $1`;
            client.query(qry, [id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for profile", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    res = {
                        username: results.rows[0].username,
                        name: results.rows[0].display_name,
                        cf: results.rows[0].cf_handle,
                        usaco: results.rows[0].usaco_division
                    }
                    resolve(res);
                }
            });
        });
    });
}
async function addTest(tid, pid, tval) { // not in use
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `INSERT INTO test (points,pid, test) VALUES ($1, $2, $3) RETURNING id;`;
            client.query(qry, [pts, pid, tval], (err, results) => {
                release();
                if (err) {
                    console.log("Error while querying");
                    resolve(false);
                }
                resolve(true);
            });
        });
    });
}
async function updateChecker(checkid, checkercode, lang) { // not in use
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE CHECKER SET code=$1, lang=$2 WHERE id = $3;`;
            client.query(qry, [checkercode, lang, checkid], (err, results) => {
                release();
                if (err) {
                    console.log("Error while querying");
                    resolve(false);
                }
                resolve(true);
            });
        });
    });
}
async function addChecker(checkid, checkercode, lang) { // not in use
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `INSERT INTO checker (code, lang) VALUES ($1, $2) RETURNING id;`;
            client.query(qry, [checkercode, lang], (err, results) => {
                release();
                if (err) {
                    console.log("Error while querying");
                    resolve(false);
                }
                resolve(true);
            });
        });
    });
}
async function addSol(pid, code, lang) { // not in use
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE problems SET solution=$1, sollang=$3 WHERE pid=$2`;
            client.query(qry, [code, pid, lang], (err, results) => {
                release();
                if (err) {
                    console.log("Error while querying");
                    resolve(false);
                }
                resolve(true);
            });
        });
    });
}
async function addProblem(pid, pname, cid, checkid, sol, state, tl, ml, inter, secret, inputtxt, outputtxt, samples, points) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            console.log(pid, secret, inputtxt, outputtxt, samples);
            // pid | name | contestid | checkerid | solution | statement | tl | ml | interactive | secret | points 
            let qry = `INSERT INTO problems (pid, name, contestid, checkerid,solution, statement, tl, ml, interactive, secret, inputtxt, outputtxt, samples, points)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (pid)
			DO UPDATE SET 
				name = excluded.name,
				contestid= excluded.contestid,
				checkerid= excluded.checkerid,
				statement= excluded.statement,
				tl= excluded.tl,
				ml= excluded.ml,
				interactive= excluded.interactive,
				secret= excluded.secret,
				points = excluded.points,
				inputtxt = excluded.inputtxt,
				outputtxt = excluded.outputtxt,
				samples = excluded.samples
			`;
            client.query(qry, [pid, pname, cid, checkid, sol, state, tl, ml, inter, secret, inputtxt, outputtxt, samples, points], (err, results) => {
                release();
                if (err) {
                    console.log("Error while querying to add problem", err);
                    resolve(false);
                }
                resolve(results);
            });
        });
    });
}
async function grabUsers() {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM users;";
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for users", err);
                    resolve(false)
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    resolve(results.rows);
                }
            });
        });
    });
}
async function grabContestProblems(cid) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM problems WHERE contestid = $1`;
            client.query(qry, [cid], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for contest problems", err);
                    resolve(false)
                }
                resolve(results.rows);
            });
        });
    });
}
async function validateUser(id, password) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users WHERE id = $1 AND pass = $2 AND id < 1000000`;
            client.query(qry, [id, password], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to validate user", err);
                    resolve(false)
                }
                if (results.rows.length == 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    });
}
async function updateUSACO(id, usaco) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE users SET usaco_division = $1 WHERE id = $2;`;
            client.query(qry, [usaco, id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to update usaco division", err);
                }
                resolve(true);
            });
        });
    });
}
async function updateCF(id, cf) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE users SET cf_handle = $1 WHERE id = $2;`;
            client.query(qry, [cf, id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to update cf handle", err);
                    resolve(false);
                }
                resolve(true);
            });
        });
    });
}
async function updateCFRating() {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users WHERE cf_handle IS NOT NULL`;
            client.query(qry, [], (err, results) => {
                if (err) {
                    console.log("An error occured while querying to update cf rating", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                let url = "https://codeforces.com/api/user.info?handles="
                for (let i = 0; i < results.rows.length; i++) {
                    url += results.rows[i].cf_handle;
                    if (i + 1 < results.rows.length) url+=";";
                }
                fetch(url).then(response => {
                    if (!response.ok) {
                        throw new Error('CF API response was not ok: '+url);
                    }
                    return response.json();
                }).then(data => {
                    if (data["status"]!="OK") {
                        throw new Error('CF API response was not ok: '+url);
                    }
                    data = data["result"];
                    for (let i = 0; i < results.rows.length; i++) {
                        let qry2 = `UPDATE users SET cf_rating = $1 WHERE id = $2;`;
                        if (isNaN(data[i].maxRating)) {
                            data[i].maxRating = 0;
                        }
                        client.query(qry2, [data[i].maxRating, results.rows[i].id], (err, res) => {
                            if (err) {
                                console.log("An error occured while querying to update cf rating", err);
                                resolve(false);
                            }
                        });
                    }
                    release();
                    resolve(true);
                }).catch(error => {
                    console.log('Error when using CF API', error);
                    resolve(false);
                });
            });
        });
    });
}
async function getAllContests() {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM contests;`;
            client.query(qry, [], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for contests", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    resolve(results.rows);
                }
            });
        });
    });
}
async function getContest(cid) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM contests WHERE id = $1;`;
            client.query(qry, [cid], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for contest", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    resolve(results.rows[0]);
                }
            });
        });
    });
}
async function getStats(season) {
    await updateCFRating();
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users
                WHERE LEFT(username, 4) ~ '^[0-9]+$'
                AND LEFT(username, 4)::int >= $1;`;
            client.query(qry, [season], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for contest", err);
                    resolve(false);
                }
                retarr = [];
                for (let i = 0; i < results.rows.length; i++) {
                    let ret = {
                        id: results.rows[i].id,
                        name: results.rows[i].display_name,
                        usaco: results.rows[i].usaco_division,
                        cf: results.rows[i].cf_rating
                    }
                    retarr.push(ret);
                }
                resolve(retarr);
            });
        });
    });
}

// TEAM CONTESTS BACKEND LOGIC
async function createTeam(name) {
    const client = await pl.connect();
    try {
        // Generate a unique secret code
        let secret_code;
        let exists = true;
        while (exists) {
            secret_code = crypto.randomBytes(4).toString('hex');
            const check = await client.query('SELECT 1 FROM teams WHERE secret_code = $1', [secret_code]);
            exists = check.rows.length > 0;
        }
        const result = await client.query(
            'INSERT INTO teams (name, secret_code) VALUES ($1, $2) RETURNING *', [name, secret_code]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function joinTeam(team_id, user_id) {
    const client = await pl.connect();
    try {
        // Remove user from any existing team
        await client.query('DELETE FROM team_members WHERE user_id = $1', [user_id]);
        // Add user to the new team
        await client.query(
            'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [team_id, user_id]
        );
        return true;
    } finally {
        client.release();
    }
}

async function leaveTeam(team_id, user_id) {
    const client = await pl.connect();
    try {
        await client.query(
            'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
            [team_id, user_id]
        );
        return true;
    } finally {
        client.release();
    }
}

async function getUserTeams(user_id) {
    const client = await pl.connect();
    try {
        const result = await client.query(
            'SELECT t.* FROM teams t JOIN team_members m ON t.id = m.team_id WHERE m.user_id = $1',
            [user_id]
        );
        return result.rows;
    } finally {
        client.release();
    }
}

async function getTeamMembers(team_id) {
    const client = await pl.connect();
    try {
        const result = await client.query(
            'SELECT u.* FROM users u JOIN team_members m ON u.id = m.user_id WHERE m.team_id = $1',
            [team_id]
        );
        return result.rows;
    } finally {
        client.release();
    }
}

async function getTeamById(team_id) {
    const client = await pl.connect();
    try {
        const result = await client.query('SELECT * FROM teams WHERE id = $1', [team_id]);
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function getAllTeams() {
    const client = await pl.connect();
    try {
        const result = await client.query('SELECT * FROM teams ORDER BY id ASC');
        return result.rows;
    } finally {
        client.release();
    }
}

async function getTeamBySecretCode(secret_code) {
    const client = await pl.connect();
    try {
        const result = await client.query('SELECT * FROM teams WHERE secret_code = $1', [secret_code]);
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function getAllTeamRankings() {
    const client = await pl.connect();
    try {
        // Add a contest_score column to teams if not already present
        // SELECT all teams and their contest_score, order by contest_score desc
        const result = await client.query('SELECT * FROM teams ORDER BY contest_score DESC NULLS LAST');
        return result.rows;
    } finally {
        client.release();
    }
}

// Returns [{ team_id, solved }] for a given contest_id
async function getAllTeamScores(contest_id) {
    const client = await pl.connect();
    try {
        // For each team, sum the points for accepted submissions in this contest
        const result = await client.query(`
            SELECT s.team_id, COALESCE(SUM(p.points), 0) AS solved
            FROM submissions s
            JOIN problems p ON s.problemid = p.pid
            WHERE s.contest = $1 AND s.team_id IS NOT NULL AND (s.verdict = 'Accepted' OR s.verdict = 'AC')
            GROUP BY s.team_id
            ORDER BY solved DESC
        `, [contest_id]);
        return result.rows;
    } finally {
        client.release();
    }
}

module.exports = {
    grab: (id) => {
        if (Number(id))
            return grab(id);
        return;
    },
    grabChecker: (id) => {
        if (Number(id))
            return grabChecker(id);
    },
    grabAllProblems: (isAdmin) => {
        return grabAllProblems(isAdmin);
    },
    grabSubs: (user, contest) => {
        return grabSubs(user, contest);
    },
    grabStatus: (id) => {
        if (Number(id))
            return grabStatus(id);
        return;
    },
    grabProblem: (id) => {
        if (Number(id))
            return grabProblem(id);
        return;
    },
    grabTests: (id) => {
        if (Number(id))
            return grabTests(id);
        return;
    },
    grabProfile: (id) => {
        if (Number(id))
            return grabProfile(id);
        return false;
    },
    insertSubmission: (id, verdict, runtime, memory, insight) => {
        return insertSubmission(id, verdict, runtime, memory, insight);
    },
    createSubmission: (user, code, problem, language, problemname, cid, timestamp) => {
        return createSubmission(user, code, problem, language, problemname, cid, timestamp);
    },
    addProblem: (pid, pname, cid, checkid, sol, state, tl, ml, inter, secret, inputtxt, outputtxt, samples, points) => {
        return addProblem(pid, pname, cid, checkid, sol, state, tl, ml, inter, secret, inputtxt, outputtxt, samples, points);
    },
    addChecker: (checkid, code, lang) => {
        return addChecker(checkid, code, lang);
    },
    updateChecker: (checkid, code, lang) => {
        return updateChecker(checkid, code, lang);
    },
    addSol: (pid, code, lang) => {
        return addSol(pid, code, lang);
    },
    grabUsers: () => {
        return grabUsers();
    },
    grabContestProblems: (cid) => {
        if (Number(cid))
            return grabContestProblems(cid);
        return;
    },
    validateUser: (id, password) => {
        return validateUser(id, password);
    },
    updateUSACO: (id, usaco) => {
        return updateUSACO(id, usaco);
    },
    updateCF: (id, cf) => {
        return updateCF(id, cf);
    },
    getAllContests: () => {
        return getAllContests();
    },
    getContest: (cid) => {
        return getContest(cid);
    },
    getStats: (season) => {
        return getStats(season);
    },
    createTeam,
    joinTeam,
    leaveTeam,
    getUserTeams,
    getTeamMembers,
    getTeamById,
    getAllTeams,
    getTeamBySecretCode,
    getAllTeamRankings,
    getAllTeamScores,
    pl
}
