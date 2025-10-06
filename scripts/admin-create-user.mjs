// Cria usuário no Supabase via service role, com email confirmado
// Uso: node scripts/admin-create-user.mjs [email] [password]

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function parseEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const env = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
    return env;
  } catch {
    return {};
  }
}

async function main() {
  const emailArg = process.argv[2] || 'user@agtur.local';
  const passwordArg = process.argv[3] || 'UserTest2024!';

  const envPath = path.resolve('supabase', 'functions', '.env');
  const env = parseEnvFile(envPath);
  const SUPABASE_URL = env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE_ROLE) {
    console.error('Falta SUPABASE_SERVICE_ROLE_KEY em supabase/functions/.env');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data, error } = await supabase.auth.admin.createUser({
    email: emailArg,
    password: passwordArg,
    email_confirm: true,
    user_metadata: { name: 'Dev User', phone: '' },
  });
  if (error) {
    console.error('Erro ao criar usuário:', error.message || error);
    process.exit(1);
  }
  console.log('Usuário criado:', {
    id: data.user?.id,
    email: data.user?.email,
    email_confirmed_at: data.user?.email_confirmed_at,
  });
}

main().catch((err) => {
  console.error('Falha:', err);
  process.exit(1);
});