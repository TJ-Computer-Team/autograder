async function grabUsers() {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = "SELECT * FROM users;";
            client.query(qry, (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for users", err);
                    resolve(false)
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    resolve(results.rows);
                }
            });
        });
    });
}

async function grabProfile(id) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users WHERE id = $1`;
            client.query(qry, [id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for profile", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    res = {
                        username: results.rows[0].username,
                        name: results.rows[0].display_name,
                        cf: results.rows[0].cf_handle,
                        usaco: results.rows[0].usaco_division
                    }
                    resolve(res);
                }
            });
        });
    });
}

async function validateUser(id, password) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users WHERE id = $1 AND pass = $2 AND id < 1000000`;
            client.query(qry, [id, password], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to validate user", err);
                    resolve(false)
                }
                if (results.rows.length == 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    });
}
async function updateUSACO(id, usaco) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE users SET usaco_division = $1 WHERE id = $2;`;
            client.query(qry, [usaco, id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to update usaco division", err);
                }
                resolve(true);
            });
        });
    });
}
async function updateCF(id, cf) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `UPDATE users SET cf_handle = $1 WHERE id = $2;`;
            client.query(qry, [cf, id], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying to update cf handle", err);
                    resolve(false);
                }
                resolve(true);
            });
        });
    });
}

module.exports = {
    grabUsers: () => {
        return grabUsers();
    },
    grabProfile: (id) => {
        if (Number(id))
            return grabProfile(id);
        return false;
    },
    validateUser: (id, password) => {
        return validateUser(id, password);
    },
    updateUSACO: (id, usaco) => {
        return updateUSACO(id, usaco);
    },
    updateCF: (id, cf) => {
        return updateCF(id, cf);
    },
};
