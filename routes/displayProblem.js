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

module.exports = {
    grab: (id) => {
        return grab(id);
    }
}