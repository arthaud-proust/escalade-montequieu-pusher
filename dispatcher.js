require('dotenv').config()

// abstract Dispatcher
module.exports = class Dispatcher {
    constructor() {
        if (this.constructor === Dispatcher) {
            throw new TypeError('Abstract class "Dispatcher" cannot be instantiated directly');
        }
        this.clients = [];
    }

    post(req, res) {
        if(req.body.key !== process.env.PUSH_KEY) {
            res.status(401).send("invalid key");
        } else {
            this.functionPost(req, res);
        
            this.clients.forEach( client=>this.callback(client) );
            this.clients = [];
            res.status(200).send("done");
        }
    }

    fetch(req, res) {
        if(this.condition(req, res)) {
            this.functionFetch(req, res);
        } else {
            this.clients.push({req, res})
        }
    }
}