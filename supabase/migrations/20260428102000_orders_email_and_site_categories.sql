-- Add customer email to orders and a managed site categories table.

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_email TEXT;

CREATE TABLE IF NOT EXISTS public.site_categories (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_categories_select_public" ON public.site_categories;
CREATE POLICY "site_categories_select_public"
  ON public.site_categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "site_categories_insert_admin" ON public.site_categories;
CREATE POLICY "site_categories_insert_admin"
  ON public.site_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "site_categories_delete_admin" ON public.site_categories;
CREATE POLICY "site_categories_delete_admin"
  ON public.site_categories FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

GRANT SELECT ON public.site_categories TO anon, authenticated;
GRANT INSERT, DELETE ON public.site_categories TO authenticated;
