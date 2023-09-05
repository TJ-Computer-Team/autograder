require('dotenv').config();
const express = require("express");
const app = express();
const port = 3000;
const session = require('express-session');
const gradeRouter = require("./routes/grade");
const adminRouter= require("./routes/admin");

const {populate} = require("./profile")

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true}));
app.use(session({
	secret: process.env.SECRET_KEY,
	resave: false,
	saveUninitialized: false
}));
app.use("/grade", gradeRouter);
app.use("/admin", adminRouter);

app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
    res.render("index", {loginurl: "/grade/authlogin"});
});

app.get("/start", async (req, res) => {	
	if (req.session.user_data == undefined) {
		res.redirect("/");
	} else {
		res.render("firstTime", {name:req.session.user_data.display_name, username:req.session.user_data.ion_username});
	}
});

app.post("/confirm", async (req, res) => {
	user_data = req.session.user_data;
	user_data.email = req.body.email;
	user_data.pass = req.body.pass;
	try {
	if (req.body.email.length > 100 || req.body.pass.length > 100) {
		res.redirect("/")
	} 
	else {
		//console.log(user_data.email);
		//console.log(user_data.pass);
		populate(user_data, req, res);
	}
	}
	catch (error) {
		res.redirect("/");
	}
});

console.log("start");
app.listen(port);
