/*
** Laod virtual hosts configuration
*/
var vhost = require('../config/vhost.json');
global.$ = require('framework');
/*
** method of HTTP Server 
*/
httpServer = function(server) {
    var http = require('http');
   
    http.createServer(function (req, res) {
        /** 3 **/
        var host = req.headers.host;
        
        if (typeof server.hosts[host] !== 'undefined') {
            var app = require(server.hosts[host].root);
        } else {
            var app = require(server.hosts['default'].root);
        }
       
       app.run(req, res, server.hosts[host]);
        //res.writeHead(200, {'Content-Type': 'text/plain'});
        //res.end('Hello World\n');
    }).listen(server.port);
}
/*
** method of HTTPS Server
*/
httpsServer = function(server) {
    var https = require('https');
    var fs = require("fs");
    
    if(typeof server.https.key !== 'undefined') {
        var options = {
            key: fs.readFileSync(server.https.key),
            cert: fs.readFileSync(server.https.cert) 
        };
    } else {
        var options = {
            pfx: fs.readFileSync(server.https.pfx)
        };
    }
    
    https.createServer(options, function(req, res){
        var host = req.headers.host;
        
        if(typeof server.host[host] !== 'undefined') {
            var app = require(server.hosts[host].root);
        } else {
            var app = require(server.hosts['default'].root);
        }
        
        res.writeHead(200,{'Content-Type' : 'text/plain'});
        res.end("hello world\n");
    }).listen(server.port);
}
for (var i in vhost) {
    var server = vhost[i];
    var method = server.protocol+'Server';
    
    /** 4 **/
   global[method](server);
}