const {
    grabProblem,
    insertSubmission,
    grabStatus
} = require("./sql/sql");
const axios = require('axios');
const querystring = require('querystring');

// Import the new services
const CodeRunnerService = require('../services/codeRunner');
const cfAPI = require('../services/cfAPI');
const testCaseService = require('../services/testCaseService');

const codeRunner = new CodeRunnerService();

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
        
        try {
            // Get problem details
            let problem = await grabProblem(task);
            if (!problem) {
                insertSubmission(sub, "ERROR", 0, 0, "Problem not found");
                if (!queuePaused) run();
                return;
            }
            
            // Get submission details
            let submission = await grabStatus(sub);
            if (!submission) {
                insertSubmission(sub, "ERROR", 0, 0, "Submission not found");
                if (!queuePaused) run();
                return;
            }
            
            // Use the new CodeRunnerService for better handling
            const result = await codeRunner.runSubmission({
                problemId: task,
                code: submission.code,
                language: submission.language,
                timeLimit: problem.tl,
                memoryLimit: problem.ml
            });
            
            // Insert the result
            insertSubmission(sub, result.verdict, result.time || 0, result.memory || 0, result.output);
            
        } catch (error) {
            console.error('Error running submission:', error);
            insertSubmission(sub, "ERROR", 0, 0, "Grading server error:\n" + error.message);
        }
        
        if (!queuePaused) run();
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
