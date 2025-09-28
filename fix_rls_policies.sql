-- Fix RLS policies and table structure
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se a tabela profiles existe e sua estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Se a coluna full_name existir, vamos renomeá-la para name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'full_name' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN full_name TO name;
    RAISE NOTICE 'Coluna full_name renomeada para name';
  ELSE
    RAISE NOTICE 'Coluna full_name não encontrada ou já foi renomeada';
  END IF;
END $$;

-- Corrigir políticas RLS para a tabela routes
-- Primeiro, remover políticas existentes se houver
DROP POLICY IF EXISTS "Anyone can view active routes" ON routes;
DROP POLICY IF EXISTS "Admins can manage routes" ON routes;

-- Criar políticas mais permissivas para desenvolvimento
-- Política para visualização: qualquer pessoa pode ver rotas ativas
CREATE POLICY "Anyone can view active routes" ON routes
  FOR SELECT USING (status = 'active');

-- Política para inserção: permitir inserção para usuários autenticados (temporário para desenvolvimento)
CREATE POLICY "Authenticated users can insert routes" ON routes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para atualização: permitir para usuários autenticados
CREATE POLICY "Authenticated users can update routes" ON routes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política para exclusão: permitir para usuários autenticados
CREATE POLICY "Authenticated users can delete routes" ON routes
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Alternativa: Política mais restritiva para produção (comentada)
/*
-- Política para admins (requer tabela profiles)
CREATE POLICY "Admins can manage routes" ON routes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
*/

-- Verificar se a tabela profiles existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) AS profiles_exists;

-- Se a tabela profiles não existir, criar uma versão simplificada
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para profiles: usuários podem ver e editar seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Inserir um perfil admin padrão (ajuste o email conforme necessário)
INSERT INTO profiles (id, email, name, role)
SELECT 
  auth.uid(),
  'admin@agtur.com',
  'Admin User',
  'admin'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO UPDATE SET role = 'admin';