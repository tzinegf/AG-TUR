-- Criar tabela de ônibus
CREATE TABLE IF NOT EXISTS buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate VARCHAR(10) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  seats INTEGER NOT NULL CHECK (seats > 0 AND seats <= 60),
  type VARCHAR(20) NOT NULL CHECK (type IN ('convencional', 'executivo', 'leito')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  amenities TEXT[], -- Array de comodidades
  imageurl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

-- Política para visualização: qualquer usuário autenticado pode ver
CREATE POLICY "Buses are viewable by authenticated users" ON buses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção: apenas admins podem inserir
CREATE POLICY "Buses can be inserted by admins" ON buses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@agtur.com', 'admin@admin.com')
    )
  );

-- Política para atualização: apenas admins podem atualizar
CREATE POLICY "Buses can be updated by admins" ON buses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@agtur.com', 'admin@admin.com')
    )
  );

-- Política para exclusão: apenas admins podem excluir
CREATE POLICY "Buses can be deleted by admins" ON buses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@agtur.com', 'admin@admin.com')
    )
  );

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_buses_plate ON buses(plate);
CREATE INDEX IF NOT EXISTS idx_buses_type ON buses(type);
CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);
CREATE INDEX IF NOT EXISTS idx_buses_created_at ON buses(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_buses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_buses_updated_at
  BEFORE UPDATE ON buses
  FOR EACH ROW
  EXECUTE FUNCTION update_buses_updated_at();

-- Inserir alguns dados de exemplo
INSERT INTO buses (plate, model, brand, year, seats, type, status, amenities) VALUES
('ABC-1234', 'Paradiso G7 1200', 'Marcopolo', 2022, 42, 'executivo', 'active', ARRAY['ar_condicionado', 'wifi', 'tomadas', 'banheiro']),
('DEF-5678', 'Viaggio 1050', 'Marcopolo', 2021, 46, 'convencional', 'active', ARRAY['ar_condicionado', 'banheiro']),
('GHI-9012', 'Paradiso DD', 'Marcopolo', 2023, 28, 'leito', 'active', ARRAY['ar_condicionado', 'wifi', 'tomadas', 'banheiro', 'tv', 'frigobar'])
ON CONFLICT (plate) DO NOTHING;