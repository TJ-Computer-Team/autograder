const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { promisify } = require('util');
const rimrafCallback = require('rimraf');
const rimraf = promisify((path, callback) => rimrafCallback(path, callback));
const {
    add
} = require("./sql");

const TEMP_DIR = path.join(__dirname, '../subcode');
const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB

class CodeRunner {
    constructor() {
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }
    }

    async cleanup() {
        try {
            await rimraf(TEMP_DIR);
            this.ensureTempDir();
        } catch (error) {
            console.error('Error cleaning up temp directory:', error);
        }
    }

    generateTempFilename() {
        return path.join(TEMP_DIR, `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }

    async writeCodeToFile(code, extension) {
        const filename = this.generateTempFilename() + extension;
        await fs.promises.writeFile(filename, code);
        return filename;
    }

    parseMemoryOutput(output) {
        try {
            const match = output.match(/Memory used: (\d+)/);
            return match ? parseInt(match[1]) : 0;
        } catch (error) {
            console.error('Error parsing memory output:', error);
            return 0;
        }
    }

    formatError(error) {
        if (error.killed) {
            return 'Time Limit Exceeded';
        }
        if (error.code === 'ENOENT') {
            return 'Compilation Error: Required compiler/interpreter not found';
        }
        return error.message || 'Unknown Error';
    }

    async runPython(filename, input, timeLimit) {
        // Create a wrapper script that handles input properly
        const wrapperScript = `
import resource, sys, time

def run_code():
    # Read the input file line by line
    with open('${input}', 'r') as f:
        # Store all lines in memory
        input_lines = f.readlines()
    
    # Create a custom input function that returns lines one at a time
    input_iter = iter(input_lines)
    def custom_input(*args):
        try:
            line = next(input_iter)
            return line.rstrip('\\n')
        except StopIteration:
            raise EOFError("No more input")

    # Replace built-in input with our custom version
    __builtins__.input = custom_input
    
    # Load and run the user's code
    with open('${filename}', 'r') as f:
        code = compile(f.read(), '${filename}', 'exec')
        namespace = {}
        exec(code, namespace)

start = time.time()
run_code()
end = time.time()

# Print resource usage
memory = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
print('\\nMemory used:', memory, file=sys.stderr)
print('\\nTime used:', int((end - start) * 1000), 'ms', file=sys.stderr)
`;

        try {
            // Write the wrapper script to a file
            const wrapperFile = this.generateTempFilename() + '_wrapper.py';
            await fs.promises.writeFile(wrapperFile, wrapperScript);

            // Execute the wrapper script
            const output = execSync(`python3 ${wrapperFile}`, {
                encoding: 'utf8',
                timeout: timeLimit,
                maxBuffer: MAX_OUTPUT_SIZE
            });
            return { output, error: null };
        } catch (error) {
            return { output: null, error };
        }
    }

    async runCpp(filename, input, timeLimit) {
        const executablePath = filename.replace('.cpp', '');
        
        try {
            // Compile with optimizations and warnings
            execSync(`g++ -Wall -O2 -std=c++17 "${filename}" -o "${executablePath}"`, {
                encoding: 'utf8'
            });

            // Run with input file to preserve exact format
            const cmd = `cat "${input}" | "${executablePath}" 2>&1`;

            const output = execSync(cmd, {
                encoding: 'utf8',
                timeout: timeLimit,
                maxBuffer: MAX_OUTPUT_SIZE
            });

            return { output, error: null };
        } catch (error) {
            if (!error.stdout && !error.stderr) {
                return { output: null, error };
            }
            return {
                output: error.stdout,
                error: error.stderr.includes('Memory used:') ? null : error
            };
        }
    }

    async runJava(filename, input, timeLimit) {
        const className = path.basename(filename, '.java');
        const classDir = path.dirname(filename);

        try {
            // Compile
            execSync(`javac "${filename}"`, { encoding: 'utf8' });

            // Run with input file to preserve exact format
            const cmd = `cd "${classDir}" && cat "${input}" | java -Xmx512m "${className}" 2>&1`;

            const output = execSync(cmd, {
                encoding: 'utf8',
                timeout: timeLimit * 2, // Java needs more time for JVM startup
                maxBuffer: MAX_OUTPUT_SIZE
            });

            return { output, error: null };
        } catch (error) {
            if (!error.stdout && !error.stderr) {
                return { output: null, error };
            }
            return {
                output: error.stdout,
                error: error.stderr.includes('Memory used:') ? null : error
            };
        }
    }

    async run(code, lang, input, timeLimit, memoryLimit) {
        let result = {
            verdict: 'Accepted',
            output: '',
            time: 0,
            memory: 0
        };

        try {
            let filename;
            let runResult;

            switch (lang.toLowerCase()) {
                case 'python':
                    filename = await this.writeCodeToFile(code, '.py');
                    runResult = await this.runPython(filename, input, timeLimit);
                    break;
                case 'cpp':
                    filename = await this.writeCodeToFile(code, '.cpp');
                    runResult = await this.runCpp(filename, input, timeLimit);
                    break;
                case 'java':
                    filename = await this.writeCodeToFile(code, '.java');
                    runResult = await this.runJava(filename, input, timeLimit);
                    break;
                default:
                    throw new Error(`Unsupported language: ${lang}`);
            }

            if (runResult.error) {
                const errorMsg = this.formatError(runResult.error);
                if (errorMsg.includes('Time Limit Exceeded')) {
                    result.verdict = 'Time Limit Exceeded';
                    result.time = timeLimit;
                } else {
                    result.verdict = 'Runtime Error';
                    result.output = errorMsg;
                }
                return result;
            }

            // Parse memory usage
            const memory = this.parseMemoryOutput(runResult.output);
            if (memory > memoryLimit * 1024) { // Convert MB to KB
                result.verdict = 'Memory Limit Exceeded';
                result.memory = memory / 1024; // Convert KB to MB
                return result;
            }

            // Extract program output (everything before the memory/time info)
            const outputLines = runResult.output.split('\n');
            const memoryIndex = outputLines.findIndex(line => line.includes('Memory used:'));
            result.output = outputLines.slice(0, memoryIndex).join('\n').trim();
            result.memory = memory / 1024; // Convert KB to MB

            // Parse execution time
            const timeMatch = runResult.output.match(/Time used: (\d+) ms/);
            if (timeMatch) {
                result.time = parseInt(timeMatch[1]);
                if (result.time > timeLimit) {
                    result.verdict = 'Time Limit Exceeded';
                }
            }

        } catch (error) {
            console.error('Error running code:', error);
            result.verdict = 'System Error';
            result.output = this.formatError(error);
        } finally {
            // Clean up temporary files
            await this.cleanup();
        }

        return result;
    }
}

const runner = new CodeRunner();

async function addTests(pid, tid, test, out) { // not used
    let loc = "../problems/" + pid;
    if (!fs.existsSync(loc + pid)) {
        fs.mkdirSync(loc + "/sol", {
            recursive: true
        });
    }
    if (!fs.existsSync(loc + pid)) {
        fs.mkdirSync(loc + "/test", {
            recursive: true
        });
    }
    fs.writeFileSync(loc + "/test/" + tid, test);
    fs.writeFileSync(loc + "/sol/" + tid, out);
}
async function addChecker(pid, code) { // not used
    let loc = "../problems/" + pid;
    if (!fs.existsSync(loc + pid)) {
        fs.mkdirSync(loc + "/sol", {
            recursive: true
        });
    }
    if (!fs.existsSync(loc + pid)) {
        fs.mkdirSync(loc + "/test", {
            recursive: true
        });
    }
    fs.writeFileSync(loc + "/code", code);
}
async function compileTests(problem) { // not in use
    let loc = "../problems/" + problem.id;
    fs.readdir(loc, (err, files) => {
        for (i in files) {
            fs.writeFileSync(loc + "/sol/" + i, runCode(i, problem.lang, code, problem.tl, problem.ml).output);
        }
    });
}
async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function run(problem, submit) {
    let loc = "../problems/" + problem.id + "/test/";
    let loc2 = "../problems/" + problem.id + "/code";
    let checkid = problem.checkid;
    let tl = problem.tl;
    let ml = problem.ml;
    let userCode = submit.code;
    let language = submit.language;
    return new Promise((res, rej) => {
        let payload = {
            verdict: "ERROR",
            output: undefined
        }
        let maxtime = -1;
        try {
            checkerCode = fs.readFileSync(loc2, {
                encoding: 'utf8',
                flag: 'r'
            })
        } catch (error) {
            console.log("Error in run:", error);
            payload.verdict = "ERROR"
            payload.output = "Problem ID not found"
            res(payload)
        }
        fs.readdir(loc, async (err, files) => {
            if (err) {
                console.log("Error in run:", err);
                return;
            }
            let testnum = 0;
            let solved = true;
            for (_ in files) {
                i = files[_]
                console.log(loc + i);
                let outputfull;
                let output;
                let compError = false
                for (let iterations = 0; iterations < 2; iterations++) {
                    rerun = false;
                    outputfull = await runCode(loc + i, language, userCode, tl, ml, true)
                    await timeout(100);
                    output = outputfull.output;
                    if (outputfull.time > maxtime) maxtime = outputfull.time;
                    if (outputfull.time == -1) {
                        solved = false;
                        payload.verdict = "Compilation/Runtime Error"
                        if (output.includes("run time >= time limit")) {
                            rerun = true;
                            payload.verdict = "Time Limit Exceeded"
                            if (language == 'cpp') maxtime = tl;
                            else if (language == 'java') maxtime = tl * 2;
                            else if (language == 'python') maxtime = tl * 3;
                        } else if (output.includes("MemoryError") || output.includes("StackOverflowError")) {
                            payload.verdict = "Memory Limit Exceeded"
                            rerun = true;
                        }
                        payload.tl = maxtime
                        output = output.replace(/^\[I\].*/gm, '');
                        output = output.trim()
                        payload.output = output
                        console.log("Code got TLE, MLE, RTE, CPE")
                        compError = true
                    }
                    if (!rerun) {
                        break;
                    }
                }
                if (compError) {
                    res(payload);
                    break;
                }
                fs.writeFileSync("subcode/args.txt", problem.id + " " + i)
                juryAnswer = await runCode("subcode/args.txt", "python", checkerCode, -1, -1, true, true);
                await timeout(100);
                juryAnswer = juryAnswer.output;
                console.log("Timing:");
                console.log(maxtime, outputfull.time);
                if (juryAnswer.includes("run time >= time limit")) {
                    console.log("Checker timeout error");
                    payload.verdict = "ERROR";
                    payload.output = "System Error: checker timed out";
                    payload.tl = maxtime;
                    solved = false;
                    await timeout(500);
                    res(payload);
                    break;
                }
                if (!(juryAnswer.trim() === "AC" || juryAnswer.trim() === "Accepted")) {
                    payload.verdict = "Wrong Answer";
                    payload.output = "Failed on test " + testnum + ":\n" + juryAnswer;
                    if (testnum >= 1) {
                        payload.output = "Viewing as admin:\n" + payload.output;
                    }
                    payload.tl = maxtime;
                    solved = false;
                    await timeout(250);
                    res(payload);
                    break;
                }
                testnum += 1;
                compile = false;
            }
            if (solved) {
                payload.verdict = "Accepted";
                payload.tl = maxtime;
                payload.output = "All tests correct - no additional feedback"
                await timeout(250);
                res(payload);
            }
        });
    });
}
async function addProblem(pid, tl, ml, checker) { // not in use
    let loc = "../problems/" + pid;
    fs.writeFileSync(loc + "/checker.cpp", checker);
    add(pid, tl, ml);
}

module.exports = {
    run: (req, res) => {
        const { code, lang, input, tl, ml } = req.body;
        
        if (!code || !lang || !input) {
            return res.status(400).json({
                verdict: 'Invalid Request',
                output: 'Missing required parameters'
            });
        }

        runner.run(code, lang, input, tl || 2000, ml || 256)
            .then(result => res.json(result))
            .catch(error => res.status(500).json({
                verdict: 'System Error',
                output: error.message
            }));
    },
    compileTests: (problem) => {
        return compileTests(problem);
    },
    addTests: (problem, tid, test, out) => {
        return addTests(problem, tid, test, out);
    },
    addChecker: (pid, code) => {
        return addChecker(pid, code);
    }
}
