-- Script para criar uma rota de teste simples
-- Primeiro, vamos limpar dados antigos se existirem
DELETE FROM booking_seats WHERE seat_id IN (
  SELECT id FROM seats WHERE route_id = 'test-route-123'
);
DELETE FROM seats WHERE route_id = 'test-route-123';
DELETE FROM routes WHERE id = 'test-route-123';

-- Inserir uma rota de teste
INSERT INTO routes (
  id,
  origin,
  destination,
  departure_time,
  arrival_time,
  price,
  available_seats,
  total_seats,
  bus_company,
  bus_type,
  amenities,
  status
) VALUES (
  'test-route-123',
  'São Paulo',
  'Rio de Janeiro',
  '2024-01-20 08:00:00+00',
  '2024-01-20 14:00:00+00',
  89.90,
  40,
  40,
  'AG TUR',
  'executivo',
  ARRAY['Wi-Fi', 'Ar Condicionado', 'Banheiro'],
  'active'
);

-- Verificar se a rota foi criada
SELECT * FROM routes WHERE id = 'test-route-123';

-- Verificar se existem assentos para esta rota
SELECT COUNT(*) as seat_count FROM seats WHERE route_id = 'test-route-123';