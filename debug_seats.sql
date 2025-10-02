-- Script para debugar o problema de assentos
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('routes', 'seats', 'booking_seats')
ORDER BY table_name;

-- Verificar quantas rotas existem
SELECT COUNT(*) as total_routes FROM routes;

-- Listar todas as rotas
SELECT id, origin, destination, departure_time, total_seats, status 
FROM routes 
ORDER BY departure_time;

-- Verificar quantos assentos existem
SELECT COUNT(*) as total_seats FROM seats;

-- Verificar assentos por rota
SELECT 
  r.origin,
  r.destination,
  r.id as route_id,
  COUNT(s.id) as seats_count,
  COUNT(CASE WHEN s.is_available = true THEN 1 END) as available_seats,
  COUNT(CASE WHEN s.is_available = false THEN 1 END) as occupied_seats
FROM routes r
LEFT JOIN seats s ON r.id = s.route_id
GROUP BY r.id, r.origin, r.destination
ORDER BY r.departure_time;

-- Se não houver assentos, vamos criar para uma rota específica
-- (substitua o ID pela rota que você está testando)
-- SELECT create_seats_for_route('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 40);

-- Verificar estrutura da tabela seats
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'seats'
ORDER BY ordinal_position;