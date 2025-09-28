-- Script para criar usuário admin
-- Execute este script no SQL Editor do Supabase

-- Primeiro, crie o usuário no Supabase Auth Dashboard:
-- 1. Vá para Authentication > Users
-- 2. Clique em "Add user"
-- 3. Email: admin@agtur.com
-- 4. Password: admin123
-- 5. Copie o UUID do usuário criado

-- Depois execute este INSERT substituindo 'USER_UUID_AQUI' pelo UUID copiado:
INSERT INTO profiles (id, email, name, phone, role)
VALUES (
  'USER_UUID_AQUI', -- Substitua pelo UUID do usuário criado
  'admin@agtur.com',
  'Administrador AG TUR',
  '',
  'admin'
);