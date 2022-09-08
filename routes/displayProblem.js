const Client = require('pg').Client;
let cl = undefined;
async function grab(id) {
    try {
        cl = new Client ({
            user: "postgres",
            password: process.env.PGPASSWORD,
            port: 5432,
            database: "autograder"
        });
        await cl.connect();
        let results = await cl.query("SELECT * FROM problems WHERE id = " + id);
        if (results.rows.length == 0) {
            await cl.end();
            return false;
        }
        else {
            cl.end();
            let ret = {
                id: id,
                title: results.rows[0].name,
                statement: results.rows[0].statement
            }
            return ret;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
async function grabSubs(id) {
    try {
        cl = new Client ({
            user: "postgres",
            password: process.env.PGPASSWORD,
            port: 5432,
            database: "autograder"
        });
        await cl.connect();
        let results = await cl.query("SELECT * FROM submissions WHERE submissions.user = " + id);
        if (results.rows.length == 0) {
            await cl.end();
            return false;
        }
        else {
            cl.end();
            retarr = [];
            for (let i=0; i<results.rows.length; i++) {
                let ret = {
                    user: id,
                    id: results.rows[i].id,
                    verdict: results.rows[i].verdict,
                    runtime: results.rows[i].runtime,
                    problemName: results.rows[i].problemName
                }
                retarr.push(ret);
            }
            return retarr;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
async function grabStatus(id) {
    try {
        cl = new Client ({
            user: "postgres",
            password: process.env.PGPASSWORD,
            port: 5432,
            database: "autograder"
        });
        await cl.connect();
        let results = await cl.query("SELECT * FROM submissions WHERE id = " + id);
        if (results.rows.length == 0) {
            await cl.end();
            return false;
        }
        else {
            cl.end();
            let ret = {
                user: id,
                verdict: results.rows[0].verdict,
                runtime: results.rows[0].runtime,
                problemName: results.rows[0].problemName,
                problemID: results.rows[0].problemID,
                code: results.rows[0].code,
                language: results.rows[0].language
            }
            return ret;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
async function grabStatus(id) {
    try {
        cl = new Client ({
            user: "postgres",
            password: process.env.PGPASSWORD,
            port: 5432,
            database: "autograder"
        });
        await cl.connect();
        let results = await cl.query("SELECT * FROM problems WHERE id = " + id);
        if (results.rows.length == 0) {
            await cl.end();
            return false;
        }
        else {
            cl.end();
            let ret = {
                checker: results.rows[0].checkerBinary,
                tl: results.rows[0].tl,
                ml: results.rows[0].ml,
                input: results.rows[0].tests
            }
            return ret;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
async function insertSubmission(id, verdict, runtime, memory) {
    try {
        cl = new Client ({
            user: "postgres",
            password: process.env.PGPASSWORD,
            port: 5432,
            database: "autograder"
        });
        await cl.connect();
        let results = await cl.query("query to update row of id with verdict");
        if (results.rows.length == 0) {
            await cl.end();
            return false;
        }
        else {
            cl.end();
            return;
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
}
async function createSubmission(user, code, problem, language) {
    try {
        cl = new Client ({
            user: "postgres",
            password: process.env.PGPASSWORD,
            port: 5432,
            database: "autograder"
        });
        await cl.connect();
        let results = await cl.query("statement to generate submission row into table and retrieve the new id");
        if (results.rows.length == 0) {
            await cl.end();
            return false;
        }
        else {
            cl.end();
            return;
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
}
module.exports = {
    grab: (id) => {
        return grab(id);
    },
    grabSubs: (id) => {
        return grabSubs(id);
    },
    grabStatus: (id) => {
        return grabStatus(id);
    },
    grabProblem: (id) => {
        return grabProblem(id);
    },
    insertSubmission: (id, verdict, runtime, memory) => {
        return insertSubmission(id, verdict, runtime, memory);
    },
    createSubmission: (user, code, problem, language) => {
        return createSubmission(user, code, problem, language);
    }
}