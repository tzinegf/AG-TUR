-- Script completo de debug para investigar o problema dos assentos

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('routes', 'seats', 'booking_seats', 'bookings');

-- 2. Contar registros em cada tabela
SELECT 'routes' as tabela, COUNT(*) as total FROM routes
UNION ALL
SELECT 'seats' as tabela, COUNT(*) as total FROM seats
UNION ALL
SELECT 'booking_seats' as tabela, COUNT(*) as total FROM booking_seats
UNION ALL
SELECT 'bookings' as tabela, COUNT(*) as total FROM bookings;

-- 3. Listar todas as rotas existentes
SELECT 
    id,
    origin,
    destination,
    departure,
    arrival,
    price,
    created_at
FROM routes
ORDER BY created_at DESC;

-- 4. Verificar assentos por rota
SELECT 
    r.id as route_id,
    r.origin,
    r.destination,
    COUNT(s.id) as total_seats,
    COUNT(CASE WHEN s.is_available = true THEN 1 END) as available_seats,
    COUNT(CASE WHEN s.is_available = false THEN 1 END) as occupied_seats
FROM routes r
LEFT JOIN seats s ON r.id = s.route_id
GROUP BY r.id, r.origin, r.destination
ORDER BY r.created_at DESC;

-- 5. Verificar estrutura da tabela seats
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seats' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar se há algum problema com os dados dos assentos
SELECT 
    route_id,
    row_number,
    position,
    seat_type,
    is_available,
    price_modifier,
    created_at
FROM seats
ORDER BY route_id, row_number, position
LIMIT 20;

-- 7. Verificar se há políticas RLS que podem estar bloqueando
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('routes', 'seats', 'booking_seats')
    AND schemaname = 'public';

-- 8. Testar inserção de uma rota simples (descomente se necessário)
/*
INSERT INTO routes (
    id,
    origin,
    destination,
    departure_time,
    arrival_time,
    price,
    available_seats,
    bus_type,
    company,
    duration
) VALUES (
    'debug-route-001',
    'São Paulo',
    'Rio de Janeiro',
    '08:00',
    '14:00',
    89.90,
    40,
    'Executivo',
    'AG-TUR',
    '6h'
) ON CONFLICT (id) DO UPDATE SET
    origin = EXCLUDED.origin,
    destination = EXCLUDED.destination,
    departure_time = EXCLUDED.departure_time,
    arrival_time = EXCLUDED.arrival_time,
    price = EXCLUDED.price;
*/