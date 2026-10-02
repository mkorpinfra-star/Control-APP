import crypto from 'node:crypto';
const secret = 'super-secret-jwt-token-with-at-least-32-characters-long';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
export const sign = (role) => { const h = b64({ alg: 'HS256', typ: 'JWT' }); const p = b64({ iss: 'supabase-local', role, iat: 1700000000, exp: 2100000000 });
  return `${h}.${p}.${crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url')}`; };
if (process.argv[2]) console.log(sign(process.argv[2]));
