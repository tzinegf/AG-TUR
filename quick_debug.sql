-- Script rápido para verificar o estado atual do banco

-- 1. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('seats', 'booking_seats')
    AND schemaname = 'public';

-- 2. Tentar acessar dados das tabelas
SELECT 'seats' as tabela, COUNT(*) as total FROM seats;
SELECT 'booking_seats' as tabela, COUNT(*) as total FROM booking_seats;
SELECT 'routes' as tabela, COUNT(*) as total FROM routes;

-- 3. Verificar se existem rotas
SELECT id, origin, destination FROM routes LIMIT 3;

-- 4. Verificar se existem assentos para alguma rota
SELECT 
    route_id,
    COUNT(*) as total_seats,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available
FROM seats 
GROUP BY route_id 
LIMIT 3;

-- 5. Se não houver assentos, criar para uma rota existente
-- (descomente a linha abaixo se necessário)
-- SELECT create_seats_for_route((SELECT id FROM routes LIMIT 1), 40);