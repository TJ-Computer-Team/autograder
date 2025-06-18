const {
    Pool
} = require('pg');
const pl = new Pool({
    user: "Samuel",
    port: 5432,
    database: "coderunner",
    max: 20,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true
});

async function testSql() {
    pl.connect((err, client, release) => {
        if (err) {
            console.log("Error getting client");
            return;
        }
        let qry = "SELECT * FROM users;";
        client.query(qry, (err, result) => {
            release();
            if (err) {
                console.log("An error occured while querying");
                return false;
            }
            console.log(result.rows);
        });
    });
}
async function addProblem(pid, tl, ml) {
    return new Promise((res, rej) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error adding problem");
                res(false);
            }
            // pid | tl | ml
            let qry = `INSERT INTO problems (pid, tl, ml)
                VALUES ($1, $2, $3) ON CONFLICT (pid)
                DO UPDATE SET 
                        ml= excluded.ml,
                        tl= excluded.tl
                `;
            client.query(qry, [pid, tl, ml], (err, results) => {
                release();
                if (err) {
                    console.log("Error while querying");
                    res(false);
                }
                res(results);
            });
        });
    });
}
module.exports = {
    testSql: () => {
        return testSql();
    },
    add: (pid, pname, cid, checkid, sol, state, tl, ml, inter, secret) => {
        return addProblem(pid, pname, cid, checkid, sol, state, tl, ml, inter, secret);
    }
}
