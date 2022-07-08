require('dotenv').config();
const express = require("express");
const app = express();
const port = 3000;
const session = require('express-session');
const gradeRouter = require("./routes/grade");
const {getToken, processFunction} = require("./oauth");
const {check} = require("./profile");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true}));
app.use("/grade", gradeRouter);
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
    let theurl = await getToken();
    res.render("index", {loginurl: theurl});
});
app.get("/login", async (req, res)=>{ 
    let CODE = req.query.code;
    let data = await processFunction(CODE, req, res);
    await check(data.user_data, data.req, data.res);
});
app.get("/profile", checkLoggedIn, (req, res)=>{ 
    res.render("profile", {name: req.session.name, username: req.session.username});
});
app.post("/logout", (req, res)=> {
    req.session.destroy();
    res.redirect("/");
});


function checkLoggedIn(req, res, next) {
    if (req.session.loggedin) {
        next();
    }
    else {
        res.redirect("/");
    }
}

console.log("start");
app.listen(port);
