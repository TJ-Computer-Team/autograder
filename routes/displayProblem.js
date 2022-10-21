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
async function checkAdmin(id){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error checking admin");
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
					res(false);
				}else{
					res(true);
				}
			});
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
			let qry = "SELECT * FROM problems WHERE id = $1";
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
			let qry = "SELECT * FROM submissions WHERE submissions.usr = $1";
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
async function grabProblem(id) {
	return new Promise((resolve, reject) => {
		pl.connect((err, client, release) => {
			if (err) {
				console.log("Error getting client");
				resolve(false);
			}
			console.log("IDD");
			console.log(id);
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
						tl: results.rows[0].tl,
						ml: results.rows[0].ml
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
async function createSubmission(user, code, problem, language) {
	return new Promise((resolve, reject) => {
		pl.connect((err, client, release) => {
			if (err) {
				console.log("Error getting client");
				resolve(false);
			}
			let qry = `INSERT INTO submissions (usr, code, problemid, language, runtime, memory, verdict, problemname) values ($1, $2, $3, $4, -1, -1, 'RN', 'doesnotexist') RETURNING id`;
			let vals = [user, code, problem, language];
			client.query(qry, vals, (err, results) => {
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
	grabTests: (id)=>{
		return grabTests(id);
	},
	grabProfile: (id)=>{
		return grabProfile(id);
	},
	insertSubmission: (id, verdict, runtime, memory) => {
		return insertSubmission(id, verdict, runtime, memory);
	},
	createSubmission: (user, code, problem, language) => {
		return createSubmission(user, code, problem, language);
	},
	testSql: () => {
		return testSql();
	},
	checkAdmin: (id) => {
		return checkAdmin(id);
	}
}
