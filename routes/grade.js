require('dotenv').config();
const express = require('express');
const router = express.Router({ mergeParams: true });
const {grab, grabProblem, grabAllProblems, grabSubs, grabStatus, checkAdmin, createSubmission, grabProfile, getProblem, addProblem, testSql, addChecker, addTest, updateTest, addSol, makePublic, updateChecker, grabUsers, grabContestProblems} = require("./sql");
const {queue, compileTests} = require("./runTests");

const {processFunction, getToken} = require("../oauth");
const {check} = require("../profile");
const session = require('express-session');

const FileReader = require('filereader');
const csvtojson = require('csvtojson');
const upload = require('express-fileupload');
router.use(session({
	secret: process.env.SECRET_KEY,
	resave: false,
	saveUninitialized: false
}));

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
router.get("/contests/:id", checkLoggedIn, (req, res) => {
	let vals = {
		title: "Test",
		problems: [1, 2, 3],
	}
	let cid = req.params.id;
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
	for (let i=0; i<subs.length; i++) {
		let ind, pind;
		for (let j=0; j<load.length; j++) {
			if (load[j].id == subs[i].user) {
				ind = j;
				break;
			}
		}
		for (let j=0; j<problems.length; j++) {
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
			if (load[ind].problems[pind] != 1) {
				load[ind].problems[pind] -= 1;
			}
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

	let cid = await grabProblem(pid);
	cid = cid.cid;

	let sid = await createSubmission(req.session.userid, file, pid, language, cid);
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
router.get("/createProblem", checkLoggedIn, async (req, res) => {
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log(testSql());
		console.log("HI");
		res.render("portal", {checkid:2, ml:0, pts:0, pid: -1, tl:0, pname:"problem name", cid:-1, secret:"", state:"We must evaluate the integral $\\int_1^\\infty \\left(\\frac{\\log x}{x}\\right)^{2011} dx$."});
	}else{
		res.send("UR NOT ADMIN");
	}
});
router.get("/addChecker", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	console.log("HI");
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("addChecker", {cid:0, code:""});
	}
});
router.post("/addCheck", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log("attempteing to create");
		let cid = req.body.cid;
		let code = req.body.code;
		let lang = req.body.lang;
		let ret = {
			"cid": cid,
			"code": code
		};
		console.log(ret);
		if(cid==-1){
			addChecker(cid, code, lang);
		}else{
			updateChecker(cid, code, lang);
		}
		res.render("addChecker", ret);
	}
});
router.get("/addTest", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	console.log("HI");
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("addTests", {tid:0, pts:100, pid:0, test:""});
	}
});
router.post("/addTest", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log("attempteing to create");
		let pid= req.body.pid;
		let tid= req.body.tid;
		let pts= req.body.pts;
		let test= req.body.test;
		let ret = {
			"pid": pid,
			"test":test,
			"tid": tid,
			"pts":pts
		};
		console.log(ret);
		if(tid==-1){
			addTest(-1, pts, pid, test);
		}else{
			updateTest(tid, pts, pid, test);
		}
		res.render("addTests", ret);
	}
});
router.get("/finProblem", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	console.log("HI");
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("finProblem", {"pid":0});
	}
});
router.post("/finProblem", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		let pid = req.body.pid;
		let ret = {
			"pid": pid
		}
		makePublic(pid);
		res.render("finProblem", ret);
	}
});
router.get("/compileTests", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	console.log("HI");
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("finProblem", {"pid":0});
	}
});
router.post("/compileTests", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		let pid = req.body.pid;
		let ret = {
			"pid": pid
		}
		compileTests(pid);
		res.render("finProblem", ret);
	}
});
router.post("/addTest", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log("attempteing to create");
		let pid= req.body.pid;
		let tid= req.body.tid;
		let pts= req.body.pts;
		let test= req.body.test;
		let ret = {
			"pid": pid,
			"test":test,
			"tid": tid,
			"pts":pts
		};
		console.log(ret);
		addTest(tid, pts, pid, test);
		res.render("addTests", ret);
	}
});
router.get("/addSol", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("addSol", {pid:0, code:""});
	}
});
router.post("/addSol", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log("attempteing to create");
		let pid= req.body.pid;
		let code= req.body.code;
		let lang = req.body.lang;
		let ret = {
			"pid": pid,
			"code":code,
			"lang":lang
		};
		console.log(lang);
		addSol(pid, code, lang);
		res.render("addSol", ret);
	}
});

router.post("/create", checkLoggedIn, async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log("attempteing to create");
		//let problems = await getUserProblems(req.session.userid);
		let pts= req.body.pts;
		let pid = req.body.pid;//TAKE CARE OF THISS!!!!
		let pname = req.body.pname;
		let cid= req.body.cid;
		let state= req.body.state;
		let tl= req.body.tl;
		let ml= req.body.ml;
		let secret = req.body.secret;
		let checkid = req.body.checkid;
		console.log(secret);
		let ret = {
			"pts": pts,
			"pid": pid,
			"pname":pname,
			"cid":cid,
			"state":state,
			"tl":tl,
			"ml":ml,
			"secret":"",
			"checkid": checkid
		};
		console.log(ret);
		//async function addProblem(pname,cid,checkid, sol, state, tl, ml, inter, secret){
		addProblem(pid, pname, cid,checkid, '', state, tl, ml,false,false, pid); 
		res.render("portal", ret);
	}else{
		res.send("UR NOT ADMIN");
	}
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
