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


router.get("/", async (req, res) => {
	res.redirect("/grade/profile");
});

router.get("/attendance", async (req, res) => {
	if (req.session.loggedin) {
		deviceClass = 'main';
		if (req.session.mobile) deviceClass = 'phone';
		res.render("attendance", {name: vals.name, username: vals.username, device: deviceClass});
	}
	else {
		res.redirect("/");
	}
});

router.post("/attendanceComplete", async (req, res) => {
        if (req.session.loggedin) {
        	let pass = req.body.pass;
		let block = req.body.block;
		res.send("Attendance complete, thank you.");
	}
	else {
		res.redirect("/");
	}
});

router.get("/contests", checkLoggedIn, async (req, res) => {
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
        res.render("contestStatus", {user: req.session.username, cid: cid, submissions: submissions});
});
router.get("/problemset", checkLoggedIn, async (req, res) => {
	let page = req.query.page;
	if (page == undefined) page = 0;
	let start = page*5; //write multipage later
	let vals = await grabAllProblems();
	res.render("gradeProblemset", {problems: vals});
});
router.get("/problemset/:id", checkLoggedIn, async (req, res) => { //req.params.id
	let vals = await grabProblem(req.params.id);
	vals.title = vals.name;
	vals.pid = req.params.id;
	console.log(vals);
	res.render("gradeProblem", vals);
});
router.get("/submit", checkLoggedIn, (req, res) => {
	if (false && !req.session.admin) {
		res.redirect("/grade/profile")
	}
	else {
		res.render("gradeSubmit", {problemid: req.query.problem});
	}
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
		res.send("You did not input any problem id");
		return;
	}
	let file = req.body.code;

	let problem = await grabProblem(pid);
	let cid = problem.cid;
	let problemname = problem.name;

	let today = new Date();
	let timestamp = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + "," + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	console.log(timestamp);
	
	let sid = await createSubmission(req.session.userid, file, pid, language, problemname, cid, timestamp);
	console.log(sid)
	await queue(pid, sid);
	res.redirect("/grade/status");
});

router.get("/status", checkLoggedIn, async (req, res) => {
	let user = req.query.user;
	let contest = req.query.contest;
	let admin = await checkAdmin(req.session.userid); //seems insecure but look at later :DD:D:D:D
	admin = req.session.admin;
	console.log(user, contest, admin);
	if (user == undefined && contest == undefined && !admin) { //& !admin
		user = req.session.userid;
	}
	let submissions = await grabSubs(user, contest);
	res.render("gradeStatus", {submissions: submissions, viewAsAdmin: admin});
});
router.get("/status/:id", checkLoggedIn, async (req, res) => { //req.params.id
	let vals = await grabStatus(req.params.id);
	if (vals.user == req.session.userid || req.session.admin) {
		res.render("status", {submission: vals});
	}
	else {
		res.send("You do not have permission to view this submission.");
	}
});

function checkLoggedIn(req, res, next) {
	if (req.session.loggedin) {
		if (req.session.mobile) {
			res.redirect("/grade/attendance");
		}
		else {
			next();
		}
	}
	else {
		res.redirect("/");
	}
}

module.exports = router;
