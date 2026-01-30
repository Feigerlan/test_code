const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  let filePath = req.url;
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const mime = MIME_TYPES[extname] || 'application/octet-stream';
  
  // 确保HTML文件使用正确的MIME类型
  if (extname === '.html') {
    mime = 'text/html';
  }
  
  const fullPath = path.join(process.cwd(), filePath);
  
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`File not found: ${fullPath}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, {'Content-Type': mime});
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});