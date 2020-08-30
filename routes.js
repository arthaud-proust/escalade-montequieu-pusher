const cors = require('cors')
const path = require('path')
const Messages = require('./messages.js')
const messages = new Messages();

const getMessages = {
    origin: process.env.ALLOW_READ_MESSAGE_FROM || "*",
    methods: "GET,HEAD",
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
const postMessage = {
    origin: process.env.ALLOW_POST_MESSAGE_FROM || "escalade-montesquieu.fr",
    methods: "POST",
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

module.exports = function(router) {
    router.get('/', cors(getMessages), (req, res)=>messages.fetch(req, res));
    router.post('/', cors(postMessage), (req, res)=>messages.post(req, res));
    router.get('/test', (req, res)=>res.send("ok"));
};