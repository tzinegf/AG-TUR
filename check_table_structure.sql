-- Verificar se a tabela routes existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'routes'
ORDER BY ordinal_position;

-- Verificar todas as tabelas no schema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Se a tabela routes não existir, vamos criá-la
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  departure timestamp with time zone NOT NULL,
  arrival_time timestamp with time zone NOT NULL,
  price decimal(10,2) NOT NULL,
  available_seats integer NOT NULL DEFAULT 40,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  -- Novos campos adicionados
  duration integer NOT NULL DEFAULT 0,
  amenities text[] DEFAULT '{}',
  bus_type text NOT NULL DEFAULT 'convencional' CHECK (bus_type IN ('convencional', 'executivo', 'leito', 'semi-leito')),
  total_seats integer NOT NULL DEFAULT 40,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Anyone can view active routes" ON routes
  FOR SELECT USING (status = 'active');

-- Política temporária para desenvolvimento: usuários autenticados podem gerenciar rotas
CREATE POLICY "Authenticated users can manage routes" ON routes
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_routes_origin_destination ON routes(origin, destination);
CREATE INDEX IF NOT EXISTS idx_routes_departure ON routes(departure);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);

-- Inserir dados de exemplo
INSERT INTO routes (origin, destination, departure, arrival_time, price, available_seats, total_seats, duration, amenities, bus_type) VALUES
  ('São Paulo', 'Rio de Janeiro', '2024-01-15 08:00:00+00', '2024-01-15 14:00:00+00', 89.90, 35, 40, 360, '{"ar-condicionado", "wifi", "tomada", "banheiro"}', 'executivo'),
  ('Rio de Janeiro', 'Belo Horizonte', '2024-01-15 10:30:00+00', '2024-01-15 16:30:00+00', 75.50, 28, 40, 360, '{"ar-condicionado", "banheiro"}', 'convencional'),
  ('Belo Horizonte', 'Brasília', '2024-01-15 14:00:00+00', '2024-01-15 20:00:00+00', 95.00, 20, 32, 360, '{"ar-condicionado", "wifi", "tomada", "banheiro", "tv"}', 'leito');