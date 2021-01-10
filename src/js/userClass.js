module.exports = class User {
    constructor(userBase) {

        let entries = Object.entries(userBase)
        for(let i=0; i<entries.length; i++) {
            this[entries[i][0]] = entries[i][1]
        }
        this._user = userBase;
        this.recordActivity()
    }

    get isActive() {
        // boolean
        // if user lastActivity is at least 1 min ago

        // i.e:  now - lastActivity < 60 000 millisecond (or 60 second)
        return Date.now() - this.lastActivity < 60000
    }

    get lastActivity() {
        return this._lastActivity
    }

    recordActivity() {
        this._lastActivity = Date.now();
    }
}