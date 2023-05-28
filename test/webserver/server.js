//
// code by http://thecodinghumanist.com/blog/archives/2011/5/6/serving-static-files-from-node-js
//
// see also http://stackoverflow.com/questions/4720343/loading-basic-html-in-nodejs
//          http://stackoverflow.com/questions/6084360/node-js-as-a-simple-web-server
//
// TODO: use readFileSync?
//

import http from 'http';
import fs from 'fs';
import path from 'path';
import open from 'open';

var server = http
    .createServer(function(request, response) {
        console.log('request starting...');

        var filePath = '.' + request.url;
        if (filePath == './') filePath = './index.htm';

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
                    } else {
                        response.writeHead(200, {
                            'Content-Type': contentType
                        });
                        response.end(content, 'utf-8');
                    }
                });
            } else {
                response.writeHead(404);
                response.end();
            }
        });
    })
    .listen(3000, 'localhost', function() {
        var adrObj = server.address(),
            address = [adrObj.address, adrObj.port];

        console.log('Server running at ' + address.join(':'));
        open('http://' + address.join(':'));
    });
