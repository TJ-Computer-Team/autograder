require('dotenv').config();
const express = require('express');
const router = express.Router({ mergeParams: true });
const {grab, grabAllProblems, grabSubs, grabStatus, checkAdmin, createSubmission, grabProfile} = require("./displayProblem");
const {getProblem, addProblem, testSql, addChecker, addTest, addSol, makePublic} = require("./problems");
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
	res.render("contest", {title: vals.title, problems: vals.problems});
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

	let sid = await createSubmission(req.session.userid, file, pid, language);
	await queue(pid, sid);
	res.redirect("/grade/status");
});
router.get("/status", checkLoggedIn, async (req, res) => {
	let submissions = await grabSubs(req.session.userid);
	res.render("gradeStatus", {submissions: submissions});
});
router.get("/createProblem", checkLoggedIn, async (req, res) => {
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log(testSql());
		console.log("HI");
		res.render("portal", {ml:0, pts:0, pid: -1, tl:0, pname:"problem name", cid:-1, secret:"", state:"We must evaluate the integral $\\int_1^\\infty \\left(\\frac{\\log x}{x}\\right)^{2011} dx$."});
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
		let ret = {
			"cid": cid,
			"code": code
		};
		console.log(ret);
		addChecker(cid, code);
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
		addTest(tid, pts, pid, test);
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
		console.log(secret);
		let ret = {
			"pts": pts,
			"pid": pid,
			"pname":pname,
			"cid":cid,
			"state":state,
			"tl":tl,
			"ml":ml,
			"secret":""
		};
		console.log(ret);
		//async function addProblem(pname,cid,checkid, sol, state, tl, ml, inter, secret){
		addProblem(pname, cid,0, '', state, tl, ml,false,false, pid); 
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
