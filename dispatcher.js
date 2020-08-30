
// abstract Dispatcher
module.exports = class Dispatcher {
    constructor() {
        if (this.constructor === Dispatcher) {
            throw new TypeError('Abstract class "Dispatcher" cannot be instantiated directly');
        }
        this.clients = [];
    }

    post(req, res) {
        this.functionPost(req, res);
        
        this.clients.forEach( client=>this.callback(client) );
        this.clients = [];
        res.status(200).send("done");
    }

    fetch(req, res) {
        if(this.condition(req, res)) {
            this.functionFetch(req, res);
        } else {
            this.clients.push({req, res})
        }
    }
}