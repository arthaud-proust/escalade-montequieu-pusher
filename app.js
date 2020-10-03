const express = require('express')
const webpush = require("web-push")
const app = express()
const bodyParser = require('body-parser')
const timeout = require('connect-timeout') //express v4
const multer = require('multer')
const upload = multer()
const cors = require('cors')
const path = require('path')

const corsRules ={
    origin: process.env.ALLOW_READ_MESSAGE_FROM || "*",
    methods: "GET,HEAD,POST",
    maxAge: 600
};

const Messages = require('./messages.js')
const messages = new Messages(webpush);

// let subscriptions = {};
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const subjectVapid = process.env.SUBJECT_VAPID;
webpush.setVapidDetails(subjectVapid, publicVapidKey, privateVapidKey);


// support request
app.use(bodyParser.json());                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(express.json());                            // to support JSON-encoded bodies
app.use(express.urlencoded());                      // to support URL-encoded bodies
app.use(upload.array()); 
app.use(timeout('1h'));                             // set timeout to 1hour

//add the router folders
app.use(express.static(__dirname + '/public'));     // Store all assets files in public folder.
app.use(express.static(__dirname + '/views'));      // Store all HTML files in view folder.
app.use(express.static(__dirname + '/scripts'));    // Store all JS and CSS in Scripts folder.


/* ---- routes ---- */
app.use(cors(corsRules));  
app.post('/fetch', (req, res)=>messages.fetch(req, res));
app.post('/last-messages-id', (req, res)=>messages.lastMessagesId(req, res))
app.post('/post', (req, res)=>messages.post(req, res));
// Subscribe Route
app.post("/subscribe", (req, res) => messages.subscribe(req, res));

app.get("/notif", (req, res) => {
    if(req.body.key !== process.env.PUSH_KEY) {
        res.status(401).send("invalid key");
    } else {
        const payload = JSON.stringify({ 
            title: req.body.title, 
            body: req.body.body,
            url: req.body.url
        });

        res.status(201).json({});

        Object.values(subscriptions).forEach(subscription=>{
            webpush
                .sendNotification(subscription, payload)
                .catch((err) => console.error(err));
        });
    }
});


app.listen(process.env.PORT || 8001);