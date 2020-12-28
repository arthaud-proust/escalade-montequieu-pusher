const Room = require('./room');

module.exports = class RoomManager {
    constructor() {
        this.codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        this.rooms = {};
        this.members = [];
    }

    validCode(code) {
        return /[ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{5}/g.test(code)
    }

    roomExist(code) {
        return Object.keys(this.rooms).includes(code)
    }

    create(code=null) {
        if(code==null || this.roomExist(code)) {
            code = Array(5).fill('-').map(()=>{
                return this.codeChars[Math.floor(Math.random()*this.codeChars.length)];
            }).join('');

            return this.create(code);
        }
        console.log(`roomManager.js: new room: ${code}`);
        this.rooms[code] = new Room(this, code, ['adminsHere']);

        return this.rooms[code];
    }

    delete(code) {
        try {
            delete this.rooms[code];
        } catch(e){}
        console.log(`roomManager.js: end room: ${code}`);
        return
    }

    getRoom(code) {
        if(code==null || !this.validCode(code) || !this.roomExist(code)) {
            return new Room(this, null, []);
        } else {
            return this.rooms[code]
        }
    }
}