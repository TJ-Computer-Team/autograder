const { Pool } = require('pg');

const pl = new Pool({
	user: "postgres",
	password: process.env.PGPASSWORD,
	port: 5432,
	database: "autograder",
	max: 20,
	idleTimeoutMillis: 0,
	connectionTimeoutMillis: 10000,
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
async function checkAdmin(id){
	/*
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error checking admin", err);
				res(false);
			}
			let qry = "SELECT * FROM users WHERE id=$1 AND admin=false";
			client.query(qry, [id], (err, results)=>{
				release();
				if(err){
					console.log("error while query");
					res(false);
				}
				if(results.rows.length==0){
					console.log("OOPS");
					res(false);
				}else{
					res(true);
				}
			});
		});
	});
	*/
	return true;
}
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
async function grabChecker(id) {
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
					console.log("an error occured while querying");
					resolve(false);
				}
				if (results.rows.length == 0) {
					resolve(false);
				}
				else {
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
async function grabAllProblems(cid) {
        return new Promise((resolve, reject) => {
                pl.connect((err, client, release) => {
                        if (err) {
                                console.log("Error getting client");
                                resolve(false);
                        }
                        let qry = "SELECT * FROM problems";
                        let params = [];
			if (cid != undefined) {
				qry  = "SELECT * FROM problems WHERE problems.contestid = $1";
				params = [cid]
			}
			client.query(qry, params, (err, results) => {
                                release();
                                if (err) {
                                        console.log("an error occured while querying");
                                        resolve(false);
                                }
                                if (results.rows.length == 0) {
                                        resolve(false);
                                }
                                else {
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
			let qry = undefined;
			let params = [];
			if (contest == undefined && user == undefined) {
				qry = "SELECT * FROM submissions";
			}
			else if (contest == undefined) {
				qry = "SELECT * FROM submissions WHERE submissions.user = $1";
				params.push(user);
			}
			else if (user == undefined) {
				qry = "SELECT * FROM submissions WHERE submissions.contest = $1";
				params.push(contest);
			}
			else {
				qry = "SELECT * FROM submissions WHERE submissions.usr = $1 AND submissions.contest = $2";
				params.push(user);
				params.push(contest);
			}
			client.query(qry, params, (err, results) => {
				release();
				if (err) {
					console.log("an error occured while querying", err);
					resolve(false);
				}
				if (results.rows.length == 0) {
					resolve(false);
				}
				else {
					retarr = [];
					for (let i=0; i<results.rows.length; i++) {
						let ret = {
							user: results.rows[i].usr,
							id: results.rows[i].id,
							verdict: results.rows[i].verdict,
							runtime: results.rows[i].runtime,
							problemname: results.rows[i].problemname,
							problemid: results.rows[i].problemid
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
async function grabTests(id) {
	return new Promise((resolve, reject) => {
		pl.connect((err, client, release) => {
			if (err) {
				console.log("Error getting client");
				resolve(false);
			}
			let qry = "SELECT * FROM test WHERE pid= $1";
			client.query(qry, [id], (err, results) => {
				release();
				if (err) {
					console.log("an error occured while querying");
					resolve(false);
				}
				if (results.rows.length == 0) {
					resolve(false);
				}
				else {
					resolve(results.rows);
				}
			});
		});
	});
}
async function updateTestSol(id, ans) {
	return new Promise((resolve, reject) => {
		pl.connect((err, client, release) => {
			if (err) {
				console.log("Error getting client");
				resolve(false);
			}
			let qry = `UPDATE test SET ans= $1 WHERE id = $2;`;
			client.query(qry,[ans, id], (err, results) => {
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
async function grabProblem(id) {
	return new Promise((resolve, reject) => {
		pl.connect((err, client, release) => {
			if (err) {
				console.log("Error getting client");
				resolve(false);
			}
			//console.log("IDD");
			//console.log(id);
			let qry = "SELECT * FROM problems WHERE pid = $1";
			client.query(qry,[id], (err, results) => {
				release();
				if (err) {
					console.log(results);
					console.log(err);
				}
				if (results.rows.length == 0) {
					resolve(false);
				}else{
					let ret = {
						name: results.rows[0].name,
						cid: results.rows[0].contestid,
						tl: results.rows[0].tl,
						ml: results.rows[0].ml,
						sol: results.rows[0].solution,
						lang: results.rows[0].sollang,
						checkid: results.rows[0].checkerid
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
			let qry = `UPDATE submissions SET verdict = $1, runtime = $2,memory = $3 WHERE id = $4;`;
			client.query(qry,[verdict, runtime, memory, id], (err, results) => {
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
async function createSubmission(user, code, problem, language, problemname, cid) {
	return new Promise((resolve, reject) => {
		pl.connect((err, client, release) => {
			if (err) {
				console.log("Error getting client");
				resolve(false);
			}
			let qry = `INSERT INTO submissions (usr, code, problemid, language, runtime, memory, verdict, problemname, contest) values ($1, $2, $3, $4, -1, -1, 'RN', $5, $6) RETURNING id`;
			let vals = [user, code, problem, language, problemname, cid];
			client.query(qry, vals, (err, results) => {
				release();
				if (err) {
					console.log("an error occured while querying", err);
					resolve(false);
				}
				else if (results.rows.length == 0) {
					resolve(false);
				}
				else {
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
                                        console.log("an error occured while querying");
                                        resolve(false);
                                }
                                if (results.rows.length == 0) {
                                        resolve(false);
                                }
                                else {
                                        res = {
						username: results.rows[0].username,
						name: results.rows[0].display_name
					}
					resolve(res);
                                }
                        });
                });
        });
}
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
async function getProblems(){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error getting prolbems");
				res(false);
			}
			let qry = "SELECT * FROM problems WHERE secret=false";//or u have access
			client.query(qry, (err, results)=>{
				release();
				if(err){
					console.log("error while query");
					res(false);
				}
				if(results.rows.length==0){
					res(false);
				}else{
					res(results.rows);
				}
			});
		});
	});
}
async function getUserProblems(){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			let qry = 'SELECT ';
		});
	});
}
async function addTest(tid,pts, pid, tval){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			//console.log(tval, pid);
			let qry = `INSERT INTO test (points,pid, test)
			VALUES ($1, $2, $3) RETURNING id;`;
			client.query(qry, [pts, pid, tval], (err, results)=>{
				release();
				if(err){
					console.log(err);
					console.log("HE");
					console.log("error while query");
					res(false);
				}
				res(true);
			});
		});
	});
}
async function updateTest(tid,pts, pid, tval){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			console.log(tval, pid);
			let qry = `UPDATE test SET points=$1, pid=$2, tval=$3 WHERE id=$4;`;
			client.query(qry, [pts, pid, tval, 1], (err, results)=>{
				release();
				if(err){
					console.log(err);
					console.log("HE");
					console.log("error while query");
					res(false);
				}
				res(true);
			});
		});
	});
}
async function updateChecker(checkid, checkercode, lang){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			let qry = `UPDATE CHECKER SET code=$1, lang=$2 WHERE id = $3;`;
			client.query(qry, [checkercode, lang, checkid], (err, results)=>{
				release();
				if(err){
					console.log(err);
					console.log("HE");
					console.log("error while query");
					res(false);
				}
				res(true);
			});
		});
	});
}
async function addChecker(checkid, checkercode, lang){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			let qry = `INSERT INTO checker (code, lang)
			VALUES ($1, $2) RETURNING id;`;
			client.query(qry, [checkercode, lang], (err, results)=>{
				release();
				if(err){
					console.log(err);
					console.log("HE");
					console.log("error while query");
					res(false);
				}
				res(true);
			});
		});
	});
}
async function addSol(pid, code, lang){//FIX
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			let qry = `UPDATE problems SET solution=$1, sollang=$3
			WHERE pid=$2`;
			console.log("lang", lang);
			client.query(qry, [code, pid, lang], (err, results)=>{
				release();
				if(err){
					console.log(err);
					console.log("HE");
					console.log("error while query");
					res(false);
				}
				res(true);
			});
		});
	});
}
async function addProblem(pid, pname,cid,checkid, sol, state, tl, ml, inter, secret){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			console.log(pid);
			// pid | name | contestid | checkerid | solution | statement | tl | ml | interactive | secret 
			let qry = `INSERT INTO problems (pid, name, contestid, checkerid,solution, statement, tl, ml, interactive, secret, points)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1000) ON CONFLICT (pid)
			DO UPDATE SET 
				name = excluded.name,
				contestid= excluded.contestid,
				checkerid= excluded.checkerid,
				statement= excluded.statement,
				tl= excluded.tl,
				ml= excluded.ml,
				interactive= excluded.interactive,
				secret= excluded.secret,
				points = 1000

			`;
			client.query(qry, [pid, pname, cid, checkid, sol, state, tl, ml, inter, secret], (err, results)=>{
				release();
				if(err){
					console.log(err);
					console.log("error while query");
					res(false);
				}
				res(results);
			});
		});
	});
}
async function grabUsers(){
        return new Promise((res, rej)=>{
                pl.connect((err, client, release)=>{
                        if(err){
                                console.log("Error getting prolbems");
                                res(false);
                        }
                        let qry = "SELECT * FROM users;";
                        client.query(qry, (err, results)=>{
                                release();
                                if(results.rows.length==0){
                                        res(false);
                                }else{
                                        res(results.rows);
                                }
                        });
                });
        });
}
async function grabContestProblems(cid) {
	return new Promise((res, rej)=>{
                pl.connect((err, client, release)=>{
                        if(err){
                                console.log("Error getting prolbems");
                                res(false);
                        }
                        let qry = `SELECT * FROM problems WHERE contestid = $1`;
                        client.query(qry, [cid], (err, results)=>{
                                release();
                                if(results.rows.length==0){
                                        res(false);
                                }else{
                                        res(results.rows);
                                }
                        });
                });
        });
}
module.exports = {
	grab: (id) => {
		return grab(id);
	},
	grabChecker: (id) => {
		return grabChecker(id);
	},
	grabAllProblems: (cid) => {
		return grabAllProblems(cid);
	},
	grabSubs: (user, contest) => {
		return grabSubs(user, contest);
	},
	grabStatus: (id) => {
		return grabStatus(id);
	},
	grabProblem: (id) => {
		return grabProblem(id);
	},
	grabTests: (id)=>{
		return grabTests(id);
	},
	grabProfile: (id)=>{
		return grabProfile(id);
	},
	insertSubmission: (id, verdict, runtime, memory) => {
		return insertSubmission(id, verdict, runtime, memory);
	},
	createSubmission: (user, code, problem, language, problemname, cid) => {
		return createSubmission(user, code, problem, language, problemname, cid);
	},
	updateTestSol: (id, sol)=>{
		return updateTestSol(id, sol);
	},
	testSql: () => {
		return testSql();
	},
	addProblem: (pid, pname,cid, checkid,sol, state, tl, ml, inter, secret) => {
		return addProblem(pid, pname,cid,checkid, sol,state, tl, ml, inter, secret);
	},
	addChecker: (checkid, code, lang)=>{
		return addChecker(checkid, code, lang);
	},
	updateChecker: (checkid, code, lang)=>{
		return updateChecker(checkid, code, lang);
	},
	addTest: (tid, pts, pid, test)=>{
		return addTest(tid, pts, pid, test);
	},
	updateTest: (tid, pts, pid, test)=>{
		return updateTest(tid, pts, pid, test);
	},
	addSol: (pid, code, lang)=>{
		return addSol(pid, code,lang);
	},
	getProblems: () =>{
		return getProblems();
	},
	checkAdmin: (id) =>{
		return checkAdmin(id);
	},
	grabUsers: () => {
		return grabUsers();
	},
	grabContestProblems: (cid) => {
		return grabContestProblems(cid);
	}
}
