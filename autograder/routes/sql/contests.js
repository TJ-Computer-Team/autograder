const pl = require('./db');

async function getAllContests() {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM contests;`;
            client.query(qry, [], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for contests", err);
                    resolve(false);
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
async function getContest(cid) {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM contests WHERE id = $1;`;
            client.query(qry, [cid], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for contest", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                } else {
                    resolve(results.rows[0]);
                }
            });
        });
    });
}
async function getStats(season) {
    await updateCFRating();
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users
                WHERE LEFT(username, 4) ~ '^[0-9]+$'
                AND LEFT(username, 4)::int >= $1;`;
            client.query(qry, [season], (err, results) => {
                release();
                if (err) {
                    console.log("An error occured while querying for contest", err);
                    resolve(false);
                }
                retarr = [];
                for (let i = 0; i < results.rows.length; i++) {
                    let ret = {
                        id: results.rows[i].id,
                        name: results.rows[i].display_name,
                        usaco: results.rows[i].usaco_division,
                        cf: results.rows[i].cf_rating
                    }
                    retarr.push(ret);
                }
                resolve(retarr);
            });
        });
    });
}

async function updateCFRating() {
    return new Promise((resolve, reject) => {
        pl.connect((err, client, release) => {
            if (err) {
                console.log("Error getting client");
                resolve(false);
            }
            let qry = `SELECT * FROM users WHERE cf_handle IS NOT NULL`;
            client.query(qry, [], (err, results) => {
                if (err) {
                    console.log("An error occured while querying to update cf rating", err);
                    resolve(false);
                }
                if (results.rows.length == 0) {
                    resolve(false);
                }
                let url = "https://codeforces.com/api/user.info?handles="
                for (let i = 0; i < results.rows.length; i++) {
                    url += results.rows[i].cf_handle;
                    if (i + 1 < results.rows.length) url+=";";
                }
                fetch(url).then(response => {
                    if (!response.ok) {
                        throw new Error('CF API response was not ok: '+url);
                    }
                    return response.json();
                }).then(data => {
                    if (data["status"]!="OK") {
                        throw new Error('CF API response was not ok: '+url);
                    }
                    data = data["result"];
                    for (let i = 0; i < results.rows.length; i++) {
                        let qry2 = `UPDATE users SET cf_rating = $1 WHERE id = $2;`;
                        if (isNaN(data[i].maxRating)) {
                            data[i].maxRating = 0;
                        }
                        client.query(qry2, [data[i].maxRating, results.rows[i].id], (err, res) => {
                            if (err) {
                                console.log("An error occured while querying to update cf rating", err);
                                resolve(false);
                            }
                        });
                    }
                    release();
                    resolve(true);
                }).catch(error => {
                    console.log('Error when using CF API', error);
                    resolve(false);
                });
            });
        });
    });
}


module.exports = {
    getAllContests: () => {
        return getAllContests();
    },
    getContest: (cid) => {
        return getContest(cid);
    },
    getStats: (season) => {
        return getStats(season);
    },
};
