const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const timeout = require('connect-timeout'); //express v4
const multer = require('multer');
const upload = multer();

// support request
app.use(bodyParser.json());                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(express.json());                            // to support JSON-encoded bodies
app.use(express.urlencoded());                      // to support URL-encoded bodies
app.use(upload.array()); 

//add the router folders
app.use(express.static(__dirname + '/public'));     // Store all assets files in public folder.
// app.use(express.static(__dirname + '/views'));      // Store all HTML files in view folder.
app.use(express.static(__dirname + '/scripts'));    // Store all JS and CSS in Scripts folder.

app.use('/', router);       // add the router
app.use(timeout('1h'));     // set timeout to 1hour

//routes
require('./routes')(router);          
console.log("env:");
console.log(process.env);
console.log("env.port="+process.env.port);
app.listen(process.env.port || 8001);