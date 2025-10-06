import fs from 'node:fs';
import path from 'node:path';

function parseDotEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    env[key] = value;
  }
  return env;
}

function findJwt(str) {
  const m = str.match(/[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/);
  return m ? m[0] : null;
}

function base64urlDecode(input) {
  const pad = (s) => s + '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = pad(input.replace(/-/g, '+').replace(/_/g, '/'));
  return Buffer.from(b64, 'base64').toString('utf-8');
}

function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token JWT inválido (partes != 3)');
  const header = JSON.parse(base64urlDecode(parts[0]));
  const payload = JSON.parse(base64urlDecode(parts[1]));
  return { header, payload };
}

function checkRole(payload, expectedRole) {
  const role = payload?.role || payload?.['x-supabase-role'] || payload?.['https://supabase.io/roles']?.[0];
  return role === expectedRole;
}

function checkExpiry(payload) {
  const now = Math.floor(Date.now() / 1000);
  const exp = payload?.exp;
  if (!exp) return { ok: false, reason: 'Sem exp' };
  return { ok: exp > now, reason: exp <= now ? 'Expirado' : 'Válido' };
}

function reportKey(name, value, expectedRole) {
  if (!value) {
    console.error(`- ${name}: ausente`);
    return false;
  }
  const token = findJwt(value);
  if (!token) {
    console.error(`- ${name}: valor não parece um JWT. Verifique se colou somente a chave (sem prefixos/sufixos).`);
    return false;
  }
  let payload;
  try {
    ({ payload } = decodeJwt(token));
  } catch (e) {
    console.error(`- ${name}: falha ao decodificar JWT: ${e.message}`);
    return false;
  }
  const roleOk = checkRole(payload, expectedRole);
  const expOk = checkExpiry(payload);
  console.log(`- ${name}: role=${payload.role || 'desconhecido'} (esperado: ${expectedRole}), exp=${payload.exp} (${expOk.reason})`);
  if (!roleOk) {
    console.error(`  \u26a0 role incorreta — a chave não parece ser '${expectedRole}'.`);
  }
  if (!expOk.ok) {
    console.error(`  \u26a0 chave expirada — gere chaves novas com 'supabase start'.`);
  }
  if (roleOk && expOk.ok) {
    console.log('  ✓ formato JWT válido, role e exp ok');
    return true;
  }
  return false;
}

async function main() {
  const envPath = path.join(process.cwd(), 'supabase', 'functions', '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`Arquivo .env não encontrado em ${envPath}`);
    process.exit(1);
  }
  const env = parseDotEnv(envPath);
  console.log('Validando chaves do Supabase a partir do supabase/functions/.env...');
  const okAnon = reportKey('SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY, 'anon');
  const okSr = reportKey('SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY, 'service_role');
  if (okAnon && okSr) {
    console.log('Concluído: ambas as chaves parecem corretas (formato).');
    process.exit(0);
  } else {
    console.error('Concluído: há problemas nas chaves. Corrija e rode novamente.');
    process.exit(2);
  }
}

main();