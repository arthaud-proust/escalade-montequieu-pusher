const Dispatcher = require('./dispatcher');

module.exports = class Messages extends Dispatcher {
    /*
        Requête POST Message:
        - forum
        - id
        - author
        - author_uuid
        - content
        - created_at

        Requête GET messages:
        - last_message_id
        
    */

    constructor(webpush) {
        super();  // super() renvoie à l'abstract
        this.webpush = webpush;
        this.messages = [];
        this.forums = [];
        this.forum;
    }

    lastMessagesId(req, res) {
        /*
        forums = {
            forumName1: lastId(Number),
            forumName2: lastId(Number),
            ...
        }
        */
        for (const [forumName, lastId] of Object.entries(req.body.forums)) {
            req.body.forums[forumName] = (lastId < Math.max.apply(Math, this.messages.filter(msg => msg.forum == forumName).map(msg=>msg.id)))
        }
        res.send(req.body.forums);
    }

    condition(req, res) {
        let messages = this.messages.filter(msg => msg.forum == req.body.forum)
        if (messages.length == 0) return false
        return (req.body.last_message_id < messages[messages.length-1].id)
    }

    callback(client) {
        client.res.send(this.messages.filter(msg => (client.req.body.last_message_id < msg.id) && (client.req.body.forum == msg.forum)));
    }

    functionPost(req, res) {
        const {forum, id, author, author_uuid, content, created_at} = req.body;
        this.messages.push({forum, id, author, author_uuid, content, created_at});
        // this.messages.push({forum: req.body.forum, author: req.body.author, author_uuid: req.body.author_uuid, content: req.body.content, id: req.body.id, created_at: req.body.created_at});
    }

    functionFetch(req, res) {
        res.send(this.messages.filter(msg => (req.body.last_message_id <= msg.id) && (req.body.forum == msg.forum)));
    }
}