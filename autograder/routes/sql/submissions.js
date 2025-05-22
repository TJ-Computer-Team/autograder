const pl = require('./db');

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



module.exports = {
    grabSubs: (user, contest) => {
        return grabSubs(user, contest);
    },
    grabStatus: (id) => {
        if (Number(id))
            return grabStatus(id);
        return;
    },
    insertSubmission: (id, verdict, runtime, memory, insight) => {
        return insertSubmission(id, verdict, runtime, memory, insight);
    },
    createSubmission: (user, code, problem, language, problemname, cid, timestamp) => {
        return createSubmission(user, code, problem, language, problemname, cid, timestamp);
    },
};
