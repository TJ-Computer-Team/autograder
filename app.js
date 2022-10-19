require('dotenv').config();
const express = require("express");
const app = express();
const port = 8080;
const gradeRouter = require("./routes/grade");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true}));
app.use("/grade", gradeRouter);

app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
    res.render("index", {loginurl: "/grade/authlogin"});
});

console.log("start");
app.listen(port);
