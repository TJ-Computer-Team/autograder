require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const router = express.Router({ mergeParams: true });
const {grab, grabProblem, grabAllProblems, grabSubs, grabStatus, checkAdmin, createSubmission, grabProfile, getProblem, addProblem, testSql, addChecker, addTest, updateTest, addSol, makePublic, updateChecker, grabUsers, grabContestProblems} = require("./sql");
const {queue, compileTests} = require("./runTests");

const {processFunction, getToken} = require("../oauth");
const {check} = require("../profile");
const session = require('express-session');
const FileReader = require('filereader');
const csvtojson = require('csvtojson');
const upload = require('express-fileupload');

router.get("/", async (req, res) => {
	//res.send("admin panel -- goto /createProblem");
	//let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
        if(req.session.admin){
		let page = req.query.page;
        	if (page == undefined) page = 0;
        	let start = page*5; //write multipage later
        	let vals = await grabAllProblems()
		res.render("admin", {problems: vals});
	}
	else {
		res.redirect("/");
	}
});
router.get("/createProblem", async (req, res) => {
	let pid = req.query.pid;
        //FISH OUT THE REST OF THE INFORMATION FOR THAT PROBLEM HERE
	if (!pid) {
		pid = -1;
	}
	console.log(req.session);
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	admin = req.session.admin;
	if(admin){
		console.log(testSql());
		console.log("HI");
		res.render("portal", {checkid:2, ml:0, pts:0, pid: pid, tl:0, pname:"problem name", cid:-1, secret:"", state:"We must evaluate the integral $\\int_1^\\infty \\left(\\frac{\\log x}{x}\\right)^{2011} dx$."});
	}else{
		res.send("UR NOT ADMIN");
	}
});
router.get("/getProblem", async (req, res)=>{
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	admin=req.session.admin;
	if(admin){
		console.log(req.query);
		console.log(req.query.id);
		let vals = await grab(req.query.id);
		console.log("HERE");
		console.log(vals);
		res.json(vals);
	}else{
		res.send("UR NOT ADMIN");
	}
});
router.get("/addChecker", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let cid = req.query.cid;
	if (cid == undefined) {
		cid = -1;
	}
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	admin = req.session.admin;
	if(admin){
		res.render("addChecker", {cid:0, code:""});
	}
});
router.post("/addCheck", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
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
router.get("/addTest", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	//console.log("HI");
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	//let admin = true;
	if(admin){
		res.render("addTests", {tid:0, pts:100, pid:0, test:""});
	}
});
router.post("/addTest", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		console.log("attempteing to create");
		let pid= req.body.pid;
		let tid= req.body.tid;
		let test= req.body.test;
		let ret = {
			"pid": pid,
			"test":test,
			"tid": tid
		};
		await axios.post('http://10.150.0.3:8080/addTest', querystring.stringify(ret))
		.then(res => {
			console.log(res);
		}).catch((error) => {
			console.log("ERROR OOPS");
			console.log(error);
		});
		console.log(ret);
		res.render("addTests", ret);
	}
});
router.get("/finProblem", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	console.log("HI");
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("finProblem", {"pid":0});
	}
});
router.post("/finProblem", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
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
router.get("/compileTests", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	console.log("HI");
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("finProblem", {"pid":0});
	}
});
router.post("/compileTests",  async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
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
router.post("/addTest",  async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
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
router.get("/addSol",  async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	if(admin){
		res.render("addSol", {pid:0, code:""});
	}
});
router.post("/addSol", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
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

router.post("/create", async(req, res)=>{//CHANGE GET TO POST AND FIX THE ROUTER !!!!
	let admin = await checkAdmin(req.session.userid);//seems insecure LMAO, but issok, ill looka t it later
	admin = req.session.admin;
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


module.exports = router;
