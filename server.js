import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml; charset=utf-8', '.jpg': 'image/jpeg' };
const allowed = new Set(['index.html', 'app.js', 'training.js', 'illustrations.js', 'styles.css', 'icon.svg', 'cloud-store.js', 'cloud-api.js', 'supabase-config.js', 'vendor/supabase.js']);
const exerciseImage = /^assets\/exercises\/(female\/)?[a-z-]+-[01]\.jpg$/;
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    const path = resolve(root, name);
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep) || !(allowed.has(name) || exerciseImage.test(name))) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Kalistenix is ready at http://localhost:${port}`));
