module.exports = {
    defaultLimits: {
        timeMs: 2000,
        memoryMb: 256
    },
    coderunner: {
        baseUrl: process.env.CODERUNNER_URL || 'http://localhost:8080',
        timeout: 30000
    },
    database: {
        user: process.env.DB_USER || "postgres",
        password: process.env.PGPASSWORD,
        host: (process.env.PROD == "false" ? "postgres" : "localhost"),
        port: 5432,
        database: "autograder"
    }
}; 