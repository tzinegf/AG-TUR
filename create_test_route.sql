-- Script para criar uma rota de teste simples
-- Primeiro, vamos limpar dados antigos se existirem
-- Usar um UUID estático para a rota de teste
--  b1c0a611-1c02-4b86-8f81-60e3f6b8b16d
DELETE FROM booking_seats WHERE seat_id IN (
  SELECT id FROM seats WHERE route_id = 'b1c0a611-1c02-4b86-8f81-60e3f6b8b16d'
);
DELETE FROM seats WHERE route_id = 'b1c0a611-1c02-4b86-8f81-60e3f6b8b16d';
DELETE FROM routes WHERE id = 'b1c0a611-1c02-4b86-8f81-60e3f6b8b16d';

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
  'b1c0a611-1c02-4b86-8f81-60e3f6b8b16d',
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
SELECT * FROM routes WHERE id = 'b1c0a611-1c02-4b86-8f81-60e3f6b8b16d';

-- Verificar se existem assentos para esta rota
SELECT COUNT(*) as seat_count FROM seats WHERE route_id = 'b1c0a611-1c02-4b86-8f81-60e3f6b8b16d';