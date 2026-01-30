const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080; // 使用非冲突端口
const directory = __dirname;

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(directory, filePath);

    const extname = path.extname(filePath).substring(1);
    const contentType = getContentType(extname);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

function getContentType(ext) {
    switch (ext) {
        case 'html':
            return 'text/html';
        case 'css':
            return 'text/css';
        case 'js':
            return 'text/javascript';
        case 'json':
            return 'application/json';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        default:
            return 'text/plain';
    }
}

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});