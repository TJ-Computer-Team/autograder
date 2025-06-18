const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

class CodeforcesService {
    constructor() {
        this.baseUrl = 'https://codeforces.com/api';
        this.apiKey = process.env.CF_API_KEY;
        this.secretKey = process.env.CF_SECRET_KEY;
        this.retryDelay = 2000; // 2 second delay between retries
        this.maxRetries = 3;
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateSignature(methodName, params = {}) {
        const time = Math.floor(Date.now() / 1000);
        const rand = '123456'; // Fixed value for testing

        // Create parameter string
        const paramStr = Object.entries({ ...params, apiKey: this.apiKey, time })
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        // Create signature string
        const sigStr = `${rand}/${methodName}?${paramStr}#${this.secretKey}`;
        
        // Calculate SHA512 hash
        const hash = crypto.createHash('sha512').update(sigStr).digest('hex');
        
        return {
            apiSig: `${rand}${hash}`,
            time
        };
    }

    async makeAuthenticatedRequest(methodName, params = {}) {
        const { apiSig, time } = this.generateSignature(methodName, params);
        
        try {
            const response = await axios.get(`${this.baseUrl}/${methodName}`, {
                params: {
                    ...params,
                    apiKey: this.apiKey,
                    time,
                    apiSig
                },
                timeout: 10000
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Codeforces API error: ${response.data.comment || 'Unknown error'}`);
            }

            return response.data.result;
        } catch (error) {
            if (error.response) {
                throw new Error(`API request failed: ${error.response.status} - ${error.response.data.comment || error.message}`);
            }
            throw error;
        }
    }

    async getProblemTestcases(contestId, problemIndex) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`Fetching problem ${contestId}${problemIndex} (Attempt ${attempt}/${this.maxRetries})`);
                
                // Get problem info from contest info
                const contestInfo = await this.makeAuthenticatedRequest('contest.standings', {
                    contestId,
                    from: 1,
                    count: 1,
                    showUnofficial: false
                });

                const problem = contestInfo.problems?.find(p => p.index === problemIndex);
                if (!problem) {
                    throw new Error(`Problem ${problemIndex} not found in contest ${contestId}`);
                }

                // Get problem statement page
                const problemUrl = `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`;
                console.log(`Fetching samples from ${problemUrl}`);
                
                const htmlResponse = await axios.get(problemUrl, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5'
                    }
                });

                if (!htmlResponse.data) {
                    throw new Error('Failed to fetch problem page');
                }

                // Extract sample tests
                const $ = require('cheerio').load(htmlResponse.data);
                const samples = [];
                
                // Get time and memory limits from problem statement
                const headerText = $('.header .title').text();
                const timeLimitMatch = $('.problem-statement .time-limit').text().match(/(\d+) second/);
                const memoryLimitMatch = $('.problem-statement .memory-limit').text().match(/(\d+) megabyte/);

                const timeLimit = timeLimitMatch ? parseInt(timeLimitMatch[1]) * 1000 : 2000; // Default to 2 seconds
                const memoryLimit = memoryLimitMatch ? parseInt(memoryLimitMatch[1]) * 1024 * 1024 : 256 * 1024 * 1024; // Default to 256MB
                
                $('.sample-test .input').each((i, inputElem) => {
                    const outputElem = $(inputElem).next('.output');
                    
                    if (outputElem.length) {
                        const input = $(inputElem).find('pre').text().trim();
                        const output = $(outputElem).find('pre').text().trim();
                        
                        if (input && output) {
                            samples.push({
                                input: this.normalizeLineEndings(input),
                                output: this.normalizeLineEndings(output)
                            });
                        }
                    }
                });

                if (!samples || samples.length === 0) {
                    throw new Error('No sample test cases found');
                }

                return {
                    name: problem.name,
                    timeLimit: timeLimit,
                    memoryLimit: memoryLimit,
                    samples
                };
            } catch (error) {
                lastError = error;
                console.error(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.maxRetries) {
                    await this.sleep(this.retryDelay * attempt); // Exponential backoff
                    continue;
                }
                
                throw new Error(`Failed to fetch problem after ${this.maxRetries} attempts: ${error.message}`);
            }
        }
    }

    normalizeLineEndings(text) {
        return text.replace(/\r\n/g, '\n').trim();
    }

    async importProblem(contestId, problemIndex) {
        try {
            const problem = await this.getProblemTestcases(contestId, problemIndex);
            return {
                name: problem.name,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
                samples: problem.samples,
                source: `Codeforces Contest ${contestId}, Problem ${problemIndex}`
            };
        } catch (error) {
            console.error('Error importing problem:', error);
            throw error;
        }
    }
}

module.exports = new CodeforcesService(); 