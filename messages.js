const Dispatcher = require('./dispatcher');
const Datastore = require('nedb');

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
        this.forums = {};
        this.forum;

        this.db_forums = new Datastore({ filename: './forums.db', autoload: true });
        this.db_forums.find({}, (err, forums)=>{
            forums.forEach(forum=>{
                this.forums[forum.name]=forum.last_message;
                console.log(this.getDate(forum.last_message));
            })
        });
    }

    getDate(date) {
        date = new Date(date)
        return`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    lastMessages(req, res) {
        /*
        forums = {
            forumName1: lastCreated_at(timestamp),
            forumName2: lastCreated_at(timestamp),
            ...
        }
        */
        for (const [forumName, lastCreated_at] of Object.entries(req.body.forums)) {
            // req.body.forums[forumName] = (actual < Math.max.apply(Math, this.messages.filter(msg => msg.forum == forumName).map(msg=>(new Date(msg.created_at)).getTime())))
            req.body.forums[forumName] = lastCreated_at < this.forums[forumName]
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
        this.forums[forum]=created_at;
        this.db_forums.update({ name: forum }, { $set: { last_message:created_at} }, { upsert: true });
        
        // this.messages.push({forum: req.body.forum, author: req.body.author, author_uuid: req.body.author_uuid, content: req.body.content, id: req.body.id, created_at: req.body.created_at});
    }

    functionFetch(req, res) {
        res.send(this.messages.filter(msg => (req.body.last_message_id <= msg.id) && (req.body.forum == msg.forum)));
    }
}