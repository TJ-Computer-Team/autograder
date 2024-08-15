const Client = require('pg').Client;
let cl = undefined;
async function check(user_data, req, res) {
	try {
		cl = new Client ({
			user: "postgres",
			password: process.env.PGPASSWORD,
			port: 5432,
			database: "autograder"
		});
		await cl.connect();
		let results = await cl.query("SELECT * FROM users WHERE id = ($1)", [user_data.id]);
		if (results.rows.length == 0) { // first time user
			await cl.end();
			req.session.user_data = user_data;
			res.redirect("/start");
		}
		else {
			cl.end();
			req.session.name = results.rows[0].display_name;
			req.session.username = results.rows[0].username;
			req.session.userid = results.rows[0].id;
			req.session.admin = results.rows[0].admin;
            req.session.usaco_div = results.rows[0].usaco_division;
            req.session.cf_handle = results.rows[0].cf_handle;
			req.session.tjioi = Math.floor(parseInt(req.session.userid)/100)>=2024 && Math.floor(parseInt(req.session.userid)/100)<10000;
			if (req.session.admin) {
				req.session.name = "[Admin] " + req.session.name;
			}
			req.session.loggedin = true;
			if (req.session.mobile) {
				res.redirect("/grade/attendance");
			}
			else {
				res.redirect("/grade/profile");
			}
		}
	}
	catch (error) {
		res.redirect("/");
		console.log(error);
	}
}
async function populate(user_data, req, res) { // generate data for first time user
	try {
		cl = new Client ({
			user: "postgres",
			password: process.env.PGPASSWORD,
			port: 5432,
			database: "autograder"
		});
		await cl.connect();
		await cl.query("INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6, $7)", [user_data.id, user_data.display_name, user_data.ion_username, 0, false, user_data.email, user_data.pass]);
		await cl.end();
		check(user_data, req, res);
	}
	catch (error) {
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
