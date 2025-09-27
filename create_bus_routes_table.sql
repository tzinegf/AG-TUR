-- Criar tabela bus_routes no Supabase
CREATE TABLE IF NOT EXISTS bus_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price decimal(10,2) NOT NULL,
  available_seats integer NOT NULL,
  total_seats integer NOT NULL,
  bus_company text NOT NULL,
  bus_type text NOT NULL,
  amenities text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bus_routes
CREATE POLICY "Anyone can view bus routes" ON bus_routes
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert bus routes" ON bus_routes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update bus routes" ON bus_routes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete bus routes" ON bus_routes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bus_routes_origin_destination ON bus_routes(origin, destination);
CREATE INDEX IF NOT EXISTS idx_bus_routes_departure_time ON bus_routes(departure_time);
CREATE INDEX IF NOT EXISTS idx_bus_routes_status ON bus_routes(status);

-- Inserir dados de exemplo
INSERT INTO bus_routes (origin, destination, departure_time, arrival_time, price, available_seats, total_seats, bus_company, bus_type, amenities) VALUES
('São Paulo', 'Rio de Janeiro', '2024-01-20 08:00:00+00', '2024-01-20 14:00:00+00', 89.90, 42, 45, 'Viação Cometa', 'Executivo', ARRAY['Wi-Fi', 'Ar Condicionado', 'Banheiro']),
('Rio de Janeiro', 'Belo Horizonte', '2024-01-20 10:30:00+00', '2024-01-20 16:30:00+00', 75.50, 38, 40, 'Expresso Brasileiro', 'Convencional', ARRAY['Ar Condicionado', 'Banheiro']),
('Belo Horizonte', 'Brasília', '2024-01-20 15:00:00+00', '2024-01-20 21:00:00+00', 95.00, 35, 42, 'Real Expresso', 'Leito', ARRAY['Wi-Fi', 'Ar Condicionado', 'Banheiro', 'Entretenimento']),
('São Paulo', 'Curitiba', '2024-01-20 07:30:00+00', '2024-01-20 13:30:00+00', 65.00, 40, 45, 'Catarinense', 'Executivo', ARRAY['Wi-Fi', 'Ar Condicionado']),
('Curitiba', 'Florianópolis', '2024-01-20 14:00:00+00', '2024-01-20 18:00:00+00', 55.00, 30, 35, 'Santo Anjo', 'Convencional', ARRAY['Ar Condicionado', 'Banheiro']);