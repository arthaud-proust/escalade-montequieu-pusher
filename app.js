const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const timeout = require('connect-timeout'); //express v4
const multer = require('multer');
const upload = multer();
const cors = require('cors');
const corsRules ={
    origin: process.env.ALLOW_READ_MESSAGE_FROM || "*",
    methods: "GET,HEAD,POST",
    maxAge: 600
};

const path = require('path')
const Messages = require('./messages.js')
const messages = new Messages();

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
// app.use(cors({
//     methods: "GET,HEAD,POST",
//     maxAge: 600
// })); 
// app.use('/', router);       // add the router
// require('./routes')(router);          

app.use(cors(corsRules));  
app.post('/fetch', (req, res)=>messages.fetch(req, res));
app.post('/post', (req, res)=>messages.post(req, res));
app.get('/test', (req, res)=>res.sendFile(path.join(__dirname+'/views/test.html')));

app.listen(process.env.PORT || 8001);