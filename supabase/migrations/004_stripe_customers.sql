-- Create mapping table between app users and Stripe customers
CREATE TABLE IF NOT EXISTS stripe_customers (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own mapping
CREATE POLICY "User can view own stripe customer" ON stripe_customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());