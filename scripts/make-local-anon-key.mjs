import crypto from 'node:crypto';

// Read secret from argv or env; default from local PostgREST if known
const secret = process.argv[2] || process.env.JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';
const role = process.argv[3] || 'anon';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const header = { alg: 'HS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const exp = now + 60 * 60 * 24 * 365; // 1 year for local dev
const payload = { iss: 'supabase', ref: 'local', role, iat: now, exp };

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const data = `${encodedHeader}.${encodedPayload}`;
const signature = crypto.createHmac('sha256', secret).update(data).digest();
const encodedSignature = base64url(signature);

const token = `${data}.${encodedSignature}`;
console.log(token);