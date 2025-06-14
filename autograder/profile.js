// this file has functions to exectute the second half of the OAuth after the request to Ion API has been completed

const Client = require('pg').Client;
const {pl} = require('./routes/sql/sql');
async function check(user_data, req, res) {
    try {
        // communicate with the database
        const cl = await pl.connect();

        // fetch our user from the database
        // prompt other behavior if they're new
        let results = await cl.query("SELECT * FROM users WHERE id = ($1)", [user_data.id]);
        if (results.rows.length == 0) { // first time user
            cl.release();
            req.session.user_data = user_data;
            res.redirect("/start");
        } else {
            cl.release();
            req.session.name = results.rows[0].display_name;
            req.session.username = results.rows[0].username;
            req.session.userid = results.rows[0].id;
            req.session.admin = results.rows[0].admin;
            req.session.usaco_div = results.rows[0].usaco_division;
            req.session.cf_handle = results.rows[0].cf_handle;
            req.session.tjioi = Math.floor(parseInt(req.session.userid) / 100) >= 2024 && Math.floor(parseInt(req.session.userid) / 100) < 10000;
            if (req.session.admin) {
                req.session.name = "[Admin] " + req.session.name;
            }
            req.session.loggedin = true;
            if (req.session.mobile) {
                res.redirect("/grade/attendance");
            } else {
                res.redirect("/grade/profile");
            }
        }
    } catch (error) {
        res.redirect("/");
        console.log(error);
    }
}

// file in the data into the database for a first-time user
async function populate(user_data, req, res) { 
    try {
        const cl = await pl.connect();
        await cl.query("INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6)", [user_data.id, user_data.display_name, user_data.ion_username, false, user_data.email, user_data.pass]);
        cl.release();
        await check(user_data, req, res);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

module.exports = {
    check: (user_data, req, res) => {
        return check(user_data, req, res);
    },
    populate: (user_data, req, res) => {
        return populate(user_data, req, res);
    }
}
