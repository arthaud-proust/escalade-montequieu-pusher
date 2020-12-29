const path = require('path');

module.exports = function(router) {


    // router.get('/test1', function(req, res) {
    //     res.sendFile(path.join(__dirname, '/../views/test1.html'));
    // })

    // router.get('/test2', function(req, res) {
    //     res.sendFile(path.join(__dirname, '/../views/test2.html'));
    // })
    router.get('/', function(req, res) {
        res.send('La sincérité est un phénomène de mauvaise foi - Sartre');
    })

};