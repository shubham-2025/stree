# स्त्री (Stree) — Frontend

A premium e-commerce website for selling sarees, built with **Next.js 16 (App Router)**, **Tailwind CSS 4**, and **Supabase**.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- A **Supabase** project (free tier works). See `/backend/README.md` for setup.

---

## Getting Started

### 1. Clone and install dependencies

```bash
cd frontend
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard → Project Settings → API**.

### 3. Set up Supabase

Follow the instructions in `/backend/README.md` to:
1. Run `schema.sql` in the Supabase SQL Editor
2. Create the `product-images` storage bucket (public)
3. Set storage policies
4. Create your admin user

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout (html, body, font)
│   ├── globals.css             # Tailwind + custom theme
│   ├── (shop)/                 # Route group: public pages
│   │   ├── layout.tsx          # Header + Footer + CartProvider
│   │   ├── page.tsx            # Home page
│   │   ├── shop/               # /shop — product listing
│   │   ├── product/[slug]/     # /product/:slug — product detail
│   │   ├── cart/               # /cart
│   │   ├── checkout/           # /checkout (COD)
│   │   └── order-success/      # /order-success/:orderId
│   ├── admin/
│   │   ├── layout.tsx          # Minimal admin wrapper
│   │   ├── login/              # /admin/login
│   │   └── (dashboard)/        # Route group: admin dashboard
│   │       ├── layout.tsx      # AdminNav layout
│   │       ├── products/       # CRUD products
│   │       └── orders/         # Manage orders
│   └── actions/                # Server Actions
│       ├── orders.ts           # Create order
│       ├── products.ts         # Product CRUD
│       └── admin.ts            # Update order status
├── components/
│   ├── Header.tsx              # Public site header
│   ├── Footer.tsx              # Public site footer
│   ├── CartProvider.tsx        # Cart context (localStorage)
│   ├── ProductCard.tsx         # Product card component
│   ├── FilterSidebar.tsx       # Shop filters
│   ├── ImageGallery.tsx        # Product image gallery
│   ├── AdminNav.tsx            # Admin navigation
│   └── ProductForm.tsx         # Product create/edit form
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── client.ts           # Browser Supabase client
│   ├── types.ts                # TypeScript interfaces
│   ├── constants.ts            # Categories, fabrics, colors
│   └── utils.ts                # Helpers (formatPrice, slugify)
├── middleware.ts                # Auth middleware for /admin
└── public/
    └── placeholder.svg         # Fallback product image
```

---

## Key Features

### Public
- **Home** — Hero, category tiles, new arrivals
- **Shop** — Search, filter (category, fabric, color, price), sort, pagination
- **Product Detail** — Image gallery, color selection, add to cart
- **Cart** — Add/remove items, update quantities (localStorage)
- **Checkout** — COD only, delivery address form
- **Order Success** — Confirmation with order ID

### Admin (`/admin`)
- **Login** — Supabase Auth (email/password)
- **Products** — Create, edit, delete, image upload to Supabase Storage
- **Orders** — View all orders, update status (NEW → CONFIRMED → SHIPPED → DELIVERED / CANCELLED)

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/stree.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**.
3. Import your GitHub repo.
4. Set **Root Directory** to `frontend`.
5. Set **Framework Preset** to `Next.js`.
6. Add **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **Deploy**.

### 3. Update Supabase Auth Settings

After deployment, add your Vercel domain to Supabase:
1. Go to **Supabase Dashboard → Authentication → URL Configuration**.
2. Add your Vercel URL (e.g., `https://stree.vercel.app`) to **Site URL**.
3. Add it to **Redirect URLs** as well.

---

## Tech Stack

| Technology          | Purpose                              |
| ------------------- | ------------------------------------ |
| Next.js 16          | React framework (App Router, SSR)    |
| Tailwind CSS 4      | Styling                              |
| Supabase            | Database, Auth, Storage              |
| TypeScript          | Type safety                          |
| Vercel              | Hosting (free tier)                  |

---

## Notes

- **No payment gateway** — only Cash on Delivery.
- **No service role key** in frontend — all access via anon key + RLS policies.
- **Dynamic rendering** — shop and product pages use `force-dynamic` to always show latest data.
- **Cart** is stored in browser localStorage (no server-side cart).
