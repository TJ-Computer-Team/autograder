const express = require("express");
const { allowedNodeEnvironmentFlags } = require("process");
const app = express();
const port = 3000;

console.log("start");

app.use(express.static("./public"));

app.use(express.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("index");
}) 

const gradeRouter = require("./routes/grade");

app.use("/grade", gradeRouter);

app.listen(port);
