require('dotenv').config();
const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {
    grab,
    grabProblem,
    grabAllProblems,
    addProblem
} = require("./sql");
const {
    getQueue,
    toggleQueue,
    run,
    skip
} = require("./runTests");

router.get("/", async (req, res) => {
    let admin = req.session.admin;
    if (admin) {
        let vals = await grabAllProblems(admin);
        vals.sort(function(a, b) {
            return a.pid > b.pid ? 1 : -1;
        });
        res.render("admin", {
            problems: vals
        });
    } else {
        res.redirect("/");
    }
});
router.get("/skip", async (req, res) => {
    let admin = req.session.admin;
    if (admin) {
        let sid = req.query.sid;
        await skip(sid);
        res.redirect("/admin/queue");
    } else {
        res.redirect("/");
    }
});
router.get("/togglepause", async (req, res) => {
    let admin = req.session.admin;
    if (admin) {
        let current = req.query.paused;
        if (current == 'false') {
            //pause the thing
            toggleQueue(true);
        } else {
            //unpause
            toggleQueue(false);
            run();
        }
        res.redirect("/admin/queue");
    } else {
        res.redirect("/");
    }
});
router.get("/queue", async (req, res) => {
    let admin = req.session.admin;
    if (admin) {
        let payload = getQueue();
        let tasks = payload.tasks;
        let paused = payload.paused;
        res.render("adminqueue", {
            submissions: tasks,
            paused: paused
        });
    } else {
        res.redirect("/");
    }
});
router.get("/createProblem", async (req, res) => {
    let pid = req.query.pid;
    if (!pid) {
        pid = -1;
    }
    let admin = req.session.admin;
    if (admin) {
        payload = await grabProblem(pid);
        if (!payload) {
            payload = {
                pid: pid,
                pname: undefined,
                cid: -1,
                state: undefined,
                checkid: -1,
                pts: 1,
                tl: 1000,
                ml: 256,
                secret: true,
                inputtxt: undefined,
                outputtxt: undefined,
                samples: undefined
            }
        } else {
            payload.pid = pid;
            payload.pname = payload.name;
            payload.state = payload.statement;
        }
        res.render("portal", payload);
    } else {
        res.send("You are not an admin");
    }
});
router.get("/getProblem", async (req, res) => {
    let admin = req.session.admin;
    if (admin) {
        let vals = await grab(req.query.id);
        res.json(vals);
    } else {
        res.send("You are not an admin");
    }
});
/*
router.get("/addChecker", async(req, res)=>{ // not in use
        let cid = req.query.cid;
        if (cid == undefined) {
                cid = -1;
        }
        let admin = req.session.admin;
        if (admin) {
                res.render("addChecker", {pid:0, code:""});
        }
});
router.post("/addCheck", async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                console.log("attempteing to create");
                let pid = req.body.pid;
                let code = req.body.code;
                let lang = req.body.lang;
                let ret = {
                        "pid": pid,
                        "code": code
                };
                console.log(ret);
                await axios.post('http://10.150.0.3:8080/addChecker', querystring.stringify(ret))
                .then(res => {
                        console.log(res);
                }).catch((error) => {
                        console.log("ERROR OOPS");
                        console.log(error);
                });
                res.render("addChecker", ret);
        }
});
router.get("/addTest", async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                res.render("addTests", {tid:0, pts:100, pid:0, test:"", out:""});
        }
});
router.post("/addTest", async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                let pid= req.body.pid;
                let tid= req.body.tid;
                let test= req.body.in;
                let out = req.body.out;
                let ret = {
                        "pid": pid,
                        "test":test,
                        "tid": parseInt(tid),
			"out": out
                };
                await axios.post('http://10.150.0.3:8080/addTest', querystring.stringify(ret))
                .then(res => {
                        console.log(res);
                }).catch((error) => {
                        console.log("ERROR OOPS");
                        console.log(error);
                });
                console.log(ret);
		ret.tid = parseInt(tid) + 1;
                res.render("addTests", ret);
        }
});
router.get("/finProblem", async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                res.render("finProblem", {"pid":0});
        }
});
router.post("/finProblem", async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                let pid = req.body.pid;
                let ret = {
                        "pid": pid
                }
                makePublic(pid);
                res.render("finProblem", ret);
        }
});
router.get("/compileTests", async(req, res)=>{ // not in use
        console.log("HI");
        let admin = req.session.admin;
        if (admin) {
                res.render("finProblem", {"pid":0});
        }
});
router.post("/compileTests",  async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                let pid = req.body.pid;
                let ret = {
                        "pid": pid
                }
                compileTests(pid);
                res.render("finProblem", ret);
        }
});
router.get("/addSol",  async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                res.render("addSol", {pid:0, code:""});
        }
});
router.post("/addSol", async(req, res)=>{ // not in use
        let admin = req.session.admin;
        if (admin) {
                console.log("attempting to create a solution");
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
*/
router.post("/create", async (req, res) => {
    let admin = req.session.admin;
    if (admin) {
        console.log("Attempting to create a problem");
        let pts = req.body.pts;
        let pid = req.body.pid;
        let pname = req.body.pname;
        let cid = req.body.cid;
        let state = req.body.state;
        let tl = req.body.tl;
        let ml = req.body.ml;
        let secret = req.body.secret;
        let checkid = req.body.checkid;
        let inputtxt = req.body.inputtxt;
        let outputtxt = req.body.outputtxt;
        let samples = req.body.samples;
        console.log(req.body);
        let ret = {
            "pts": pts,
            "pid": pid,
            "pname": pname,
            "cid": cid,
            "state": state,
            "tl": tl,
            "ml": ml,
            "secret": secret,
            "checkid": checkid,
            "inputtxt": inputtxt,
            "outputtxt": outputtxt,
            "samples": samples
        };
        await addProblem(pid, pname, cid, checkid, '', state, tl, ml, false, secret, inputtxt, outputtxt, samples, pts);
        res.render("portal", ret);
    } else {
        res.send("You are not an admin");
    }
});
router.get("/disableAdmin", async (req, res) => {
    req.session.admin = false;
    res.redirect("/");
});

module.exports = router;
