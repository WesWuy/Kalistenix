import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const allowed = new Set(['index.html', 'app.js', 'training.js', 'styles.css', 'icon.svg']);
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    const path = resolve(root, name);
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep) || !allowed.has(name)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': `${types[extname(path)]}; charset=utf-8`, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Kalistenix is ready at http://localhost:${port}`));
