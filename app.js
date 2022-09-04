require('dotenv').config();
const express = require("express");
const app = express();
const port = 3000;
const session = require('express-session');
const gradeRouter = require("./routes/grade");
const {getToken} = require("./oauth");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true}));
app.use("/grade", gradeRouter);

app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
    let theurl = await getToken();
    res.render("index", {loginurl: theurl});
});

console.log("start");
app.listen(port);
