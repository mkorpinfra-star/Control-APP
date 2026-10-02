// Executa uma Edge Function do Supabase localmente numa porta específica
const port = Number(Deno.env.get('FN_PORT'));
const orig = Deno.serve.bind(Deno);
(Deno as any).serve = (h: any) => orig({ port, hostname: '127.0.0.1', onListen: () => console.log('fn on', port) }, h);
await import(Deno.env.get('FN_FILE')!);
