require('dotenv').config();
const express = require('express');
const router = express.Router({ mergeParams: true });
const {grab, grabProblem, grabAllProblems, grabSubs, grabStatus, checkAdmin, createSubmission, grabProfile, getProblem, addProblem, testSql, addChecker, addTest, updateTest, addSol, makePublic, updateChecker, grabUsers, grabContestProblems} = require("./sql");
const {queue, compileTests} = require("./runTests");

const {processFunction, getToken} = require("../oauth");
const {check} = require("../profile");

const FileReader = require('filereader');
const csvtojson = require('csvtojson');
const upload = require('express-fileupload');

router.get("/authlogin", async (req, res) => {
	if (req.session.loggedin) {
		res.redirect("/grade/profile");
	}
	else {
		let theurl = await getToken();
		res.redirect(theurl);
	}
});
router.get("/login", async (req, res)=>{ 
	let CODE = req.query.code;
	let data = await processFunction(CODE, req, res);
	await check(data.user_data, data.req, data.res);
});

router.get("/info", checkLoggedIn, async (req, res) => {
	res.render("info");
});

router.post("/logout", (req, res)=> {
	req.session.destroy();
	res.redirect("/");
});
router.get("/profile", checkLoggedIn, (req, res)=>{ 
	res.render("profile", {name: req.session.name, username: req.session.username});
});
router.get("/profile/:id", checkLoggedIn, async (req, res) => {
	let vals = await grabProfile(req.params.id);
	if (vals == false) {
		res.send("No such user");
	}
	else {
		res.render("fprofile", {name: vals.name, username: vals.username});
	}
});


router.get("/", (req, res) => {
	res.redirect("/grade/profile");
});
router.get("/contests", checkLoggedIn, (req, res) => {
	res.render('contests');
});
router.get("/contests/:id", checkLoggedIn, async (req, res) => {
	let cid = req.params.id;
	let problems = await grabAllProblems(cid);

	let vals = {
		title: "Test",
		problems: problems
	}

	res.render("contest", {title: vals.title, problems: vals.problems, user: req.session.userid, cid: cid});
});
router.get("/contests/:id/standings", checkLoggedIn, async (req, res) => {
	let cid = req.params.id;
	let subs = await grabSubs(undefined, cid);
	let users = await grabUsers();
	let problems = await grabContestProblems(cid);

	let load = [];
	for (let i=0; i<users.length; i++) {
		let tmp = [];
		for (let j=0; j<problems.length; j++) {
			tmp.push(0);
		}
		row = {
			name: users[i].display_name,
			id: users[i].id,
			solved: 0,
			problems: tmp
		}
		load.push(row);
	}
	//console.log(load);
	for (let i=0; i<subs.length; i++) {
		let ind, pind;
		for (let j=0; j<load.length; j++) {
			if (load[j].id == subs[i].user) {
				ind = j;
				break;
			}
		}
		for (let j=0; j<problems.length; j++) {
			//console.log(subs[i].problemid, problems[j].pid);
                        if (problems[j].pid == subs[i].problemid) {
                                pind = j;
                                break;
			}		
		}
		if (subs[i].verdict == "AC") {
			if (load[ind].problems[pind] != 1) {
				load[ind].solved += 1;
			}
			load[ind].problems[pind] = 1;
		}
		else {
			//console.log(ind, pind);
			console.log(load[ind].problems[pind]);
			if (load[ind].problems[pind] < 1) {
				load[ind].problems[pind] -= 1;
			}
			console.log(load[ind].problems[pind]);
		}
	}
	load.sort(function(a,b){
  		return a.solved < b.solved ? 1 : -1;
	});

	res.render("standings", {user: req.session.userid, cid: cid, pnum: problems.length, load: load});
});
router.get("/contests/:id/status", checkLoggedIn, async (req, res) => {
        let user = req.query.user;
        let contest = req.query.contest;
        let admin = await checkAdmin(req.session.userid); //seems insecure but look at later :DD:D:D:D
        if (user == undefined && contest == undefined && !admin) {
                user = req.session.userid;
        }
        let submissions = await grabSubs(user, contest);
	let cid = req.params.id;
        res.render("contestStatus", {user: req.session.userid, cid: cid, submissions: submissions});
});
router.get("/problemset", checkLoggedIn, async (req, res) => {
	let page = req.query.page;
	if (page == undefined) page = 0;
	let start = page*5; //write multipage later
	let vals = await grabAllProblems();
	res.render("gradeProblemset", {problems: vals});
});
router.get("/problemset/:id", checkLoggedIn, async (req, res) => { //req.params.id
	let vals = await grab(req.params.id);
	res.render("gradeProblem", {title: vals.title, statement: vals.statement, id: vals.id});
});
router.get("/submit", checkLoggedIn, (req, res) => {
	res.render("gradeSubmit", {problemid: req.query.problem});
});

router.post("/status", checkLoggedIn, async (req, res) => { //eventually change to post to submit
	//sends file to another website

	let language = req.body.lang;
	console.log(language);
	if (language != 'python' && language != 'cpp' && language != 'java') {
		console.log("bad");
		res.send("unacceptable code language");
		return;
	}

	let pid = req.body.problemid;
	if(pid ==""){
		res.send("WHAT PROBLEM STUPID");
		return;
	}
	let file = req.body.code;

	let problem = await grabProblem(pid);
	let cid = problem.cid;
	let problemname = problem.name;

	let sid = await createSubmission(req.session.userid, file, pid, language, problemname, cid);
	await queue(pid, sid);
	res.redirect("/grade/status");
});

router.get("/status", checkLoggedIn, async (req, res) => {
	let user = req.query.user;
	let contest = req.query.contest;
	let admin = await checkAdmin(req.session.userid); //seems insecure but look at later :DD:D:D:D
	console.log(user, contest, admin);
	if (user == undefined && contest == undefined && !admin) {
		user = req.session.userid;
	}
	let submissions = await grabSubs(user, contest);
	res.render("gradeStatus", {submissions: submissions});
});
router.get("/status/:id", checkLoggedIn, async (req, res) => { //req.params.id
	let vals = await grabStatus(req.params.id);

	res.render("status", {submission: vals});
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
