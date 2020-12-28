const Axios = require('axios');

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
        let token = socket.handshake.query.token;
        let user = await getUser(token)
        if (user) {
            socket.user = user;
            return next();
        }
        return next(new Error('authentication error'));
    });

    io.sockets.on("connection", socket => {
        
        // util
        socket.roomEmit = function(...args) {
            // console.log(...args);
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
            socket.room.seen.addOnce(socket.user.uuid);
            socket.room.users.addOnce(socket.user);

            // emit changements
            socket.roomEmit('users.update', socket.room.users.getKeys('name'));
            socket.roomEmit('seen.update', socket.room.getSeen);
            
            // log
            console.log(`${socket.user.name} joined the room ${data.room}`);
            console.log(socket.room.users.getKeys('name'));
        });


        socket.on('leave', function () {
            // remove user
            socket.room.users.nestedRemove('name', socket.user.name)
            socket.room.writings.remove(socket.user.name)
            
            // leave room
            socket.leave(socket.room.code);

            // emit changements
            socket.roomEmit('users.update', socket.room.getUsers);

            // log
            console.log(`${socket.user.name} left the room ${socket.room.code}`);
        });


        // socket.on('users.get', function (room) {
        //     socket.emit('users.update', roomManager.getRoom(room).users);
        // });


        socket.on('message.new', function (message) {
            // emit message
            let d = new Date();
            socket.roomEmit('messages.update', {
                type:'message', 
                author: socket.user.name, 
                author_uuid: socket.user.uuid, 
                content: message.content.esc,
                created_at: `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
            });

            // refresh seen
            socket.room.seen.set(socket.room.users.getKeys('uuid'));

            // emit new seen list
            socket.roomEmit('seen.update', socket.room.getSeen);

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


        socket.on('writing.start', function () {
            socket.room.writings.add(socket.user.name);
            socket.roomEmit('writings.update', socket.room.getWritings);
        });


        socket.on('writing.stop', function () {
            socket.room.writings.remove(socket.user.name);
            socket.roomEmit('writings.update', socket.room.getWritings);
        });

    });
}



