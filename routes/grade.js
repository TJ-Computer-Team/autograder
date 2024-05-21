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

// Web Master Description
//https://docs.google.com/document/d/10WLQosU_D6geiNpA_fptZzeRnaZZwlkXQ7XgXfVkpR8/edit#heading=h.t8gub6phq7p9

function getContestStart(cid) {	
        let contestStart;
	let startStr; // in UTC timezone, +4 from EST
        if (cid == 1)
		startStr="2023-10-06T18:30:00Z";
        else if (cid==2)
		startStr="2023-10-27T18:30:00Z";
	else if (cid==3)
		startStr="2024-01-12T19:30:00Z"; // changed to +5, probably cause of daylight saving stuff
	else if (cid==4)
		startStr="2024-02-23T19:30:00Z";
	else
		startStr="";
	contestStart=new Date(startStr).getTime();
	return contestStart;
}
function getContestEnd(cid) {	
	let endStr;
	let contestEnd; 
        if (cid == 1)
		endStr="3023-10-06T20:00:00Z";
        else if (cid==2)
		endStr="2023-10-27T20:00:00Z";
	else if (cid==3)
		endStr="2024-01-12T21:00:00Z";
	else if (cid==4)
		endStr="2024-02-23T21:00:00Z";
	else endStr="";
	contestEnd=new Date(endStr).getTime();
	return contestEnd;
}
function getLateTakers(cid) {
	if(cid==3) return [1001731, 1001623, 1001620, 1001475, 1002158, 1001944, 1001092, 1002595, 1001904, 1001642];// anush devkar, armaan ahmed, anusha agarwal, kanishk sivanadam, max zhao, rishikesh narayana, samarth bhargav, nathan liang, esha m, navya arora
	if(cid==4) return [1002636, 1001207, 1001608, 1002135];//svaran, avni, arjun, olivia
	else return [];
}

router.get("/authlogin", async (req, res) => {
	// if (req.session.loggedin) {
	// 	res.redirect("/grade/profile");
	// }
	// else {
	// 	let theurl = await getToken();
	// 	res.redirect(theurl);
	// }

	// Store user information in the session
	req.session.name = "2026achen";
	req.session.username = "Andrew Chen";
	req.session.loggedin = true;

	// Redirect to profile page or any other page
	res.redirect('/grade/profile');

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
	if (req.session.admin) {
		res.render('contests');
	} else {
		res.render('contests');
		// res.redirect("/grade/profile");
		//res.send("Contests coming soon...");
	}
});
router.get("/contests/:id", checkLoggedIn, async (req, res) => {
	let cid = req.params.id;
	let problems = await grabContestProblems(cid);
        var timeMessage="Good Luck!";

	let vals = {
		title: "In-House #"+cid,
		timeStatus: timeMessage
	}
	var ordered=[];
	for(let i=0; i<problems.length; i++) {
		if(true) {
			ordered.push(problems[i]);
			ordered[ordered.length-1].solves=0;
			ordered[ordered.length-1].available = (!problems[i].secret || req.session.admin);
			ordered[ordered.length-1].users=[];
		}
	}

        let subs = await grabSubs(undefined, cid);
        let users = await grabUsers();
	// let subs=  [];
        for (let i=0; i<subs.length; i++) {
		if (parseInt(subs[i].timestamp)>getContestEnd(cid)) continue;
                let ind, pind;
                for (let j=0; j<users.length; j++) {
                        if (users[j].id == subs[i].user) {
                                ind = j;
                                break;
                        }
                }
                for (let j=0; j<ordered.length; j++) {
                        if (ordered[j].pid == subs[i].problemid) {
                                pind = j;
                                break;
                        }
                }
		if (pind==undefined) {
			console.log("error - cannot find matching problem for submission in rendering solve count");
			continue;
		}
		if (ind==undefined) {
			console.log("error - cannot find matching user for submission in rendering solve count");
			continue;
		}
                if (subs[i].verdict == "Accepted" || subs[i].verdict=="AC") {
			if (ordered[pind].users.includes(ind)) continue;
			ordered[pind].solves+=1;
			ordered[pind].users.push(ind);
                }
	}
	ordered.sort(function(a, b) {
		if (a.points==b.points)
			return a.pid>b.pid? 1:-1;
		return a.points>b.points? 1:-1;
	});
	
	if(ordered.length>0)
		res.render("contest", {title: vals.title, problems: ordered, user: req.session.userid, cid: cid, timeStatus: vals.timeStatus});
	else
		res.redirect('/grade/contests');
});
router.get("/contests/:id/standings", checkLoggedIn, async (req, res) => {
        let cid = req.params.id;
        let subs = await grabSubs(undefined, cid);
        let users = await grabUsers();
        let problems = await grabContestProblems(cid);
	problems.sort(function(a, b) {
		return a.pid>b.pid? 1 : -1;
	});
        let contestStart=getContestStart(cid);
	let contestEnd=getContestEnd(cid);

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
                        problems: tmp,
                        penalty: 0
                }
                load.push(row);
        }
        subs.sort(function(a, b) {
                return parseInt(a.timestamp)>parseInt(b.timestamp)? 1 : -1;
        });
	
        for (let i=0; i<subs.length; i++) {
		let contestEnd2=contestEnd;
		let contestStart2=contestStart;
		if(cid==3) {
			if([1002379].includes(subs[i].user)) contestEnd2+=50*60000; // shaurya bisht
			if([1001533].includes(subs[i].user)) contestEnd2+=((4*24)*60+30)*60000; // yicong wang
			if(getLateTakers(3).includes(subs[i].user)) {
				contestEnd2+=(2*24+20)*60*60000;
			}
		}
		else if(cid==4) {
			if(getLateTakers(4).includes(subs[i].user)) {
				contestEnd2+=(3*24+4)*60*60000;
				contestStart2+=((3*24+4)*60-5)*60000;
			}
		}
		if(parseInt(subs[i].timestamp)>contestEnd2) continue;
		//console.log("timestamps:", subs[i].timestamp, contestEnd);
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
                if (subs[i].verdict == "Accepted" || subs[i].verdict=="AC") {
                        if (load[ind].problems[pind]>=1) {
                                continue;
                        }
                        load[ind].solved +=problems[pind].points;
                        if (Number.isInteger(parseInt(subs[i].timestamp))) {
                                let time = parseInt(subs[i].timestamp);
                                if (true||time > contestStart2) {
                                        load[ind].penalty += parseInt((time-contestStart2)/60000); // convert milliseconds to minutes
                                }
                                else {
                                        console.log("error, timestamp before contest start")
                                }
                        }
                        else {
                                console.log("error, invalid timestamp");
                        }
                        if (load[ind].problems[pind]<0) {
                                load[ind].penalty -= 10*load[ind].problems[pind];
                        }
                        load[ind].problems[pind] = 1-load[ind].problems[pind];
                }
                else {
                        if (load[ind].problems[pind] < 1) {
                                load[ind].problems[pind] -= 1;
                        }
                }
        }
        let load2 = [];
        for (let i=0; i<load.length; i++) {
                let val = load[i];
                if (val.solved > 0) {
			if(val.penalty<0) val.penalty=0;
                        if(val.penalty>0) load2.push(val);
                }
        }
        load2.sort(function(a,b){
                if (a.solved==b.solved) return a.penalty > b.penalty ? 1 : -1;
                return a.solved < b.solved ? 1 : -1;
        });
	for (let i=0; i<load2.length; i++) {
		if(i>0 && load2[i].solved==load2[i-1].solved && load2[i].penalty==load2[i-1].penalty) load2[i].rank=load2[i-1].rank;
		else load2[i].rank=i+1;
	}
	res.render("standings", {title: "In-House #"+cid, user:
		req.session.userid, cid: cid, pnum: problems.length, load:
		load2}); });
router.get("/contests/:id/status", checkLoggedIn, async (req, res) => {
        let user = req.query.user;
        let contest = req.query.contest;
        let admin = await checkAdmin(req.session.userid); //seems insecure but look at later :DD:D:D:D
        if (user == undefined && contest == undefined && !admin) {
                user = req.session.userid;
        }
	if (user != undefined) user=Number(user);
	if (contest != undefined) contest=Number(contest);
        let submissions = await grabSubs(user, contest);
	let cid = req.params.id;
        res.render("contestStatus", {title: "In-House #"+cid, user: req.session.userid, cid: cid, submissions: submissions});
});
router.get("/problemset", checkLoggedIn, async (req, res) => {
	let page = req.query.page;
	if (page == undefined) page = 0;
	let start = page*5; //write multipage later
	let vals = await grabAllProblems();
	let lst = [];

	for (let i=0; i<vals.length; i++) {
		let p = vals[i];
		if (!p.secret || req.session.admin) lst.push(p);
	}
	lst.sort(function(a, b) {
		return a.pid>b.pid?1:-1;
	});
	
	res.render("gradeProblemset", {problems: lst});
});
router.get("/problemset/:id", checkLoggedIn, async (req, res) => { //req.params.id
	let vals = await grabProblem(req.params.id);
	let contestStart=getContestStart(vals.cid);
	let userid=req.session.userid;
	if(vals.cid==3) {
		if([1002379].includes(userid)) contestStart+=50*60000; // shaurya bisht
		if([1001533].includes(userid)) contestStart+=((4*24)*60+30)*60000; // yicong wang
		if(getLateTakers(3).includes(userid)) contestStart+=(2*24+20)*60*60000;
	}
	else if(vals.cid==4) {
		if(getLateTakers(4).includes(userid)) contestStart+=(3*24+4)*60*60000; // 6:30 pm on monday
	}

	vals.title = vals.name;
	vals.pid = req.params.id;
	if(!req.session.admin && (new Date()).getTime()<=contestStart) {
		console.log(userid, "has tried to access problem early for contest", vals.cid, "at time", new Date().getTime());
		res.send("contest has not started");
		return;
	}

	console.log(vals);

	let back  = req.query.back;
	if (back) {
		vals.back = back;
	}
	else {
		vals.back = "/grade/problemset";
	}

	if (req.session.admin || !vals.secret) {
		console.log("trying to render problem");
		res.render("gradeProblem", vals);
	}
	else {
		res.redirect("/grade/problemset");
	}
});
router.get("/submit", checkLoggedIn, (req, res) => {
	if (false) {
		res.send("contest ended");
		//res.redirect("/grade/profile")
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
		console.log("invalid language");
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
	let timestamp = today.getTime();

	let contestStart=getContestStart(cid);
	let contestEnd=getContestEnd(cid);
	if (!req.session.admin && timestamp<=contestStart) {
		res.send("contest currently unavailable");
	}

	let sid = await createSubmission(req.session.userid, file, pid, language, problemname, cid, timestamp);
	console.log("submission id:", sid);
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
		if (!req.session.admin && vals.insight[0] == 'D') {
			//vals.insight = "You cannot view feedback (not a sample testcase).";
			vals.insight = vals.insight.substring(67);
		}
		vals.admin = req.session.admin;

		res.render("status", {submission: vals});
	}
	else {
		res.send("You do not have permission to view this submission.");
	}
});



function checkLoggedIn(req, res, next) {
	if (false && !req.session.admin) {
		res.send("The TJ Computer Team Grader will be down for maintenance in preparation for the in-house contest. We hope to see you there!");
	}
	else {	
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
}


router.get("/leaderboard", checkLoggedIn, async (req, res) => {
	res.render("leaderboard");
});


router.get("/rating", checkLoggedIn, async (req, res) => {
	const username = req.query.username || 'Dan';
	res.render("rating", {username});
});

module.exports = router;
