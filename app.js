require('dotenv').config();
const Server = require("./src/js/server");

const server = new Server();

server.setPort(process.env.PORT);
server.setHost(process.env.HOST);

server.roomManager.create('test');

server.listen((host,port) => {
    console.log(`Server is listening on http://${host}:${port}`);
});