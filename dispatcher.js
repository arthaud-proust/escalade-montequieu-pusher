require('dotenv').config()
const Datastore = require('nedb');

// abstract Dispatcher
module.exports = class Dispatcher {
    constructor() {
        if (this.constructor === Dispatcher) {
            throw new TypeError('Abstract class "Dispatcher" cannot be instantiated directly');
        }
        this.clients = [];
        this.db = new Datastore({ filename: './subscriptions.db', autoload: true });
        this.db.persistence.setAutocompactionInterval( 5000 /*ms*/ )
        this.subscriptions = {};
        this.db.find({}, (err, docs)=>{
            docs.forEach(doc=>{
                this.subscriptions[doc.keys.auth]=doc;
            })
        });

    }
    subscribe(req, res) {
        const subscription = req.body;
        this.subscriptions[subscription.keys.auth]=subscription;
        this.db.insert(subscription, function (err, newDoc) {   
            res.status(201).json({});
        });
    }

    post(req, res) {
        if(req.body.key !== process.env.PUSH_KEY) {
            res.status(401).send("invalid key");
        } else {
            this.functionPost(req, res);
        
            const payload = JSON.stringify({
                author: req.body.author, 
                content: req.body.content,
                forum: req.body.forum,
                created_at: req.body.created_at,
                id: req.body.id,
                url: `https://escalade-montesquieu.fr/forum/${req.body.forum}`
            });

            Object.values(this.subscriptions).forEach(subscription=>{
                this.webpush
                    .sendNotification(subscription, payload)
                    .catch((err) => {
                        if(err.body == 'push subscription has unsubscribed or expired.\n') {
                            delete this.subscriptions[subscription.keys.auth];
                            this.db.remove({ 'keys.auth': subscription.keys.auth }, { multi: true });                              
                        }
                    });
            })
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