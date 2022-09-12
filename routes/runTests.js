const {grabProblem, insertSubmission, grabStatus} = require("./displayProblem");
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
	console.log("HI");
    if (tasks.length == 0) {
        running = false;
        return;
    }
    let task = tasks.shift();
    let sub = tasksS.shift();
    console.log(task, sub);
    //let res = await grabProblem(task);
    //let checker = res.checker;
    //let input = res.input;
    //let tl = res.tl;
    //let ml = res.ml;

    res = await grabStatus(sub);
    console.log("result", res);
    let userCode = res.code;

    let language = res.language;

    let output = undefined, fverdict = undefined, runtime = 420, memory = 100;

    for (let i=0; i<1; i++) {
        let verdict = undefined;

        if (language == 'cpp') {
		fs.writeFileSync('test.cpp', userCode);
            //write to correct file for code
            output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/executable.cfg', { encoding: 'utf-8' });  //pipe input into this
        }
        else if (language == 'py') {
	    console.log("running python");
            fs.writeFileSync('routes/subcode/hello.py', userCode);
            try {
	    	output = await execSync('sudo ./nsjail/nsjail --config nsjail/configs/python.cfg', { encoding: 'utf-8' })
            }
            catch (error) {
	        console.log("ERROR", error);
            }
            
	    console.log("output was", output);
	    if (output.includes("dan")) {
		console.log("inclies");
		fverdict = "AC";
	    }
	    else if (output == "dan") {
 		fverdict = "AC";
		console.log("here", fverdict);
	    }
            else {
	 	fverdict = "WA";
	    }
        }
        else if (language == 'java') {
		fs.writeFileSync('test.java', userCode);
            output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/java.cfg', { encoding: 'utf-8' });  
        }
      //  verdict = execSync('sudo ./nsjail/nsjail --config nsjail/configs/checker.cfg', { encoding: 'utf-8' }); //pipe output into this 
    }
    console.log("after run", fverdict);
    insertSubmission(sub, fverdict, runtime, memory);

    //checker = undefined;
    userCode = undefined;
    //input = undefined;
    run();
}

module.exports = {
    queue: (pid, sid) => {
        return queue(pid, sid);
    }
}