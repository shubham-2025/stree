# स्त्री (Stree) — Backend (Supabase Setup)

This folder contains the database schema, RLS policies, and setup instructions for the Supabase backend.

---

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose an organization, give it a name (e.g., `stree`), set a database password, and select a region.
4. Wait for the project to be provisioned.

### 2. Get Your API Keys

1. Go to **Project Settings → API**.
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Paste these into `/frontend/.env.local`.

### 3. Run the Database Schema

1. Go to **SQL Editor** in the Supabase Dashboard.
2. Click **New Query**.
3. Copy-paste the entire contents of `supabase/schema.sql`.
4. Click **Run**.
5. Verify tables `products`, `orders`, `profiles` are created in the **Table Editor**.

### 4. Create the Storage Bucket

1. Go to **Storage** in the Supabase Dashboard.
2. Click **New Bucket**.
3. Name: `product-images`
4. Toggle **Public bucket** to ON (so images are publicly readable).
5. Click **Create Bucket**.

### 5. Set Storage Policies

Go to **Storage → product-images → Policies** and add these policies:

#### a) Public Read (SELECT)

- **Policy name**: `Public can read product images`
- **Allowed operation**: SELECT
- **Target roles**: (leave default / anon, authenticated)
- **Policy definition**: `true`

#### b) Admin Upload (INSERT)

- **Policy name**: `Admin can upload images`
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
  ```sql
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
  )
  ```

#### c) Admin Update (UPDATE)

- **Policy name**: `Admin can update images`
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **Policy definition**: Same as INSERT above.

#### d) Admin Delete (DELETE)

- **Policy name**: `Admin can delete images`
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **Policy definition**: Same as INSERT above.

### 6. Create Your Admin User

1. Go to **Authentication → Users**.
2. Click **Add User → Create new user**.
3. Enter your email and password.
4. After the user is created, note the user's UUID.
5. Go to **Table Editor → profiles**.
6. Find the row with that UUID.
7. Set `is_admin` to `true`.
8. Save.

Now you can log into the admin panel at `/admin/login` with that email/password.

---

## Database Schema Overview

| Table      | Purpose                                       |
| ---------- | --------------------------------------------- |
| `products` | Product catalog (sarees)                      |
| `orders`   | Customer orders (COD checkout)                |
| `profiles` | User profiles with admin flag                 |

## RLS Summary

| Table      | Public                         | Admin                     |
| ---------- | ------------------------------ | ------------------------- |
| `products` | SELECT (active only)           | ALL (CRUD)                |
| `orders`   | INSERT only                    | SELECT, UPDATE            |
| `profiles` | SELECT own row                 | SELECT all                |

---

## Files

- `supabase/schema.sql` — Complete SQL schema with tables, triggers, RLS policies, and indexes.

