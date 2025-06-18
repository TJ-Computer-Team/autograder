const fs = require('fs').promises;
const path = require('path');
const cfAPI = require('./cfAPI');

class TestCaseService {
    constructor() {
        this.testCasesDir = path.join(__dirname, '..', 'testcases');
        this.cacheValidityHours = 24;
    }

    async ensureDirectoryExists() {
        try {
            await fs.mkdir(this.testCasesDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    async loadFromCache(problemId) {
        try {
            const cacheFile = path.join(this.testCasesDir, `${problemId}_cache.json`);
            const data = await fs.readFile(cacheFile, 'utf8');
            const cache = JSON.parse(data);
            
            // Check if cache is still valid
            if (Date.now() - cache.timestamp < this.cacheValidityHours * 60 * 60 * 1000) {
                // Validate cache structure
                if (this.validateTestCases(cache.testCases)) {
                    return cache.testCases;
                }
                console.warn(`Invalid test case structure in cache for ${problemId}`);
            }
            return null;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`Error reading cache for ${problemId}:`, error);
            }
                return null;
            }
    }

    validateTestCases(testCases) {
        if (!Array.isArray(testCases)) return false;
        return testCases.every(tc => 
            tc && 
            typeof tc === 'object' && 
            typeof tc.input === 'string' && 
            typeof tc.output === 'string'
        );
    }

    async saveToCache(problemId, testCases) {
        try {
            if (!this.validateTestCases(testCases)) {
                throw new Error('Invalid test case structure');
            }

            await this.ensureDirectoryExists();
            
            const cacheFile = path.join(this.testCasesDir, `${problemId}_cache.json`);
            const cacheData = {
                timestamp: Date.now(),
                testCases: testCases.map(tc => ({
                    input: tc.input.trim(),
                    output: tc.output.trim()
                }))
            };
            
            await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
        } catch (error) {
            console.error(`Error saving cache for ${problemId}:`, error);
            throw error;
        }
    }

    async getTestCases(problemId) {
        try {
            // First try to get from cache
            const cachedTests = await this.loadFromCache(problemId);
            if (cachedTests) {
                return cachedTests;
            }

            // If it's a Codeforces problem, try to fetch from CF
            if (problemId.startsWith('CF')) {
                try {
                    const [_, contestId, problemIndex] = problemId.match(/CF(\d+)([A-Z])/);
                    const cfProblem = await cfAPI.getProblemTestcases(contestId, problemIndex);

                    if (cfProblem && cfProblem.samples) {
                        // Save to cache for future use
                        await this.saveToCache(problemId, cfProblem.samples);
                        return cfProblem.samples;
                    }
                } catch (error) {
                    console.error(`Error fetching CF test cases for ${problemId}:`, error);
                }
            }

            // Fall back to local storage
            return await this.loadFromStorage(problemId);
        } catch (error) {
            console.error(`Error getting test cases for ${problemId}:`, error);
            throw error;
        }
    }

    async loadFromStorage(problemId) {
        try {
            const problemDir = path.join(this.testCasesDir, problemId);
            
            try {
                await fs.access(problemDir);
            } catch {
                return [];
            }

            const files = await fs.readdir(problemDir);
            const inputFiles = files.filter(f => f.endsWith('.in'));
            
        const testCases = [];
        
            for (const inputFile of inputFiles) {
                const outputFile = inputFile.replace('.in', '.out');
                
                try {
                    const input = await fs.readFile(path.join(problemDir, inputFile), 'utf8');
                    const output = await fs.readFile(path.join(problemDir, outputFile), 'utf8');

        testCases.push({
                        input: input.trim(),
                        output: output.trim()
                    });
                } catch (error) {
                    console.error(`Error reading test case ${inputFile}:`, error);
                }
            }

            if (testCases.length > 0) {
                await this.saveToCache(problemId, testCases);
        }

        return testCases;
        } catch (error) {
            console.error(`Error loading from storage for ${problemId}:`, error);
            return [];
        }
    }

    async saveTestCase(problemId, input, output, index) {
        try {
            const problemDir = path.join(this.testCasesDir, problemId);
            await fs.mkdir(problemDir, { recursive: true });
            
            const inputFile = path.join(problemDir, `${index}.in`);
            const outputFile = path.join(problemDir, `${index}.out`);
            
            await fs.writeFile(inputFile, input);
            await fs.writeFile(outputFile, output);
            
            return true;
        } catch (error) {
            console.error('Error saving test case:', error);
            return false;
        }
    }

    async importTestCases(problemId, testCases) {
        try {
            const problemDir = path.join(this.testCasesDir, problemId);
            await fs.rm(problemDir, { recursive: true, force: true });
            
            for (let i = 0; i < testCases.length; i++) {
                await this.saveTestCase(
                    problemId,
                    testCases[i].input,
                    testCases[i].output,
                    i + 1
                );
        }
        
            return true;
        } catch (error) {
            console.error('Error importing test cases:', error);
            return false;
        }
    }
}

module.exports = new TestCaseService(); 