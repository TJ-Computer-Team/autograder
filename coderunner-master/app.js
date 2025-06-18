require('dotenv').config();
const express = require("express");
const app = express();
const port = 8080;
const {
    run,
    addTests,
    addChecker
} = require("./routes/runCode");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Enable CORS for the main application
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Parse JSON and URL-encoded bodies
app.use(express.json({
    limit: '1mb'
}));
app.use(express.urlencoded({
    extended: false,
    limit: '1mb'
}));

app.post("/addChecker", async (req, res) => { // not in use
    addChecker(req.body.pid, req.body.code)
    res.send("Checker added")
});

app.post("/addTest", async (req, res) => { // not in use
    addTests(req.body.pid, req.body.tid, req.body.test, req.body.out)
    res.send("Test added")
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.send("OK");
});

// Code execution endpoint
app.post("/run", async (req, res) => {
    try {
        const { lang, problemid, code, input, tl, ml } = req.body;

        // Validate input
        if (!lang || !code || !input) {
            return res.status(400).json({
                verdict: "Invalid Request",
                output: "Missing required parameters"
            });
        }

        // Validate language
        if (!['python', 'cpp', 'java'].includes(lang)) {
            return res.status(400).json({
                verdict: "Invalid Language",
                output: "Unsupported programming language"
            });
        }

        // Create temporary directory for this run
        const tmpDir = path.join(__dirname, 'subcode');
        
        // Clean up any existing files in the temp directory
        if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir);
            for (const file of files) {
                fs.unlinkSync(path.join(tmpDir, file));
            }
        } else {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Clean up the code by replacing escaped newlines with actual newlines
        const cleanCode = code.replace(/\\n/g, '\n').trim();

        // Normalize input to ensure consistent line endings but preserve whitespace
        const normalizedInput = String(input)
            .replace(/\\n/g, '\n')  // Replace escaped newlines
            .replace(/\r\n/g, '\n') // Normalize Windows line endings
            .replace(/\r/g, '\n');   // Normalize Mac line endings

        // Ensure input ends with a newline
        const finalInput = normalizedInput.endsWith('\n') ? normalizedInput : normalizedInput + '\n';
        
        // Write input to file
        const inputFile = path.join(tmpDir, 'input.txt');
        fs.writeFileSync(inputFile, finalInput, { encoding: 'utf8' });

        let result;
        try {
            if (lang === 'python') {
                // Write Python code to file
                const pythonFile = path.join(tmpDir, 'test.py');
                fs.writeFileSync(pythonFile, cleanCode);
                
                try {
                    // First try to compile to check for syntax errors
                    execSync(`python3 -m py_compile ${pythonFile}`, {
                        encoding: 'utf8',
                        timeout: 5000 // 5 second timeout for compilation
                    });
                } catch (compileError) {
                    return res.json({
                        verdict: "Compilation Error",
                        output: compileError.message.replace(pythonFile, 'test.py'),
                        time: 0
                    });
                }
                
                // Run Python code with input from file
                result = execSync(`cat ${inputFile} | python3 ${pythonFile}`, {
                    encoding: 'utf8',
                    timeout: parseInt(tl) || 2000,
                    maxBuffer: 10 * 1024 * 1024 // 10MB output limit
                });
            } else if (lang === 'cpp') {
                // Write C++ code to file
                fs.writeFileSync(path.join(tmpDir, 'test.cpp'), cleanCode);
                
                // Compile C++ code
                execSync('g++ -std=c++17 -o ' + path.join(tmpDir, 'a.out') + ' ' + path.join(tmpDir, 'test.cpp'), {
                    encoding: 'utf8'
                });
                
                // Run C++ code with input from file
                result = execSync(`cat ${inputFile} | ` + path.join(tmpDir, 'a.out'), {
                    encoding: 'utf8',
                    timeout: parseInt(tl) || 2000,
                    maxBuffer: 10 * 1024 * 1024
                });
            } else if (lang === 'java') {
                // Write Java code to file
                fs.writeFileSync(path.join(tmpDir, 'test.java'), cleanCode);
                
                // Compile Java code
                execSync('javac ' + path.join(tmpDir, 'test.java'), {
                    encoding: 'utf8'
                });
                
                // Run Java code with input from file
                result = execSync(`cd ${tmpDir} && cat ${path.basename(inputFile)} | java test`, {
                    encoding: 'utf8',
                    timeout: parseInt(tl) || 2000,
                    maxBuffer: 10 * 1024 * 1024
                });
            }

            // Normalize output line endings
            const normalizedOutput = result ? result.toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim() : '';

            res.json({
                verdict: "Accepted",
                output: normalizedOutput,
                time: 0  // We'll add proper timing later
            });
        } catch (error) {
            // Check if it's a timeout error
            if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
                res.json({
                    verdict: "Time Limit Exceeded",
                    output: error.message,
                    time: parseInt(tl)
                });
            } else {
                res.json({
                    verdict: "Runtime Error",
                    output: error.message,
                    time: -1
                });
            }
        } finally {
            // Clean up temporary files after run
            try {
                if (fs.existsSync(tmpDir)) {
                    const files = fs.readdirSync(tmpDir);
                    for (const file of files) {
                        fs.unlinkSync(path.join(tmpDir, file));
                    }
                }
            } catch (cleanupError) {
                console.error('Error cleaning up temporary files:', cleanupError);
            }
        }
    } catch (error) {
        console.error('Error in /run endpoint:', error);
        res.status(500).json({
            verdict: "System Error",
            output: error.message
        });
    }
});

// Helper function to normalize output
function normalizeOutput(output) {
    return output.trim().replace(/\r\n/g, '\n');
}

// Start the server
app.listen(port, () => {
    console.log(`Code runner server listening on port ${port}`);
});
