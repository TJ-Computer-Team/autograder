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
async function compileTests(pid){
	let problem= await grabProblem(pid);
	console.log(problem);
	let solution = problem.sol;
	let lang = problem.lang;
	await grabTests(pid).then((tests)=>{
		for(let i = 0; i<tests.length; i++){
			fs.writeFileSync('test.in', tests[i].test);
			console.log("tests", tests[i].test);
			if (lang== 'cpp') {
				fs.writeFileSync('routes/subcode/test.cpp', solution);
				//write to correct file for code
				//output = execSync('test.in<sudo ./nsjail/nsjail --config nsjail/configs/executable.cfg', { encoding: 'utf-8' });  //pipe input into this
			}
			else if (lang== 'python') {
				console.log(solution);
				console.log("running python");
				fs.writeFileSync('routes/subcode/hello.py', solution);
				try {
					//output = await execSync('sudo ./nsjail/nsjail --config nsjail/configs/python.cfg > test.in', { encoding: 'utf-8' });
					//JOHNNY I CHNGED UR CODE CUZ IT WOULDNT COMPILE SRY
					output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/python.cfg < test.in', { encoding: 'utf-8' });
				}
				catch (error) {
					console.log("ERROR", error);
				}
				console.log("output was", output);
				updateTestSol(tests[i].id, output);
			}
			else if (lang== 'java') {
				fs.writeFileSync('routes/subcode/test.java', solution);
				output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/java.cfg', { encoding: 'utf-8' });  
			}
			//fs.writeFileSync('test.cpp', solCode);
			//addSol(i.id, ans);
		}
	});
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

	for(let i = 0; i<tests.length; i++){
		let verdict = undefined;
		fs.writeFileSync('test.in', tests[i].test);
		if (language == 'cpp') {
			fs.writeFileSync('routes/subcode/test.cpp', userCode);
			//write to correct file for code
			let wow = execSync('g++ routes/subcode/test.cpp');
			output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/executable.cfg < test.in', { encoding: 'utf-8' });  //pipe input into this
		}
		else if (language == 'python') {
			console.log("running python");
			fs.writeFileSync('routes/subcode/hello.py', userCode);
			try {
				//output = await execSync('sudo ./nsjail/nsjail --config nsjail/configs/python.cfg > test.in', { encoding: 'utf-8' });
				//JOHNNY I CHNGED UR CODE CUZ IT WOULDNT COMPILE SRY
				output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/python.cfg < test.in', { encoding: 'utf-8' });
			}
			catch (error) {
				console.log("ERROR", error);
			}

		}
		else if (language == 'java') {
			fs.writeFileSync('test.java', userCode);
			output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/java.cfg', { encoding: 'utf-8' });  
		}
		console.log("output was", output);
		fs.writeFileSync('test.in', output);
		fs.writeFileSync('test.out', tests[i].ans);
		let check= await grabChecker(checkid);
		let ccode = check.code;
		let lang= check.lang;
		if (lang== 'cpp') {
			fs.writeFileSync('routes/subcode/test.cpp', ccode);
			let wow = execSync('g++ routes/subcode/test.cpp');
			//write to correct file for code
			output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/executable.cfg', { encoding: 'utf-8' });  //pipe input into this
		}
		else if (lang== 'python') {
			console.log(solution);
			console.log("running python");
			fs.writeFileSync('routes/subcode/hello.py', ccode);
			output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/python.cfg < test.in', { encoding: 'utf-8' });
			//updateTestSol(tests[i].id, output);
		}
		else if (lang== 'java') {
			fs.writeFileSync('test.java', ccode);
			output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/java.cfg', { encoding: 'utf-8' });  
		}
		if(!output.includes("AC")){
			console.log("WORNG", output);
			console.log("CHECKER IS ", check);
			fverdict = "WA";
			break;
		}
	}
	insertSubmission(sub, fverdict, runtime, memory);

	//checker = undefined;
	userCode = undefined;
	//input = undefined;
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
