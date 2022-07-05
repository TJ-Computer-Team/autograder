const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render("gradeIndex");
});

router.post("/status", (req, res) => {
    let code = req.body.code;
    res.send(req.body.code);
});
router.get("/status", (req, res) => {
    res.send("not success");
});

module.exports = router;