const { Pool } = require('pg');

const pl = new Pool({
    user: "postgres",
    password: process.env.PGPASSWORD,
    port: 5432,
    database: "autograder",
    max: 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
    allowExitOnIdle: true
});

async function testSql() {
    pl.connect((err, client, release) => {
        if (err) {
            console.log("Error getting client");
            return;
        }
        let qry = "SELECT * FROM users;";
        client.query(qry, (err, result) => {
            release();
            if (err) {
                console.log("an error occured while querying");
                return false;
            }
            console.log(result.rows);
        });
    });
}
async function grab(id) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM problems WHERE id = " + id;
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("an error occured while querying");
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                else {
                    let ret = {
                        id: id,
                        title: results.rows[0].name,
                        statement: results.rows[0].statement
                    }
                    resolve(ret);
                }
            });
        });
    });
}
async function grabSubs(id) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM submissions WHERE submissions.usr = " + id;
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("an error occured while querying");
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                else {
                    retarr = [];
                    for (let i=0; i<results.rows.length; i++) {
                        let ret = {
                            user: id,
                            id: results.rows[i].id,
                            verdict: results.rows[i].verdict,
                            runtime: results.rows[i].runtime,
                            problemname: results.rows[i].problemname
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
            let qry = "SELECT * FROM submissions WHERE id = " + id;
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("an error occured while querying");
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                else {
                    let ret = {
                        user: id,
                        verdict: results.rows[0].verdict,
                        runtime: results.rows[0].runtime,
                        problemname: results.rows[0].problemname,
                        problemid: results.rows[0].problemid,
                        code: results.rows[0].code,
                        language: results.rows[0].language
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
            let qry = "SELECT * FROM problems WHERE id = " + id;
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("an error occured while querying");
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                else {
                    let ret = {
                        checker: results.rows[0].checkerBinary,
                        tl: results.rows[0].tl,
                        ml: results.rows[0].ml,
                        input: results.rows[0].tests
                    }
                    resolve(ret);
                }
            });
        });
    });
}
async function insertSubmission(id, verdict, runtime, memory) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE submissions SET verdict = '${verdict}', runtime = ${runtime},memory = ${memory} WHERE id = ${id};`;
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("an error occured while querying");
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                else {
                    resolve(false);
                }
            });
        });
    });
}
async function createSubmission(user, code, problem, language) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `INSERT INTO submissions (usr, code, problemid, language, runtime, memory, verdict, problemname) values (${user}, '${code}', ${problem}, '${language}', -1, -1, 'RN', 'doesnotexist') RETURNING id`;
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("an error occured while querying");
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                else {
                    resolve(results.rows[0].id);
                }
            });
        });
    });
}
module.exports = {
    grab: (id) => {
        return grab(id);
    },
    grabSubs: (id) => {
        return grabSubs(id);
    },
    grabStatus: (id) => {
        return grabStatus(id);
    },
    grabProblem: (id) => {
        return grabProblem(id);
    },
    insertSubmission: (id, verdict, runtime, memory) => {
        return insertSubmission(id, verdict, runtime, memory);
    },
    createSubmission: (user, code, problem, language) => {
        return createSubmission(user, code, problem, language);
    },
    testSql: () => {
        return testSql();
    }
}
