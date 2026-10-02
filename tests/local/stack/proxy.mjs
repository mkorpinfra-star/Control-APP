// Gateway mínimo estilo Kong do Supabase: /auth/v1 -> GoTrue, /rest/v1 -> PostgREST,
// /storage/v1 -> stub em memória (upload/public URL), /functions/v1 -> stub.
import http from 'node:http';
const routes = { '/auth/v1': 9999, '/rest/v1': 3000 };
const files = new Map();
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' };
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  for (const [pre, port] of Object.entries(routes)) {
    if (req.url.startsWith(pre)) {
      const p = http.request({ host: '127.0.0.1', port, path: req.url.slice(pre.length) || '/', method: req.method, headers: req.headers }, r => {
        res.writeHead(r.statusCode, { ...r.headers, ...cors }); r.pipe(res);
      });
      p.on('error', e => { res.writeHead(502, cors); res.end(String(e)); });
      return req.pipe(p);
    }
  }
  if (req.url.startsWith('/storage/v1/object')) {
    const chunks = []; req.on('data', c => chunks.push(c)); req.on('end', () => {
      const path = decodeURIComponent(req.url.replace(/^\/storage\/v1\/object\/(public\/)?/, '').split('?')[0]);
      if (req.method === 'GET') { const f = files.get(path); res.writeHead(f ? 200 : 404, cors); return res.end(f || ''); }
      files.set(path, Buffer.concat(chunks));
      res.writeHead(200, { ...cors, 'content-type': 'application/json' });
      res.end(JSON.stringify({ Key: path, Id: path, path: path.split('/').slice(1).join('/') }));
    }); return;
  }
  if (req.url.startsWith('/functions/v1')) { res.writeHead(200, { ...cors, 'content-type': 'application/json' }); return res.end('{"ok":true}'); }
  res.writeHead(404, cors); res.end('not found');
}).listen(54321, '127.0.0.1', () => console.log('gateway on 54321'));
