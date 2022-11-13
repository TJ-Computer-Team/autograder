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
		let results = await cl.query("SELECT * FROM users WHERE id = " + user_data.id);//HIGHLY UNSAFE
		if (results.rows.length == 0) {
			await cl.end();
			populate(user_data, req, res);
		}
		else {
			cl.end();
			req.session.name = results.rows[0].display_name;
			req.session.username = results.rows[0].username;
			req.session.userid = results.rows[0].id;
			//req.session.admin = results.rows[0].admin;
			req.session.admin = true;
			res.redirect("/grade/profile");
		}
	}
	catch (error) {
		res.redirect("/");
		console.log(error);
	}
}
async function populate(user_data, req, res) {
	try {
		cl = new Client ({
			user: "postgres",
			password: process.env.PGPASSWORD,
			port: 5432,
			database: "autograder"
		});
		await cl.connect();
		await cl.query("INSERT INTO users VALUES ($1, $2, $3, $4, $5)", [user_data.id, user_data.display_name, user_data.ion_username, 0, false]);
		await cl.end();
		req.session.name = user_data.display_name;
		req.session.username = user_data.ion_username;
		req.session.userid = user_data.id;

		res.redirect("/grade/profile");
	}
	catch (error) {
		console.log(error);
		res.redirect("/");
	}
}

module.exports = {
	check: (user_data, req, res) => {
		return check(user_data, req, res);
	}
}
