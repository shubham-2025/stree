-- Link orders to authenticated customers for cross-device mobile order history.

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_user_created_at_idx
  ON public.orders (user_id, created_at DESC);

DROP POLICY IF EXISTS "orders_insert_guest" ON public.orders;
CREATE POLICY "orders_insert_guest"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
