const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render("gradeIndex");
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
