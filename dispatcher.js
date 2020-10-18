require('dotenv').config()
const Axios = require('axios');

// abstract Dispatcher
module.exports = class Dispatcher {
    constructor() {
        if (this.constructor === Dispatcher) {
            throw new TypeError('Abstract class "Dispatcher" cannot be instantiated directly');
        }
        this.clients = [];
        this.subscriptions = {};
        Axios({
            method: 'post',
            url: `${process.env.SERVER_HOST}/api/subscription/all`,
            data: {key:process.env.PUSH_KEY}
        })
        .then(r=>{
            r.data.subscriptions.forEach(subscription=>{
                this.subscriptions[subscription.auth]={...subscription, keys:JSON.parse(subscription.keys)}
            })
            console.log(this);

        })
        .catch(e=>console.log(e))

    }

    subscribe(req, res) {
        const subscription = req.body;
        this.subscriptions[subscription.keys.auth]=subscription;
        console.log(subscription);
        Axios({
            method: 'post',
            url: `${process.env.SERVER_HOST}/api/subscription`,
            data: {
                key: process.env.PUSH_KEY,
                auth: subscription.keys.auth,
                endpoint: subscription.endpoint,
                keys: JSON.stringify(subscription.keys)
            }
        })
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
                        console.log(err)
                        if(err.body == 'push subscription has unsubscribed or expired.\n') {
                            delete this.subscriptions[subscription.keys.auth];
                            Axios({
                                method: 'delete',
                                url: `${process.env.SERVER_HOST}/api/subscription`,
                                data: {
                                    key: process.env.PUSH_KEY,
                                    auth: subscription.keys.auth,
                                }
                            })
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