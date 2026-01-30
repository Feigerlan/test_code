const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// 设置静态文件目录
app.use(express.static('.'));

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 游戏页面路由
app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 测试页面路由
app.get('/test.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Snake game server running on port ${PORT}`);
  console.log(`Access the game at: http://localhost:${PORT}/`);
});