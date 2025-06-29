const { Pool } = require('pg');

const pl = new Pool({
    user: "postgres",
    password: process.env.PGPASSWORD,
    host: (process.env.PROD == "false" ? "postgres" : "localhost"),
    port: 5432,
    database: "autograder",
    max: 100,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true
});

module.exports = pl;
