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

// async function addSol(pid, code, lang) { // not in use
//     return new Promise((resolve, reject) => {
//         pl.connect((err, client, release) => {
//             if (err) {
//                 console.log("Error getting client");
//                 resolve(false);
//             }
//             let qry = `UPDATE problems SET solution=$1, sollang=$3 WHERE pid=$2`;
//             client.query(qry, [code, pid, lang], (err, results) => {
//                 release();
//                 if (err) {
//                     console.log("Error while querying");
//                     resolve(false);
//                 }
//                 resolve(true);
//             });
//         });
//     });
// }

// async function addTest(tid, pid, tval) { // not in use
//     return new Promise((resolve, reject) => {
//         pl.connect((err, client, release) => {
//             if (err) {
//                 console.log("Error getting client");
//                 resolve(false);
//             }
//             let qry = `INSERT INTO test (points,pid, test) VALUES ($1, $2, $3) RETURNING id;`;
//             client.query(qry, [pts, pid, tval], (err, results) => {
//                 release();
//                 if (err) {
//                     console.log("Error while querying");
//                     resolve(false);
//                 }
//                 resolve(true);
//             });
//         });
//     });
// }


module.exports = {
    grab: (id) => {
        if (Number(id))
            return grab(id);
        return;
    },
    grabProblem: (id) => {
        if (Number(id))
            return grabProblem(id);
        return;
    },
    grabAllProblems: (isAdmin) => {
        return grabAllProblems(isAdmin);
    },
    grabTests: (id) => {
        if (Number(id))
            return grabTests(id);
        return;
    },
    addProblem: (pid, pname, cid, checkid, sol, state, tl, ml, inter, secret, inputtxt, outputtxt, samples, points) => {
        return addProblem(pid, pname, cid, checkid, sol, state, tl, ml, inter, secret, inputtxt, outputtxt, samples, points);
    },
    grabContestProblems: (cid) => {
        if (Number(cid))
            return grabContestProblems(cid);
        return;
    },
    // addSol: (pid, code, lang) => {
    //     return addSol(pid, code, lang);
    // },
};
