//
// code by http://thecodinghumanist.com/blog/archives/2011/5/6/serving-static-files-from-node-js
// 
// see also http://stackoverflow.com/questions/4720343/loading-basic-html-in-nodejs
//          http://stackoverflow.com/questions/6084360/node-js-as-a-simple-web-server
//
// TODO: use readFileSync?
//

var http = require('http');
var fs = require('fs');
var path = require('path');
 
http.createServer(function (request, response) {
 
    console.log('request starting...');
     
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.htm';
         
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    fs.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
     
}).listen(8125);
 
console.log('Server running at http://127.0.0.1:8125/');