const Axios = require('axios');
const User = require('./userClass');

Object.defineProperty(String.prototype, "esc", {
    get: function() {
        return this
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
});

async function getUser(token) {
    return new Promise((resolve)=>{
        Axios.get(`${process.env.SITE_URL}/api/user?api_token=${token}`)
        .then(r=>{
            resolve(r.data)
        })
        .catch(e=>{
            resolve(e.data)
        })
    })
}

module.exports = function(io, roomManager) {


    // connexion with token
    io.use(async (socket, next) => {
        // socket.user = new User({
        //     uuid: socket.handshake.query.uuid,
        //     name: socket.handshake.query.name
        // });
        // return next()
        let token = socket.handshake.query.token;
        let userBase = await getUser(token);
        if (userBase) {
            socket.user = new User(userBase);
            return next();
        }
        return next(new Error('authentication error'));
    });

    io.sockets.on("connection", socket => {
        
        // util
        socket.roomEmit = function(...args) {
            console.log(...args);
            io.sockets.to(socket.room.code).emit(...args)
        }

        socket.on('join', function (data) {
            if(!roomManager.roomExist(data.room)) { // create if doesn't exist
                roomManager.create(data.room);
            }

            // join room
            socket.room = roomManager.rooms[data.room]
            socket.join(data.room);

            // add user
            // socket.room.seen.addOnce(socket.user.uuid);
            socket.room.users.addOnceObj(socket.user, ['uuid']);

            // emit changements
            socket.roomEmit('users.update', socket.room.users.getKeys('name'));
            socket.roomEmit('seen.update', socket.room.getSeen);
            
            // log
            // console.log(`${socket.user.name} joined the room ${data.room}`);
        });


        socket.on('leave', function () {
            // remove user
            socket.room.users.nestedRemove('name', socket.user.name)
            socket.room.writings.remove(socket.user.name)
            
            // leave room
            socket.leave(socket.room.code);

            // emit changements
            socket.roomEmit('users.update', socket.room.users.getKeys('name'));

            // log
            console.log(`${socket.user.name} left the room ${socket.room.code}`);
        });


        // socket.on('users.get', function (room) {
        //     socket.emit('users.update', roomManager.getRoom(room).users);
        // });


        socket.on('message.new', function (message) {
            // emit message
            let d = new Date(new Date().toLocaleString("fr-FR", {timeZone: "Europe/Vienna"}));
            // let d = new Date().toLocaleString("fr-FR", {timeZone: "Paris/France"});
            socket.roomEmit('messages.update', {
                type:'message', 
                author: socket.user.name, 
                author_uuid: socket.user.uuid, 
                content: message.content.esc,
                created_at: `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
            });

            // refresh seen
            // socket.room.seen.set(socket.room.users.getKeys('uuid'));
            socket.room.seen.empty();

            // emit new seen list
            // socket.roomEmit('seen.update', socket.room.getSeen);

            Axios.post(`${process.env.SITE_URL}/api/sendmessage?api_token=${socket.user.api_token}`, {
                forum: socket.room.code,
                author: socket.user.name,
                author_uuid: socket.user.uuid,
                content: message.content.esc,
                push_key: process.env.PUSH_KEY
            })
            .then(r=>{
                console.log(r.data);
            })
            .catch(e=>{
                console.log(e);
            })
        });

        socket.on('seen', function () {
            socket.room.seen.addOnce(socket.user.uuid);
            socket.user.recordActivity();
            socket.roomEmit('seen.update', socket.room.getSeen);
        });

        socket.on('writing.start', function () {
            socket.room.writings.add(socket.user.name);
            socket.user.recordActivity();
            socket.roomEmit('writings.update', socket.room.getWritings);
        });


        socket.on('writing.stop', function () {
            socket.room.writings.remove(socket.user.name);
            socket.roomEmit('writings.update', socket.room.getWritings);
        });

    });
}



