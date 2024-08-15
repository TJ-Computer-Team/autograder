const {
    grabProblem,
    insertSubmission,
    grabStatus
} = require("./sql");
const axios = require('axios');
const querystring = require('querystring');

let tasks = [],
    tasksS = [];
let running = false;
let queuePaused = false;

function queue(pid, sid) {
    tasks.push(pid);
    tasksS.push(sid);
    if (!running && !queuePaused) {
        run();
        running = true;
    }
}
async function run() {
    running = true;
    if (tasks.length == 0) {
        running = false;
        return;
    } else {
        let task = tasks.shift();
        let sub = tasksS.shift();
        console.log("Running task:", task, sub);
        let res = await grabProblem(task);
        let checkid = res.checkid;
        let tl = res.tl;
        let ml = res.ml;
        res = await grabStatus(sub);
        let userCode = res.code;
        let language = res.language;
        let output = undefined,
            fverdict = "ER",
            runtime = -1,
            memory = 100;

        await axios.post('http://10.150.0.3:8080/run', querystring.stringify({
            lang: language,
            problemid: String(task),
            code: userCode
        })).then(res => {
            return res['data']
        }).then(res => {
            insertSubmission(sub, res.verdict, res.tl, memory, res.output);
            if (!queuePaused) run();
        }).catch((error) => {
            insertSubmission(sub, "ERROR", res.tl, memory, "Grading server error:\n" + error);
            if (!queuePaused) run();
        });
    }
}

module.exports = {
    queue: (pid, sid) => {
        return queue(pid, sid);
    },
    compileTests: (pid) => {
        return compileTests(pid);
    },
    getQueue: () => {
        payload = {
            tasks: tasksS,
            paused: queuePaused,
        }
        return payload;
    },
    toggleQueue: (status) => {
        queuePaused = status;
        return;
    },
    run: () => {
        run();
        return;
    },
    skip: (sid) => {
        for (let i = 0; i < tasks.length; i++) {
            if (tasksS[i] == sid) {
                tasksS.splice(i, 1);
                tasks.splice(i, 1);
                insertSubmission(sid, "SKIPPED", 0, 0, "Your submission was manually skipped by an admin");
                break;
            }
        }
        return;
    }
}
