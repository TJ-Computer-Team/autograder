require('dotenv').config();
const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {
    grabProblem,
    grabAllProblems,
    grabSubs,
    grabStatus,
    createSubmission,
    grabProfile,
    grabUsers,
    grabContestProblems,
    validateUser,
    updateUSACO,
    updateCF,
    getContest,
    getAllContests,
    getStats
} = require("./sql");
const {
    queue
} = require("./runTests");
const {
    processFunction,
    getToken
} = require("../oauth");
const {
    check
} = require("../profile");
const upload = require('express-fileupload');
const lastSubmission = new Map();
router.use(upload());

function getLateTakers(cid) {
    if (cid == 3) return [1001731, 1001623, 1001620, 1001475, 1002158, 1001944, 1001092, 1002595, 1001904, 1001642]; // anush devkar, armaan ahmed, anusha agarwal, kanishk sivanadam, max zhao, rishikesh narayana, samarth bhargav, nathan liang, esha m, navya arora
    if (cid == 4) return [1002636, 1001207, 1001608, 1002135]; //svaran, avni, arjun, olivia
}

router.get("/authlogin", async (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/grade/profile");
    } else {
        let theurl = await getToken();
        res.redirect(theurl);
    }
});
router.get("/login", async (req, res) => {
    let CODE = req.query.code;
    let data = await processFunction(CODE, req, res);
    if (data) {
        await check(data.user_data, data.req, data.res);
    } else {
        res.send("Error logging in as ION could not process our request");
    }
});
router.get("/tjioilogin", (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/grade/profile');
    } else {
        res.render('tjioiLogin');
    }
});
router.post("/tjioilogin", async (req, res) => {
    let id = parseInt(req.body.id);
    if (isNaN(id)) res.send("Invalid credentials");
    let password = req.body.password;
    let valid = await validateUser(id, password);
    if (valid) {
        let data = {
            "id": id
        };
        await check(data, req, res);
    } else {
        res.send("Invalid credentials");
    }
});
router.post("/updateStats", async (req, res) => {
    let usaco = req.body.usaco_div;
    let cf = req.body.cf_handle;
    if (usaco != "" && usaco != undefined) {
        await updateUSACO(req.session.userid, usaco);
        req.session.usaco_div = usaco;
    }
    if (cf != "" && cf != undefined) {
        await updateCF(req.session.userid, cf);
        req.session.cf_handle = cf;
    }
    res.redirect('/grade/profile');
});
router.get("/info", checkLoggedIn, async (req, res) => {
    res.render("info", {
        tjioi: req.session.tjioi
    });
});
router.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});
router.get("/profile", checkLoggedIn, (req, res) => {
    if (req.session.tjioi) {
        res.render("tjioiProfile", {
            name: req.session.name,
            username: req.session.username
        });
    } else {
        res.render("profile", {
            name: req.session.name,
            username: req.session.username,
            usaco_div: req.session.usaco_div,
            cf_handle: req.session.cf_handle
        });
    }
});
router.get("/profile/:id", checkLoggedIn, async (req, res) => {
    if (req.session.tjioi) {
        res.redirect("/grade/profile");
    } else {
        let vals = await grabProfile(req.params.id);
        if (vals == false) {
            res.send("No such user");
        } else {
            res.render("fprofile", {
                name: vals.name,
                username: vals.username,
                cf: vals.cf,
                usaco: vals.usaco,
                admin: req.session.admin
            });
        }
    }
});
router.get("/", async (req, res) => {
    res.redirect("/grade/profile");
});
router.get("/attendance", async (req, res) => {
    if (req.session.loggedin) {
        deviceClass = 'main';
        if (req.session.mobile) deviceClass = 'phone';
        res.render("attendance", {
            name: vals.name,
            username: vals.username,
            device: deviceClass
        });
    } else {
        res.redirect("/");
    }
});
router.post("/attendanceComplete", async (req, res) => {
    if (req.session.loggedin) {
        let pass = req.body.pass;
        let block = req.body.block;
        res.send("Attendance complete, thank you");
    } else {
        res.redirect("/");
    }
});
router.get("/contests", checkLoggedIn, async (req, res) => {
    let contests = await getAllContests();
    contests = contests.filter(function(elem) {
        return !(req.session.tjioi ^ elem.tjioi);
    });
    contests.sort(function(a, b) {
        return (a.id < b.id ? -1 : 1);
    });
    res.render('contests', {
        contests: contests
    });
});
router.get("/contests/:id", checkLoggedIn, async (req, res) => {
    let cid = req.params.id;
    let problems = await grabContestProblems(cid);
    if (problems == undefined) {
        problems = []
    }
    let time = (new Date()).getTime();
    let contest = await getContest(cid);
    let contestStart = new Date(contest.start).getTime();
    let contestEnd = new Date(contest.end).getTime();
    let timeMessage = contestEnd;
    let timeType = "end";
    if (time < contestStart) {
        timeType = "start";
        timeMessage = contestStart;
    }
    var ordered = [];
    for (let i = 0; i < problems.length; i++) {
        if (true) {
            ordered.push(problems[i]);
            ordered[ordered.length - 1].solves = 0;
            ordered[ordered.length - 1].available = (!problems[i].secret || req.session.admin);
            ordered[ordered.length - 1].users = [];
        }
    }
    let subs = await grabSubs(undefined, cid);
    let users = await grabUsers();
    for (let i = 0; i < subs.length; i++) {
        if (parseInt(subs[i].timestamp) > contestEnd) continue;
        let ind, pind;
        for (let j = 0; j < users.length; j++) {
            if (users[j].id == subs[i].user) {
                ind = j;
                break;
            }
        }
        for (let j = 0; j < ordered.length; j++) {
            if (ordered[j].pid == subs[i].problemid) {
                pind = j;
                break;
            }
        }
        if (pind == undefined) {
            console.log("error - cannot find matching problem for submission in rendering solve count: "+subs[i].problemid);
            continue;
        }
        if (ind == undefined) {
            console.log("error - cannot find matching user for submission in rendering solve count: "+subs[i].user);
            continue;
        }
        if (subs[i].verdict == "Accepted" || subs[i].verdict == "AC") {
            if (ordered[pind].users.includes(ind)) continue;
            ordered[pind].solves += 1;
            ordered[pind].users.push(ind);
        }
    }
    ordered.sort(function(a, b) {
        if (a.points == b.points)
            return a.pid > b.pid ? 1 : -1;
        return a.points > b.points ? 1 : -1;
    });
    if (ordered.length > 0)
        res.render("contest", {
            title: contest.name,
            problems: ordered,
            user: req.session.userid,
            cid: cid,
            timeStatus: timeMessage,
            timeType: timeType,
            editorial: contest.editorial
        });
    else
        res.redirect('/grade/contests');
});
async function getStandings(cid) {
    let subs = await grabSubs(undefined, cid);
    let users = await grabUsers();
    let problems = await grabContestProblems(cid);
    problems.sort(function(a, b) {
        return a.pid > b.pid ? 1 : -1;
    });
    let contest = await getContest(cid);
    let contestStart = new Date(contest.start).getTime();
    let contestEnd = new Date(contest.end).getTime();
    let load = [];
    for (let i = 0; i < users.length; i++) {
        let tmp = [];
        for (let j = 0; j < problems.length; j++) {
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
        return parseInt(a.timestamp) > parseInt(b.timestamp) ? 1 : -1;
    });
    for (let i = 0; i < subs.length; i++) {
        let contestEnd2 = contestEnd;
        let contestStart2 = contestStart;
        if (cid == 3) {
            if ([1002379].includes(subs[i].user)) contestEnd2 += 50 * 60000; // shaurya bisht
            if ([1001533].includes(subs[i].user)) contestEnd2 += ((4 * 24) * 60 + 30) * 60000; // yicong wang
            if (getLateTakers(3).includes(subs[i].user)) {
                contestEnd2 += (2 * 24 + 20) * 60 * 60000;
            }
        } else if (cid == 4) {
            if (getLateTakers(4).includes(subs[i].user)) {
                contestEnd2 += (3 * 24 + 4) * 60 * 60000;
                contestStart2 += ((3 * 24 + 4) * 60 - 5) * 60000;
            }
        }
        if (parseInt(subs[i].timestamp) > contestEnd2 || parseInt(subs[i].timestamp) < contestStart2) continue;
        let ind, pind;
        for (let j = 0; j < load.length; j++) {
            if (load[j].id == subs[i].user) {
                ind = j;
                break;
            }
        }
        for (let j = 0; j < problems.length; j++) {
            if (problems[j].pid == subs[i].problemid) {
                pind = j;
                break;
            }
        }
        if (subs[i].verdict == "Accepted" || subs[i].verdict == "AC") {
            if (load[ind].problems[pind] >= 1) {
                continue;
            }
            load[ind].solved += problems[pind].points;
            if (Number.isInteger(parseInt(subs[i].timestamp))) {
                let time = parseInt(subs[i].timestamp);
                load[ind].penalty += parseInt((time - contestStart2) / 60000);
            } else {
                console.log("Error, invalid timestamp");
            }
            if (load[ind].problems[pind] < 0) {
                load[ind].penalty -= 10 * load[ind].problems[pind];
            }
            load[ind].problems[pind] = 1 - load[ind].problems[pind];
        } else {
            if (load[ind].problems[pind] < 1) {
                load[ind].problems[pind] -= 1;
            }
        }
    }
    let load2 = [];
    for (let i = 0; i < load.length; i++) {
        let val = load[i];
        if (val.solved > 0 && !(cid==6 && [1002404,1002587,1001623,1001694,1001672,1001944,1001560,1001608,1001865,1001217,1001317,1003218,69].includes(val.id)) && !(cid==7 && [1001849,1001623].includes(val.id))) {
            if (val.penalty >= 0) load2.push(val);
        }
    }
    load2.sort(function(a, b) {
        if (a.solved == b.solved) return a.penalty > b.penalty ? 1 : -1;
        return a.solved < b.solved ? 1 : -1;
    });
    for (let i = 0; i < load2.length; i++) {
        if (i > 0 && load2[i].solved == load2[i - 1].solved && load2[i].penalty == load2[i - 1].penalty) load2[i].rank = load2[i - 1].rank;
        else load2[i].rank = i + 1;
    }
    return {title: contest.name, pnum: problems.length, load: load2};
}
router.get("/contests/:id/standings", checkLoggedIn, async (req, res) => {
    let cid = req.params.id;
    let standings = await getStandings(cid);
    res.render("standings", {
        title: standings.title,
        user: req.session.userid,
        cid: cid,
        pnum: standings.pnum,
        load: standings.load
    });
});
router.get("/contests/:id/status", checkLoggedIn, async (req, res) => {
    let user = req.query.user;
    let cid = req.params.id;
    if (user != undefined) user = Number(user);
    let contest = await getContest(cid);
    let submissions = await grabSubs(user, cid);
    submissions = submissions.filter(function(elem) {
        return req.session.admin || elem.timestamp > new Date(contest.start).getTime();
    });
    res.render("contestStatus", {
        title: contest.name,
        user: req.session.userid,
        cid: cid,
        submissions: submissions
    });
});
router.get("/problemset", checkLoggedIn, async (req, res) => {
    let vals = await grabAllProblems(req.session.admin);
    let lst = [];
    for (let i = 0; i < vals.length; i++) {
        let p = vals[i];
        if ((!p.secret || req.session.admin) && (req.session.tjioi ^ p.contestid < 202400)) lst.push(p);
    }
    lst.sort(function(a, b) {
        return a.pid > b.pid ? 1 : -1;
    });
    res.render("gradeProblemset", {
        problems: lst
    });
});
router.get("/problemset/:id", checkLoggedIn, async (req, res) => {
    let vals = await grabProblem(req.params.id);
    let contest = await getContest(vals.cid);
    let contestStart = new Date(contest.start).getTime();
    let userid = req.session.userid;
    if (vals.cid == 3) {
        if ([1002379].includes(userid)) contestStart += 50 * 60000; // shaurya bisht
        if ([1001533].includes(userid)) contestStart += ((4 * 24) * 60 + 30) * 60000; // yicong wang
        if (getLateTakers(3).includes(userid)) contestStart += (2 * 24 + 20) * 60 * 60000;
    } else if (vals.cid == 4) {
        if (getLateTakers(4).includes(userid)) contestStart += (3 * 24 + 4) * 60 * 60000; // 6:30 pm on monday
    }
    vals.title = vals.name;
    vals.pid = req.params.id;
    if (!req.session.admin && (new Date()).getTime() <= contestStart) {
        console.log(userid, "has tried to access problem early for contest", vals.cid, "at time", new Date().getTime());
        res.send("Contest has not started");
        return;
    }
    let back = req.query.back;
    if (back) {
        vals.back = back;
    } else {
        vals.back = "/grade/problemset";
    }
    if (req.session.admin || !vals.secret) {
        res.render("gradeProblem", vals);
    } else {
        res.redirect(vals.back);
    }
});
router.get("/submit", checkLoggedIn, async (req, res) => {
    let user = req.session.userid;
    let last = await grabSubs(user);
    problems = await grabAllProblems(req.session.admin);
    let problemname;
    for (let i = 0; i < problems.length; i++) {
        if (problems[i].pid == req.query.problem) problemname = problems[i].name;
    }
    problems = problems.filter(function(elem) {
        return req.session.tjioi ^ elem.contestid < 202400;
    });
    problems.sort(function(a, b) {
        if (a.pid < b.pid) return -1;
        return 1;
    });
    lastSub='python';
    if (last.length>0) lastSub = last[last.length - 1].language;
    res.render("gradeSubmit", {
        problemid: req.query.problem,
        problemname: problemname,
        lastlang: lastSub,
        problem: problems
    });
});
router.post("/status", checkLoggedIn, async (req, res) => { // sends file to another website
    let language = req.body.lang;
    if (language != 'python' && language != 'cpp' && language != 'java') {
        res.send("Unacceptable code language");
        return;
    }
    let pid = req.body.problemid;
    if (pid == "") {
        res.send("You did not input any problem id");
        return;
    }
    let file = req.body.code;
    let problem = await grabProblem(pid);
    let cid = problem.cid;
    let problemname = problem.name;
    let today = new Date();
    let timestamp = today.getTime();
    if (req.files && Object.keys(req.files).length != 0) {
        let sampleFile = req.files.files;
        reg = /^.*\.(py|java|cpp)$/i
        language = sampleFile.name.match(reg)
        if (language == null) {
            res.send("Invalid file extension");
            return;
        }
        language = language[1]
        if (language == "py") {
            language = 'python';
        }
        file = sampleFile.data.toString()
    }
    let contest = getContest(cid);
    let contestStart = new Date(contest.start).getTime();
    if (!req.session.admin && timestamp <= contestStart) {
        res.send("contest has not started yet");
    }
    let prevts = lastSubmission.get(req.session.userid);
    if (prevts == undefined) {
        prevts = -30000
    }
    if (timestamp - prevts > 30000 || req.session.admin) {
        let sid = await createSubmission(req.session.userid, file, pid, language, problemname, cid, timestamp);
        lastSubmission.set(req.session.userid, timestamp);
        await queue(pid, sid);
        res.redirect("/grade/status");
    } else {
        res.render("spamming");
        return;
    }
});
router.get("/status", checkLoggedIn, async (req, res) => {
    let user = req.query.user;
    let contest = req.query.contest;
    let admin = req.session.admin;
    if (user == undefined && contest == undefined && !admin) {
        user = req.session.userid;
    }
    let submissions = await grabSubs(user, contest);
    submissions = submissions.filter(function(elem) {
        return req.session.tjioi ^ elem.contest < 202400;
    });
    let page = req.query.page;
    if (page == undefined) page = 1;
    res.render("gradeStatus", {
        submissions: submissions,
        viewAsAdmin: admin,
        page: page
    });
});
router.get("/status/:id", checkLoggedIn, async (req, res) => {
    let vals = await grabStatus(req.params.id);
    if (vals.user == req.session.userid || req.session.admin) {
        if (!req.session.admin && vals.insight != undefined && vals.insight.startsWith("Viewing as admin")) {
            vals.insight = "You cannot view feedback (not a sample test)";
        }
        vals.admin = req.session.admin;
        res.render("status", {
            submission: vals
        });
    } else {
        res.send("You do not have permission to view this submission");
    }
});
router.get("/rankings", checkLoggedIn, async (req, res) => {
    res.redirect('/grade/rankings/2025');
});
router.get("/rankings/:season", checkLoggedIn, async (req, res) => {
    let season = Number(req.params.season);
    let rankings = await getStats(season);
    for (let i = 0; i < rankings.length; i++) {
        if (rankings[i].usaco == "plat") {
            rankings[i].usaco = 1900;
        } else if (rankings[i].usaco == "gold") {
            rankings[i].usaco=1600;
        } else if (rankings[i].usaco == "silver") {
            rankings[i].usaco=1200;
        } else {
            rankings[i].usaco=800;
        }
        rankings[i].inhouses=[]
    }
    let contests = await getAllContests();
    let contest_count = 0;
    for (let i = 0; i < contests.length; i++) {
        if (contests[i].rated == true && contests[i].season == season) {
            contest_count ++;
            let standings = await getStandings(contests[i].id);
            for (let useri = 0; useri < rankings.length; useri++) {
                let took = false;
                for (let j = 0; j < standings.load.length; j++) {
                    if (rankings[useri].id == standings.load[j].id) {
                        rankings[useri].inhouses.push(1200 * (standings.load.length - standings.load[j].rank + 1) / standings.load.length + 800);
                        took = true;
                        break;
                    }
                }
                if (!took) {
                    rankings[useri].inhouses.push(0);
                }
            }
        }
    }
    for (let i = 0; i < rankings.length; i++) {
        rankings[i].inhouses.sort(function(a, b) {
            return a-b;
        });
        let author_drops=0;
        if ([1001521,1001932,1001207,1001092,1002872,1001805,1001549,1002135,1001753].includes(rankings[i].id)) {
            author_drops++;
        }
        if ([1001521,1002872,1001694,1001092,1002135,1001549,1001805,1001207].includes(rankings[i].id)) {
            author_drops++;
        }
        let drops = Math.min(2, contest_count - 2) + author_drops;
        drops = Math.max(0, drops);
        let overall = 0;
        for (let j = drops; j < contest_count; j++) {
            overall += rankings[i].inhouses[j];
        }
        if (contest_count > 0 && contest_count - drops > 0) {
            overall /= contest_count - drops;
        }
        rankings[i].inhouse = overall;
        let vals = [rankings[i].usaco, rankings[i].cf, rankings[i].inhouse];
        vals.sort(function(a, b) {
            return a-b;
        });
        rankings[i].index = 0.2 * vals[0] + 0.35 * vals[1] + 0.45 * vals[2];
    }
    rankings = rankings.filter(function(elem) {
        return elem.usaco > 800 || elem.cf > 0 || elem.inhouse > 0;
    });
    rankings.sort(function(a, b) {
        return a.index < b.index ? 1 : -1;
    });
    for (let i = 0; i < rankings.length; i++) {
        if (i > 0 && rankings[i].index == rankings[i - 1].index) {
            rankings[i].rank =  rankings[i - 1].rank;
        }
        else rankings[i].rank = i + 1;
    }
    res.render("rankings", {
        rankings: rankings
    })
});
function checkLoggedIn(req, res, next) {
    if (req.session.loggedin) {
        if (req.session.mobile) {
            res.redirect("/grade/attendance");
        } else {
            next();
        }
    } else {
        res.redirect("/");
    }
}

module.exports = router;
