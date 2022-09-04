require('dotenv').config();
const express = require('express');
const router = express.Router({ mergeParams: true });
const {grab} = require("./displayProblem");

const {processFunction} = require("../oauth");
const {check} = require("../profile");
const session = require('express-session');
router.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

router.get("/login", async (req, res)=>{ 
    console.log("here");
    let CODE = req.query.code;
    let data = await processFunction(CODE, req, res);
    await check(data.user_data, data.req, data.res);
});
router.post("/logout", (req, res)=> {
    req.session.destroy();
    res.redirect("/");
});
router.get("/profile", checkLoggedIn, (req, res)=>{ 
    res.render("profile", {name: req.session.name, username: req.session.username});
});
router.get("/", (req, res) => {
    res.redirect("/grade/profile");
});
router.get("/contests", checkLoggedIn, (req, res) => {
    res.render('contests');
});
router.get("/problemset", checkLoggedIn, (req, res) => {
    let page = req.query.page;
    if (page == undefined) page = 0;
    let start = page*5; //write multipage later
    res.render("gradeProblemset", {p1: 0, p1n: "Problem 1", p2: 1, p2n: "Problem 2", p3: 2, p3n: "Problem 3", p4: 3, p4n: "Problem 4", p5: 4, p5n: "Problem 5"});
});
router.get("/problemset/:id", checkLoggedIn, async (req, res) => { //req.params.id
    let vals = await grab(req.params.id);
    res.render("gradeProblem", {title: vals.title, statement: vals.statement, id: vals.id});
});


router.get("/submit", checkLoggedIn, (req, res) => {
    res.render("gradeSubmit");
});

router.post("/status", checkLoggedIn, (req, res) => {
        //sends file to another website
        let file= req.body.code;
        let url = "http://localhost:3000/grade/status";
        let formData = {
                "file": file
        };
        let requestOptions = {
                method: "POST",
                headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                }
        };
});
router.get("/status", checkLoggedIn, (req, res) => {
    res.send("not success");
});

function checkLoggedIn(req, res, next) {
    if (req.session.loggedin) {
        next();
    }
    else {
        res.redirect("/");
    }
}

module.exports = router;
