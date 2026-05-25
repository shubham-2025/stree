# Stree Backend Setup

This project uses Supabase for products, orders, auth, admin profiles, and storage.

## Recommended Setup Path

Use the SQL files in the root [`supabase/migrations`](../supabase/migrations) folder as the source of truth.

Run them in this order:

1. `20260329120000_stree_schema.sql`
2. `20260329120001_seed_and_backfill.sql` (optional demo data)
3. `20260428102000_orders_email_and_site_categories.sql`
4. `20260525193000_mobile_user_orders.sql`

## Supabase Project

1. Create a new Supabase project.
2. Copy the project URL and anon key.
3. Put them in `frontend/.env.local` and `mobile/.env`.
4. Copy the service role key into `frontend/.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.

The service role key is required for:

- instant confirmed mobile signup
- server-side mobile profile sync

## Database Objects You Should Have

After running the migrations, verify these tables exist:

- `products`
- `orders`
- `profiles`
- `site_categories`

Important order columns:

- `customer_email`
- `user_id`

## RLS Summary

- `products`
  - Public can read active products
  - Admin can create, update, and delete
- `orders`
  - Guests can insert guest orders
  - Signed-in users can insert orders linked to their own `user_id`
  - Signed-in users can read their own orders
  - Admin can read and update all orders
- `profiles`
  - Users can read their own profile row
  - Admin can read all profiles

## Storage

Create a public bucket named `product-images`.

Required storage behavior:

- Public read access for product images
- Admin-only upload, update, and delete

Those policies are already defined in the schema and migration SQL.

## Admin User

1. Create a user in Supabase Authentication.
2. Open the `profiles` table.
3. Set `is_admin = true` for that user.
4. Sign in at `/admin/login`.

## Notes

- `backend/supabase/schema.sql` is a legacy snapshot kept for reference.
- The root `supabase/migrations` directory is the canonical backend definition.
