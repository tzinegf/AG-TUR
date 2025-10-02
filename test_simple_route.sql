-- Script simples para testar criação de rota e assentos

-- 1. Limpar dados de teste anteriores
DELETE FROM booking_seats WHERE seat_id IN (
    SELECT id FROM seats WHERE route_id = 'test-simple-route'
);
DELETE FROM seats WHERE route_id = 'test-simple-route';
DELETE FROM routes WHERE id = 'test-simple-route';

-- 2. Inserir uma rota simples
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
    'test-simple-route',
    'São Paulo',
    'Rio de Janeiro',
    '08:00',
    '14:00',
    89.90,
    40,
    'Executivo',
    'AG-TUR',
    '6h'
);

-- 3. Verificar se a rota foi criada
SELECT 
    id,
    origin,
    destination,
    departure_time,
    arrival_time,
    price,
    available_seats
FROM routes 
WHERE id = 'test-simple-route';

-- 4. Verificar se existem assentos para esta rota
SELECT 
    COUNT(*) as total_seats,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_seats,
    COUNT(CASE WHEN is_available = false THEN 1 END) as occupied_seats
FROM seats 
WHERE route_id = 'test-simple-route';

-- 5. Se não há assentos, criar manualmente para testar
-- (Descomente as linhas abaixo se necessário)
/*
INSERT INTO seats (route_id, row_number, position, seat_type, is_available, price_modifier)
SELECT 
    'test-simple-route',
    row_num,
    pos,
    CASE 
        WHEN pos IN ('A', 'D') THEN 'window'
        ELSE 'aisle'
    END,
    true,
    1.0
FROM (
    SELECT 
        generate_series(1, 12) as row_num,
        unnest(ARRAY['A', 'B', 'C', 'D']) as pos
) seats_data;
*/

-- 6. Verificar estrutura da tabela seats
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'seats' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Listar alguns assentos criados (se existirem)
SELECT 
    id,
    route_id,
    row_number,
    position,
    seat_type,
    is_available,
    price_modifier
FROM seats 
WHERE route_id = 'test-simple-route'
ORDER BY row_number, position
LIMIT 10;