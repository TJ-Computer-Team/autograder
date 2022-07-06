require('dotenv').config();
const express = require("express");
const { allowedNodeEnvironmentFlags } = require("process");
const app = express();
const port = 3000;
const axios = require('axios');
const simpleoauth2 = require('simple-oauth2');
const session = require('express-session');

const Client = require('pg').Client;
const cl =  new Client ({
    user: "postgres",
    password: process.env.PGPASSWORD,
    port: 5432,
    database: "autograder"
});

// cl.connect()
// .then(() => console.log("Connected"))
// .then(() => cl.query("INSERT INTO users VALUES ($1, $2)", [3, 'DanielOrz']))
// .then(() => cl.query("SELECT * FROM users"))
// .then(results => console.log(results.rows))
// .catch(error => console.log(error))
// .finally(() => cl.end());

console.log("start");

const gradeRouter = require("./routes/grade");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true}));
app.use("/grade", gradeRouter);
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    let theurl = getToken();
    theurl.then(function(result) {
        res.render("index", {loginurl: result});
    });
});

app.get("/login", (req, res)=>{ 
    let CODE = req.query.code;
    processFunction(CODE, req, res);
});
app.get("/profile", checkLoggedIn, (req, res)=>{ 
    res.render("profile", {name: req.session.name, username: req.session.username});
});

function checkLoggedIn(req, res, next) {
    if (req.session.loggedin) {
        next();
    }
    else {
        res.redirect("/");
    }
}

let client_id = process.env.CLIENT_ID;
let client_secret = process.env.CLIENT_SECRET;
let client_url = process.env.CLIENT_REDIRECT_URI;
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');
const config = {
    client: {
        id: client_id,
        secret: client_secret
    },
    auth: {
        tokenHost:     'https://ion.tjhsst.edu/oauth/',
        authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
        tokenPath:     'https://ion.tjhsst.edu/oauth/token/'
    }
};
const client = new AuthorizationCode(config);

async function processFunction(CODE, req, res2) {
    //console.log("recieved " + CODE);
    const tokenParams = {
        code: CODE,
        redirect_uri: client_url,
        scope: ['read']
    };
    try {
        let accessToken = await client.getToken(tokenParams); 
        req.session.accessToken = accessToken;
        req.session.loggedin = true;
        axios.get('https://ion.tjhsst.edu/api/profile?format=json', {
            headers: {
                'Authorization': 'Bearer '+ accessToken.token.access_token
            }
        }).then(res => {
            let user_data = res.data;
            req.session.name = user_data.display_name;
            req.session.username = user_data.ion_username;
            res2.redirect("/profile");
        })
        .catch((error) => {
            console.log(error);
            res2.redirect("/");
        });
    } catch (error) {
        console.log('Access Token Error', error.message);
    }
}
async function getToken() {
    const login_url = client.authorizeURL({
        redirect_uri: client_url,
        scope: ['read']
    });
    return login_url;
}

app.listen(port);
