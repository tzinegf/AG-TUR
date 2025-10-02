-- Script para inserir dados de assentos no banco de dados
-- Este script cria rotas de exemplo e seus respectivos assentos

-- Primeiro, vamos inserir algumas rotas de exemplo se não existirem
INSERT INTO routes (id, origin, destination, departure_time, arrival_time, price, available_seats, total_seats, bus_company, bus_type, status)
VALUES 
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'São Paulo',
    'Rio de Janeiro',
    '2024-01-15 08:00:00+00',
    '2024-01-15 14:00:00+00',
    85.50,
    40,
    40,
    'AG TUR',
    'executivo',
    'active'
  ),
  (
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'Rio de Janeiro',
    'Belo Horizonte',
    '2024-01-15 10:00:00+00',
    '2024-01-15 16:30:00+00',
    65.00,
    40,
    40,
    'AG TUR',
    'convencional',
    'active'
  ),
  (
    'c3d4e5f6-g7h8-9012-cdef-345678901234',
    'Belo Horizonte',
    'Brasília',
    '2024-01-15 12:00:00+00',
    '2024-01-15 18:00:00+00',
    75.00,
    40,
    40,
    'AG TUR',
    'executivo',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Agora vamos inserir os assentos para cada rota
-- Rota 1: São Paulo -> Rio de Janeiro
DO $$
DECLARE
  route_id_sp_rj uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  seat_num integer;
  row_num integer;
  seat_pos text;
  positions text[] := ARRAY['A', 'B', 'C', 'D'];
  pos_index integer;
  seat_type_val text;
BEGIN
  -- Limpar assentos existentes para esta rota
  DELETE FROM seats WHERE route_id = route_id_sp_rj;
  
  -- Criar 40 assentos (10 fileiras x 4 assentos por fileira)
  FOR seat_num IN 1..40 LOOP
    row_num := ((seat_num - 1) / 4) + 1;
    pos_index := ((seat_num - 1) % 4) + 1;
    seat_pos := positions[pos_index];
    
    -- Definir tipo do assento (janela ou corredor)
    IF seat_pos IN ('A', 'D') THEN
      seat_type_val := 'window';
    ELSE
      seat_type_val := 'aisle';
    END IF;
    
    -- Assentos premium nas primeiras 2 fileiras
    IF row_num <= 2 THEN
      seat_type_val := 'premium';
    END IF;
    
    INSERT INTO seats (
      route_id,
      seat_number,
      seat_type,
      row_number,
      position,
      is_available,
      price_modifier
    ) VALUES (
      route_id_sp_rj,
      LPAD(seat_num::text, 2, '0'),
      seat_type_val,
      row_num,
      seat_pos,
      true,
      CASE WHEN seat_type_val = 'premium' THEN 15.00 ELSE 0.00 END
    );
  END LOOP;
END $$;

-- Rota 2: Rio de Janeiro -> Belo Horizonte
DO $$
DECLARE
  route_id_rj_bh uuid := 'b2c3d4e5-f6g7-8901-bcde-f23456789012';
  seat_num integer;
  row_num integer;
  seat_pos text;
  positions text[] := ARRAY['A', 'B', 'C', 'D'];
  pos_index integer;
  seat_type_val text;
BEGIN
  -- Limpar assentos existentes para esta rota
  DELETE FROM seats WHERE route_id = route_id_rj_bh;
  
  -- Criar 40 assentos
  FOR seat_num IN 1..40 LOOP
    row_num := ((seat_num - 1) / 4) + 1;
    pos_index := ((seat_num - 1) % 4) + 1;
    seat_pos := positions[pos_index];
    
    -- Definir tipo do assento
    IF seat_pos IN ('A', 'D') THEN
      seat_type_val := 'window';
    ELSE
      seat_type_val := 'aisle';
    END IF;
    
    INSERT INTO seats (
      route_id,
      seat_number,
      seat_type,
      row_number,
      position,
      is_available,
      price_modifier
    ) VALUES (
      route_id_rj_bh,
      LPAD(seat_num::text, 2, '0'),
      seat_type_val,
      row_num,
      seat_pos,
      true,
      0.00
    );
  END LOOP;
END $$;

-- Rota 3: Belo Horizonte -> Brasília
DO $$
DECLARE
  route_id_bh_bsb uuid := 'c3d4e5f6-g7h8-9012-cdef-345678901234';
  seat_num integer;
  row_num integer;
  seat_pos text;
  positions text[] := ARRAY['A', 'B', 'C', 'D'];
  pos_index integer;
  seat_type_val text;
BEGIN
  -- Limpar assentos existentes para esta rota
  DELETE FROM seats WHERE route_id = route_id_bh_bsb;
  
  -- Criar 40 assentos
  FOR seat_num IN 1..40 LOOP
    row_num := ((seat_num - 1) / 4) + 1;
    pos_index := ((seat_num - 1) % 4) + 1;
    seat_pos := positions[pos_index];
    
    -- Definir tipo do assento
    IF seat_pos IN ('A', 'D') THEN
      seat_type_val := 'window';
    ELSE
      seat_type_val := 'aisle';
    END IF;
    
    -- Assentos premium nas primeiras 3 fileiras para esta rota executiva
    IF row_num <= 3 THEN
      seat_type_val := 'premium';
    END IF;
    
    INSERT INTO seats (
      route_id,
      seat_number,
      seat_type,
      row_number,
      position,
      is_available,
      price_modifier
    ) VALUES (
      route_id_bh_bsb,
      LPAD(seat_num::text, 2, '0'),
      seat_type_val,
      row_num,
      seat_pos,
      true,
      CASE WHEN seat_type_val = 'premium' THEN 20.00 ELSE 0.00 END
    );
  END LOOP;
END $$;

-- Criar algumas reservas de exemplo para demonstrar o sistema
-- Primeiro, vamos inserir um usuário de exemplo se não existir
INSERT INTO profiles (id, email, name, phone, role)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  'usuario@exemplo.com',
  'João Silva',
  '(11) 99999-9999',
  'user'
) ON CONFLICT (id) DO NOTHING;

-- Criar uma reserva de exemplo
INSERT INTO bookings (id, user_id, route_id, booking_date, seat_numbers, total_price, payment_status, status)
VALUES (
  '87654321-4321-4321-4321-210987654321',
  '12345678-1234-1234-1234-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  now(),
  ARRAY['01', '02'],
  171.00, -- 2 assentos premium: (85.50 + 15.00) * 2
  'completed',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Associar os assentos à reserva
INSERT INTO booking_seats (booking_id, seat_id, passenger_name, passenger_document)
SELECT 
  '87654321-4321-4321-4321-210987654321',
  s.id,
  CASE 
    WHEN s.seat_number = '01' THEN 'João Silva'
    WHEN s.seat_number = '02' THEN 'Maria Silva'
  END,
  CASE 
    WHEN s.seat_number = '01' THEN '123.456.789-00'
    WHEN s.seat_number = '02' THEN '987.654.321-00'
  END
FROM seats s
WHERE s.route_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
AND s.seat_number IN ('01', '02')
ON CONFLICT (booking_id, seat_id) DO NOTHING;

-- Verificar os dados inseridos
SELECT 
  r.origin,
  r.destination,
  r.departure_time,
  COUNT(s.id) as total_seats,
  COUNT(CASE WHEN s.is_available = false THEN 1 END) as occupied_seats,
  COUNT(CASE WHEN s.is_available = true THEN 1 END) as available_seats
FROM routes r
LEFT JOIN seats s ON r.id = s.route_id
GROUP BY r.id, r.origin, r.destination, r.departure_time
ORDER BY r.departure_time;