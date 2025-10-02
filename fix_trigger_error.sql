-- Script para corrigir o erro no trigger auto_create_seats_for_new_route
-- O problema é que o trigger está tentando acessar NEW.total_seats, mas a tabela routes usa 'available_seats'

-- 1. Primeiro, vamos verificar a estrutura da tabela routes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'routes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Corrigir a função do trigger para usar o campo correto
CREATE OR REPLACE FUNCTION auto_create_seats_for_new_route()
RETURNS TRIGGER AS $$
BEGIN
  -- Usar available_seats em vez de total_seats
  PERFORM create_seats_for_route(NEW.id, NEW.available_seats);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Verificar se o trigger existe e está ativo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'auto_create_seats_trigger';

-- 4. Testar a correção inserindo uma rota de teste
INSERT INTO routes (
    id,
    origin,
    destination,
    departure,
    arrival,
    price,
    available_seats,
    bus_type,
    bus_company,
    duration
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'São Paulo',
    'Campinas',
    '09:00',
    '11:00',
    25.90,
    40,
    'Convencional',
    'AG-TUR',
    '2h'
) ON CONFLICT (id) DO UPDATE SET
    origin = EXCLUDED.origin,
    destination = EXCLUDED.destination,
    departure = EXCLUDED.departure,
    arrival = EXCLUDED.arrival,
    price = EXCLUDED.price;

-- 5. Verificar se os assentos foram criados automaticamente
SELECT 
    COUNT(*) as total_seats_created,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_seats,
    COUNT(CASE WHEN is_available = false THEN 1 END) as occupied_seats
FROM seats 
WHERE route_id = '550e8400-e29b-41d4-a716-446655440001';

-- 6. Listar alguns assentos criados
SELECT 
    id,
    route_id,
    seat_number,
    seat_type,
    row_number,
    position,
    is_available
FROM seats 
WHERE route_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY row_number, position
LIMIT 10;