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
app.post('/post', (req, res)=>messages.post(req, res));
app.get('/test', (req, res)=>res.sendFile(path.join(__dirname+'/views/test.html')));



// Subscribe Route
app.post("/subscribe", (req, res) => {
	// Get pushSubscription object
	const subscription = req.body;
    messages.subscriptions[subscription.keys.auth]=subscription;
    console.log(subscription);
	// Send 201 - resource created
	res.status(201).json({});

	// Create payload
	// const payload = JSON.stringify({ 
    //     title: "Push Test", 
    //     body: 'Test'
    // });
        
    // // Pass object into sendNotification
	// webpush
	// 	.sendNotification(subscription, payload)
	// 	.catch((err) => console.error(err));
});

app.get("/notif", (req, res) => {

    const payload = JSON.stringify({ 
        title: "Push Test", 
        body: 'Test'
    });

    res.status(201).json({});

    Object.values(subscriptions).forEach(subscription=>{
        webpush
            .sendNotification(subscription, payload)
            .catch((err) => console.error(err));
    });
    
});

app.listen(process.env.PORT || 8001);