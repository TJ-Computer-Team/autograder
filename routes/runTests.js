const {testSql, grabProblem, insertSubmission, grabStatus, grabTests, updateTestSol, grabChecker} = require("./sql");
const execSync = require('child_process').execSync;
const axios = require('axios');
const fs = require('fs');
const querystring = require('querystring');


let tasks = [], tasksS = [];
let running = false;
function queue(pid, sid) {
	tasks.push(pid);
	tasksS.push(sid);
	console.log(pid, sid);
	if (!running) {
		run();
		running = true;
	}
}
async function run() {
        if (tasks.length == 0) {
                running = false;
                return;
        }
        let task = tasks.shift();
        let sub = tasksS.shift();
        console.log(task, sub);
        let res = await grabProblem(task);
        let checkid = res.checkid;
        let tl = res.tl;
        let ml = res.ml;
        res = await grabStatus(sub);
        let userCode = res.code;

        let language = res.language;

        let output = undefined, fverdict = "ER", runtime = -1, memory = 100;

        console.log("\n\n\n-------------------");



        await axios.post('http://10.150.0.3:8080/run', querystring.stringify({lang: language, problemid: String(task), code: userCode}))
        .then(res => {
		return res['data']
        }).then(res =>{
		insertSubmission(sub, res.verdict, res.tl, memory, res.output);
		run();

	}).catch((error) => {
		console.log("ERROR OOPS");
                console.log(error);
		insertSubmission(sub, "ERROR", res.tl, memory, res.output);
		run();
        });



}

module.exports = {
	queue: (pid, sid) => {
		return queue(pid, sid);
	},
	compileTests: (pid) => {
		return compileTests(pid);
	}
}
