-- ================================================
-- स्त्री (Stree) — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ================================================

-- =====================
-- 1. PRODUCTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  price       integer NOT NULL,             -- in INR (whole rupees)
  mrp         integer,                       -- optional MRP for discount display
  category    text NOT NULL,
  fabric      text,
  colors      text[] DEFAULT '{}',
  images      text[] DEFAULT '{}',           -- array of public storage URLs
  stock_qty   integer DEFAULT 0,
  description text,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================
-- 2. ORDERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name  text NOT NULL,
  phone          text NOT NULL,
  address_line1  text NOT NULL,
  address_line2  text,
  city           text NOT NULL,
  state          text NOT NULL,
  pincode        text NOT NULL,
  landmark       text,
  items          jsonb NOT NULL,              -- [{productId, title, price, qty, color, image}]
  total_amount   integer NOT NULL,            -- total in INR
  status         text NOT NULL DEFAULT 'NEW', -- NEW, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  created_at     timestamptz DEFAULT now()
);

-- =====================
-- 3. PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  is_admin    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (NEW.id, NEW.email, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================
-- 4. ADMIN CHECK FUNCTION
-- =====================
-- SECURITY DEFINER bypasses RLS to avoid infinite recursion
-- when profiles policies reference the profiles table itself.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================
-- 5. ROW LEVEL SECURITY
-- =====================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- -------
-- PRODUCTS
-- -------

-- Public: read active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Admin: full access to products
CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -------
-- ORDERS
-- -------

-- Anyone can insert an order (for checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Only admin can view orders
CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  USING (public.is_admin());

-- Only admin can update orders
CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -------
-- PROFILES
-- -------

-- Users can read own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- =====================
-- 6. INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders (created_at DESC);

-- =====================
-- 7. STORAGE POLICIES
-- =====================
-- NOTE: You must FIRST create the storage bucket manually:
--   Supabase Dashboard → Storage → New Bucket
--   Name: product-images
--   Public: ON (toggle enabled)
--
-- After creating the bucket, run these policies:

-- Allow public read access to product images
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated admin users to upload images
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );

-- Allow admin to update/overwrite images
CREATE POLICY "Admin can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );

-- Allow admin to delete images
CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );
