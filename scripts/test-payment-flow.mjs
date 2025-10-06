// Testa o fluxo Stripe via Edge Functions: customer, payment-methods, setup-intent, payment-intent
// Uso: node scripts/test-payment-flow.mjs

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function parseEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const env = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      env[key] = value;
    }
    return env;
  } catch (err) {
    return {};
  }
}

async function main() {
  const envPath = path.resolve('supabase', 'functions', '.env');
  const env = parseEnvFile(envPath);

  const SUPABASE_URL = env.SUPABASE_URL || 'http://localhost:54321';
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
  if (!SUPABASE_ANON_KEY) {
    console.error('Falta SUPABASE_ANON_KEY em supabase/functions/.env');
    process.exit(1);
  }

  const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || `${SUPABASE_URL}/functions/v1`;
  const STRIPE_FN_BASE = `${API_BASE}/stripe`;

  const TEST_EMAIL = process.env.TEST_EMAIL || 'test.user@example.com';
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Passw0rd!Test123';

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Tenta login, senão cria usuário e loga
  let accessToken;
  {
    const { data, error } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
    if (error) {
      console.log('Login falhou, tentando criar usuário de teste...');
      const { data: signupData, error: signupError } = await supabase.auth.signUp({ email: TEST_EMAIL, password: TEST_PASSWORD });
      if (signupError) {
        console.warn('Falha ao criar usuário:', signupError.message || signupError);
        if (env.ALLOW_DEV_BYPASS === 'true') {
          console.log('ALLOW_DEV_BYPASS habilitado. Prosseguindo sem Authorization...');
        } else {
          process.exit(1);
        }
      }
      // Se não houver sessão após signUp, tenta login novamente
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
      if (loginError) {
        console.warn('Falha ao logar após signUp:', loginError.message || loginError);
        if (env.ALLOW_DEV_BYPASS === 'true') {
          console.log('ALLOW_DEV_BYPASS habilitado. Prosseguindo sem Authorization...');
        } else {
          process.exit(1);
        }
      }
      accessToken = loginData.session?.access_token;
    } else {
      accessToken = data.session?.access_token;
    }
  }

  if (!accessToken) {
    if (env.ALLOW_DEV_BYPASS === 'true') {
      console.log('Prosseguindo sem access_token (DEV bypass ativo).');
    } else {
      console.error('Não foi possível obter access_token de sessão. Verifique se o Supabase está rodando e se confirmações de e-mail estão desativadas em dev.');
      process.exit(1);
    }
  }

  const authHeaders = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : { Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

  // 1) Garante/obtém o Stripe customer
  const custRes = await fetch(`${STRIPE_FN_BASE}/customer`, { method: 'POST', headers: authHeaders });
  const custJson = await custRes.json().catch(() => ({}));
  if (!custRes.ok) {
    console.error('Erro /customer:', custJson);
    process.exit(1);
  }
  console.log('Customer OK:', custJson);

  // 2) Lista payment methods
  const pmRes = await fetch(`${STRIPE_FN_BASE}/payment-methods`, { headers: authHeaders });
  const pmJson = await pmRes.json().catch(() => ({}));
  if (!pmRes.ok) {
    console.error('Erro /payment-methods:', pmJson);
    process.exit(1);
  }
  console.log('Payment Methods:', pmJson);

  // 3) Cria setup intent (para Payment Sheet)
  const siRes = await fetch(`${STRIPE_FN_BASE}/setup-intent`, { method: 'POST', headers: authHeaders });
  const siJson = await siRes.json().catch(() => ({}));
  if (!siRes.ok) {
    console.error('Erro /setup-intent:', siJson);
    process.exit(1);
  }
  console.log('SetupIntent:', siJson);

  // 4) Cria payment intent (valor pequeno em BRL)
  const piBody = { amount: 500, currency: 'brl' };
  const piRes = await fetch(`${STRIPE_FN_BASE}/payment-intent`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(piBody),
  });
  const piJson = await piRes.json().catch(() => ({}));
  if (!piRes.ok) {
    console.error('Erro /payment-intent:', piJson);
    process.exit(1);
  }
  console.log('PaymentIntent:', piJson);

  console.log('\nFluxo Stripe (customer, PMs, SI, PI) testado com sucesso.');
}

main().catch((err) => {
  console.error('Erro ao executar teste de fluxo:', err);
  process.exit(1);
});