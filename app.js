require('dotenv').config();
const express = require("express");
const app = express();
const port = 8080;
const session = require('express-session');
const gradeRouter = require("./routes/grade");
const adminRouter= require("./routes/admin");


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

console.log("start");
app.listen(port);
