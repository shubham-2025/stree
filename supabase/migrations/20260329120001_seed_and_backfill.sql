-- Optional: demo product + profile backfill (safe to re-run)

-- Profiles for auth users created before main migration
INSERT INTO public.profiles (id, email, is_admin)
SELECT u.id, u.email, false
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- One demo product (skip if slug exists)
INSERT INTO public.products (
  title,
  slug,
  price,
  mrp,
  category,
  fabric,
  colors,
  images,
  stock_qty,
  description,
  is_active
)
VALUES (
  'Sample Handloom Saree',
  'sample-handloom-saree',
  2499.00,
  3299.00,
  'Silk',
  'Pure Silk',
  '["Royal Blue", "Gold"]'::jsonb,
  '[]'::jsonb,
  5,
  'Demo product — replace or delete from Admin.',
  true
)
ON CONFLICT (slug) DO NOTHING;
