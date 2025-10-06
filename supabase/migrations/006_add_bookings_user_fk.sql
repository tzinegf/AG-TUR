-- Add foreign key from bookings.user_id to profiles.id to enable embeds
DO $$
DECLARE
  col_exists boolean;
  col_type text;
BEGIN
  -- Check if user_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id'
  ) INTO col_exists;

  IF NOT col_exists THEN
    ALTER TABLE public.bookings ADD COLUMN user_id uuid;
  END IF;

  -- Ensure column type is uuid
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id';

  IF col_type IS DISTINCT FROM 'uuid' THEN
    ALTER TABLE public.bookings ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
  END IF;

  -- Create index if not exists
  CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

  -- Add foreign key constraint (drop existing if present to avoid duplicates)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'bookings' AND constraint_name = 'bookings_user_id_fkey'
  ) THEN
    ALTER TABLE public.bookings DROP CONSTRAINT bookings_user_id_fkey;
  END IF;

  ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

-- Optional: comment to document relationship for PostgREST
COMMENT ON CONSTRAINT bookings_user_id_fkey ON public.bookings IS 'FK enabling PostgREST embed: user:profiles(*)';