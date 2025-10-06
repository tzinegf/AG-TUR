-- Allow admins to update bookings and payments (needed for Admin UI persistence)
DO $$
BEGIN
  -- Ensure RLS is enabled
  ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

  -- Drop existing conflicting policies if any
  DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;

  -- Admins can update any booking
  CREATE POLICY "Admins can update all bookings" ON public.bookings
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );

  -- Admins can update any payment (to reflect refunds, pending, completed)
  CREATE POLICY "Admins can update all payments" ON public.payments
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
END $$;

-- Optional: index to speed up lookups by booking_id on payments
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);