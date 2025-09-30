-- Script simplificado para criar usuário admin
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Criar usuário no Supabase Auth Dashboard
-- 1. Vá para Authentication > Users no Supabase Dashboard
-- 2. Clique em "Add user"
-- 3. Email: admin@agtur.com
-- 4. Password: admin123
-- 5. Marque "Auto Confirm User" se disponível
-- 6. Clique em "Create user"
-- 7. Copie o UUID do usuário criado (aparece na lista de usuários)

-- PASSO 2: Execute este INSERT substituindo 'COLE_O_UUID_AQUI' pelo UUID copiado
INSERT INTO profiles (id, email, name, phone, role)
VALUES (
  'COLE_O_UUID_AQUI', -- Substitua pelo UUID do usuário criado no passo 1
  'admin@agtur.com',
  'Administrador AG TUR',
  '',
  'admin'
);

-- PASSO 3: Verificar se foi criado corretamente
SELECT id, email, name, role, created_at 
FROM profiles 
WHERE email = 'admin@agtur.com';