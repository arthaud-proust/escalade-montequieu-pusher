const path = require('path');

module.exports = function(router) {


    // router.get('/test1', function(req, res) {
    //     res.sendFile(path.join(__dirname, '/../views/test1.html'));
    // })

    // router.get('/test2', function(req, res) {
    //     res.sendFile(path.join(__dirname, '/../views/test2.html'));
    // })
    router.get('/', function(req, res) {
        let d = new Date(new Date().toLocaleString("fr-FR", {timeZone: "Europe/Vienna"}));
        console.log(`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
        res.send('ok');
    })

};