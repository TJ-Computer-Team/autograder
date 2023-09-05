const {grabProblem, insertSubmission, grabStatus, grabTests, updateTestSol, grabChecker} = require("./sql");
const execSync = require('child_process').execSync;
const fs = require('fs');


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
        let tests = await grabTests(task);
        let checkid = res.checkid;
        let tl = res.tl;
        let ml = res.ml;
        res = await grabStatus(sub);
        let userCode = res.code;

        let language = res.language;

        let output = undefined, fverdict = "AC", runtime = 420, memory = 100;

        console.log("\n\n\n-------------------");


        await axios.get('http://10.150.0.3/run')
        .then(res => {
                console.log(res);
        }).catch((error) => {
                console.log(error);
        });

        await axios.post('http://10.150.0.3/penis', {"wow": "hi"})
        .then(res => {
                console.log(res);
        }).catch((error) => {
                console.log(error);
        });

        console.log("THIS IS FAKE RUNNING. FIRST \n\n\n\n");
        await sleep(10000);
        console.log("SECOND \n\n\n\n");


        insertSubmission(sub, fverdict, runtime, memory);
        run();
}

module.exports = {
	queue: (pid, sid) => {
		return queue(pid, sid);
	},
	compileTests: (pid) => {
		return compileTests(pid);
	}
}
