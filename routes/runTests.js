const {grabProblem, insertSubmission, grabStatus} = require("./displayProblem");
const execSync = require('child_process').execSync;

let tasks = [], tasksS = [];
let running = false;
function queue(pid, sid) {
    tasks.push(pid);
    tasksS.push(sid);
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
    let res = await grabProblem(task);
    let checker = res.checker;
    let input = res.input;
    let tl = res.tl;
    let ml = res.ml;

    res = await grabStatus(sub);
    let userCode = res.code;
    let language = res.language;

    let output = undefined, fverdict = undefined, runtime = undefined, memory = undefined;
    for (let i=0; i<input.length; i++) {
        let verdict = undefined;
        if (language == 'executable') {
            //write to correct file for code
            output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/executable.cfg', { encoding: 'utf-8' });  //pipe input into this
        }
        else if (language == 'python') {
            output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/python.cfg', { encoding: 'utf-8' });  
        }
        else if (language == 'java') {
            output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/java.cfg', { encoding: 'utf-8' });  
        }
        verdict = execSync('sudo ./nsjail/nsjail --config nsjail/configs/checker.cfg', { encoding: 'utf-8' }); //pipe output into this 
    }

    insertSubmission(task, fverdict, runtime, memory);

    checker = undefined;
    userCode = undefined;
    input = undefined;
    run();
}

module.exports = {
    queue: (id) => {
        return queue(id);
    }
}