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

async function checkStripe(secretKey) {
  const headers = { Authorization: `Bearer ${secretKey}` };
  const res = await fetch('https://api.stripe.com/v1/balance', { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe balance failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json;
}

async function main() {
  const envPath = path.join(process.cwd(), 'supabase', 'functions', '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`Arquivo .env não encontrado em ${envPath}`);
    process.exit(1);
  }
  const env = parseDotEnv(envPath);
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret || /your_key_here/i.test(secret)) {
    console.error('STRIPE_SECRET_KEY ausente ou placeholder. Preencha no supabase/functions/.env');
    process.exit(1);
  }
  try {
    const balance = await checkStripe(secret);
    console.log('Conexão OK. Stripe balance:', JSON.stringify(balance));
    process.exit(0);
  } catch (err) {
    console.error('Falha ao conectar ao Stripe:', err?.message || err);
    process.exit(2);
  }
}

main();