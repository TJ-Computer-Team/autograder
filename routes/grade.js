const express = require('express');
const router = express.Router();
const {grab} = require("./displayProblem");

router.get("/", (req, res) => {
    res.render("grade");
});
router.get("/problemset", (req, res) => {
    let page = req.query.page;
    if (page == undefined) page = 0;
    let start = page*5; //write multipage later
    res.render("gradeProblemset", {p1: 0, p1n: "0", p2: 1, p2n: "1", p3: 2, p3n: "2", p4: 3, p4n: "3", p5: 4, p5n: "4"});
});
router.get("/problemset/:id", async (req, res) => { //req.params.id
    let vals = await grab(req.params.id);
    res.render("gradeProblem", {title: vals.title, statement: vals.statement, id: vals.id});
});


router.get("/submit", (req, res) => {
    res.render("gradeSubmit");
});

router.post("/status", (req, res) => {
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
router.get("/status", (req, res) => {
    res.send("not success");
});

module.exports = router;
