const SupArray = require("./supArray");

module.exports = class Room {
    constructor(roomManager, code) {
        this.roomManager = roomManager;
        this.code = code;
        this.users = new SupArray();
        this.writings = new SupArray();
        this.seen = new SupArray();
    }

    get json() {
        return JSON.stringify({
            code: this.code,
            users: this.users
        });
    }

    get getUsers() {
        return this.users.items
    }

    get getWritings() {
        return this.writings.items
    }

    get getSeen() {
        return this.seen.items
    }

    connected(username) {
        return this.users.have(username)
    }

}