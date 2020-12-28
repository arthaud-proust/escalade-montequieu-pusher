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
                origin: "http://91.160.25.179",
                methods: ["GET", "POST"]
            }
        });
        this.roomManager = new (require('./roomManager'))();

        this.configureApp();
        this.configureRoutes();
        // this.handleSocketConnection();
    }

    configureApp() {
        this.app.use(bodyParser.json());                         // to support JSON-encoded bodies
        this.app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
        this.app.use(express.json());                            // to support JSON-encoded bodies
        this.app.use(express.urlencoded());                      // to support URL-encoded bodies
        
        // const corsOptions = {
        //     origin: '*',
        //     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        // }
        // this.app.use(cors(corsOptions))
        // this.app.options('*', cors());

        //add the router folders
        this.app.use(express.static(__dirname + '/../../public'));             // Store all assets, js and css files in public folder.
        this.app.use(express.static(__dirname + '/../../resources/views'));    // Store all HTML files in view folder.
    }

    configureRoutes() {
        this.app.use('/', router);       // add the router

        require('./routes')(router);
        require('./ioController')(this.io, this.roomManager);
    }

    // handleSocketConnection() {
    //     this.io.on("connection", socket => {
    //         const existingSocket = this.activeSockets.find(
    //             existingSocket => existingSocket === socket.id
    //         );

    //         if (!existingSocket) {
    //             this.activeSockets.push(socket.id);

    //             socket.emit("update-user-list", {
    //                 users: this.activeSockets.filter(
    //                     existingSocket => existingSocket !== socket.id
    //                 )
    //             });

    //             socket.broadcast.emit("update-user-list", {
    //                 users: [socket.id]
    //             });
    //         }

    //         socket.on("call-user", (data) => {
    //             socket.to(data.to).emit("call-made", {
    //                 offer: data.offer,
    //                 socket: socket.id
    //             });
    //         });

    //         socket.on("make-answer", data => {
    //             socket.to(data.to).emit("answer-made", {
    //                 socket: socket.id,
    //                 answer: data.answer
    //             });
    //         });

    //         socket.on("reject-call", data => {
    //             socket.to(data.from).emit("call-rejected", {
    //                 socket: socket.id
    //             });
    //         });

    //         socket.on("disconnect", () => {
    //             this.activeSockets = this.activeSockets.filter(
    //                 existingSocket => existingSocket !== socket.id
    //             );
    //             socket.broadcast.emit("remove-user", {
    //                 socketId: socket.id
    //             });
    //         });
    //     });
    // }

    listen(callback) {
        this.httpServer.listen(this.port, this.host, () => {
            callback(this.host, this.port);
        });
    }
}
