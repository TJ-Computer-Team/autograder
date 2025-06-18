const path = require('path');

module.exports = {
    coderunner: {
        url: 'http://localhost:8080',
        timeoutMs: 30000,
        paths: {
            subcode: path.join(__dirname, 'subcode'),
            nsjail: path.join(__dirname, 'nsjail'),
            testcases: path.join(__dirname, 'testcases')
        }
    },
    defaultLimits: {
        timeMs: 1000,    // Default time limit: 1 second
        memoryMb: 256    // Default memory limit: 256 MB
    },
    languages: {
        cpp: {
            compile: 'g++ -std=c++17 -o {output} {input}',
            execute: './a.out',
            timeMultiplier: 1,
            extension: '.cpp'
        },
        python: {
            execute: 'python3 {input}',
            timeMultiplier: 3,
            extension: '.py'
        },
        java: {
            compile: 'javac {input}',
            execute: 'java test',
            timeMultiplier: 2,
            extension: '.java'
        }
    },
    database: {
        host: 'localhost',
        port: 5432,
        name: 'autograder',
        maxConnections: 100,
        idleTimeoutMillis: 0,
        connectionTimeoutMillis: 10000
    }
}; 