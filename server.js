// 北京中心媒体合作情况大屏 - 动态服务（免数据库版）
// 纯 Node.js 内置能力（http/fs），无第三方依赖
// 数据来源：seed.json（服务端文件），更新数据 = 更新文件后重新发布
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8081;
const HOST = process.env.HOST || '0.0.0.0';

const PUBLIC_DIR = path.join(__dirname, 'public');
const SEED_FILE = path.join(__dirname, 'seed.json');

// 启动时一次性加载台账数据到内存
let LEDGER = [];
try {
  LEDGER = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  console.log(`[data] 已加载 ${LEDGER.length} 条台账记录`);
} catch (err) {
  console.error('[data] 数据文件加载失败:', err.message);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/api/ledger') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(LEDGER));
      return;
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: '服务内部错误', detail: err.message }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[start] server listening on ${HOST}:${PORT}`);
  if (!LEDGER.length) {
    console.error('[warn] 台账数据为空，/api/ledger 将返回空数组');
  }
});
