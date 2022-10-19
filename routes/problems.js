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
async function addTest(tval, pid){
}
async function addChecker(checkid, checkercode){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			let qry = `INSERT INTO checker (code)
			VALUES ($1) RETURNING id;`;
			client.query(qry, [checkercode], (err, results)=>{
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
async function addProblem(pname,cid,checkid, sol, state, tl, ml, inter, secret){
	return new Promise((res, rej)=>{
		pl.connect((err, client, release)=>{
			if(err){
				console.log("Error adding problem");
				res(false);
			}
			// pid | name | contestid | checkerid | solution | statement | tl | ml | interactive | secret 
			let qry = `INSERT INTO problems (name, contestid, checkerid,solution, statement, tl, ml, interactive, secret)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING pid;`;
			client.query(qry, [pname, cid, checkid, sol, state, tl, ml, inter, secret], (err, results)=>{
				release();
				if(err){
					console.log(err);
					console.log("error while query");
					res(false);
				}
				res(true);
			});
		});
	});
}
module.exports = {
	testSql: ()=>{
		return testSql();
	},
	addProblem: (pname,cid, checkid,sol, state, tl, ml, inter, secret) => {
		return addProblem(pname,cid,checkid, sol,state, tl, ml, inter, secret);
	},
	addChecker: (checkid, code)=>{
		return addChecker(checkid, code);
	},
	getProblems: () =>{
		return getProblems();
	}
}
