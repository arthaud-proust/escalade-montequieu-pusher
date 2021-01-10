const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const path = require("path");
const router = express.Router()
const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = class Server {

  
    constructor() {
        this.activeSockets = []
        this.DEFAULT_PORT = 8000;
        this.DEFAULT_HOST = 'localhost';
        this.initialize();
    }

    get port() {
        return this.PORT||this.DEFAULT_PORT
    }

    get host() {
        return this.HOST||this.DEFAULT_HOST
    }

    setPort(port=this.DEFAULT_PORT) {
        this.PORT = port;
    }

    setHost(host=this.DEFAULT_HOST) {
        this.HOST = host;
    }

    initialize() {
        this.app = express();
        this.httpServer = http.createServer(this.app);

        this.io = socketIO(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.roomManager = new (require('./roomManager'))();

        this.configureApp();
        this.configureRoutes();
    }

    configureApp() {
        this.app.use(bodyParser.json());                         // to support JSON-encoded bodies
        this.app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
        this.app.use(express.json());                            // to support JSON-encoded bodies
        this.app.use(express.urlencoded());                      // to support URL-encoded bodies

        //add the router folders
        this.app.use(express.static(__dirname + '/../../public'));             // Store all assets, js and css files in public folder.
        this.app.use(express.static(__dirname + '/../../resources/views'));    // Store all HTML files in view folder.
    }

    configureRoutes() {
        this.app.use('/', router);       // add the router

        require('./routes')(router);
        require('./ioController')(this.io, this.roomManager);
    }

    listen(callback) {
        this.httpServer.listen(this.port, this.host, () => {
            callback(this.host, this.port);
        });
    }
}
