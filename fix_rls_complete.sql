-- Script para corrigir políticas RLS e permitir acesso às tabelas

-- 1. Verificar políticas RLS atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('seats', 'booking_seats')
ORDER BY tablename, policyname;

-- 2. Desabilitar RLS temporariamente para debug (CUIDADO: apenas para desenvolvimento)
ALTER TABLE public.seats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats DISABLE ROW LEVEL SECURITY;

-- 3. Ou criar políticas permissivas para permitir acesso total (alternativa mais segura)
-- Descomente as linhas abaixo se preferir manter RLS ativo com políticas permissivas

/*
-- Política para tabela seats - permitir SELECT para todos
DROP POLICY IF EXISTS "Allow public read access on seats" ON public.seats;
CREATE POLICY "Allow public read access on seats" ON public.seats
    FOR SELECT USING (true);

-- Política para tabela seats - permitir INSERT para todos
DROP POLICY IF EXISTS "Allow public insert access on seats" ON public.seats;
CREATE POLICY "Allow public insert access on seats" ON public.seats
    FOR INSERT WITH CHECK (true);

-- Política para tabela seats - permitir UPDATE para todos
DROP POLICY IF EXISTS "Allow public update access on seats" ON public.seats;
CREATE POLICY "Allow public update access on seats" ON public.seats
    FOR UPDATE USING (true) WITH CHECK (true);

-- Política para tabela booking_seats - permitir SELECT para todos
DROP POLICY IF EXISTS "Allow public read access on booking_seats" ON public.booking_seats;
CREATE POLICY "Allow public read access on booking_seats" ON public.booking_seats
    FOR SELECT USING (true);

-- Política para tabela booking_seats - permitir INSERT para todos
DROP POLICY IF EXISTS "Allow public insert access on booking_seats" ON public.booking_seats;
CREATE POLICY "Allow public insert access on booking_seats" ON public.booking_seats
    FOR INSERT WITH CHECK (true);

-- Política para tabela booking_seats - permitir UPDATE para todos
DROP POLICY IF EXISTS "Allow public update access on booking_seats" ON public.booking_seats;
CREATE POLICY "Allow public update access on booking_seats" ON public.booking_seats
    FOR UPDATE USING (true) WITH CHECK (true);

-- Política para tabela booking_seats - permitir DELETE para todos
DROP POLICY IF EXISTS "Allow public delete access on booking_seats" ON public.booking_seats;
CREATE POLICY "Allow public delete access on booking_seats" ON public.booking_seats
    FOR DELETE USING (true);
*/

-- 4. Verificar se as políticas foram aplicadas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('routes', 'seats', 'booking_seats', 'bookings')
    AND schemaname = 'public'
ORDER BY tablename;

-- 5. Testar acesso às tabelas
SELECT COUNT(*) as total_seats FROM seats;
SELECT COUNT(*) as total_booking_seats FROM booking_seats;
SELECT COUNT(*) as total_routes FROM routes;

-- 6. Inserir uma rota de teste para verificar se os assentos são criados
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
    '550e8400-e29b-41d4-a716-446655440000',
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
    departure = EXCLUDED.departure,
    arrival = EXCLUDED.arrival,
    price = EXCLUDED.price;

-- 7. Verificar se a rota foi criada
SELECT id, origin, destination, price FROM routes WHERE id = '550e8400-e29b-41d4-a716-446655440000';