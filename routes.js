const Messages = require('./messages.js')
const path = require('path')
const messages = new Messages();

module.exports = function(router) {

    // middleware that is specific to this router
    router.use(function timeLog(req, res, next) {
        console.log((new Date()).toLocaleTimeString('fr-FR', {minute: '2-digit', hour: '2-digit', second:'2-digit'})+': '+req.path);
        // console.log(req.path);
        next();
    });

    // router.get('/:room', function(req, res) {
    //     res.sendFile(path.join(__dirname+'/views/chat.html'));
    //     // if(messages.rooms.includes(req.params.room)) {
    //     // } else {
    //         // res.redirect('/404');
    //         // res.sendFile(path.join(__dirname+'/views/404.html'));
    //     // }
    // });
    
    
    router.get('/', (req, res)=>messages.fetch(req, res));
    router.post('/', (req, res)=>messages.post(req, res));
    router.get('/test', (req, res)=>res.send("ok"));
};