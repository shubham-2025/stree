# Stree Mobile App

Expo Router mobile storefront for Stree Sarees.

## What It Covers

- Browse the live saree catalogue from the Next.js backend API
- View product details, wishlist items, cart, and COD checkout
- Sign in with Supabase Auth
- Sync profile details through the backend
- View account-linked order history across devices

## Prerequisites

- Node.js 20.9+
- Expo Go or an Android/iOS simulator
- A running or deployed `frontend` app, because mobile uses its `/api` routes
- Supabase project keys for mobile auth

## Environment

Create `mobile/.env` from `mobile/.env.example`.

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_public_publishable_key
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:3000/api
```

Notes:

- For local device testing, use your machine's LAN IP, not `localhost`.
- For deployed testing, point `EXPO_PUBLIC_API_URL` to your Vercel domain `/api`.
- The backend only needs `SUPABASE_SERVICE_ROLE_KEY` on the web side if you want instant confirmed signup without email verification.

## Run

```bash
cd mobile
npm install
npm run start
```

Useful commands:

```bash
npm run android
npm run ios
npm run web
npm run typecheck
```

## Backend Contract

The mobile app uses:

- Supabase Auth endpoints for password login, signup, refresh, and logout
- Next.js API routes for app data and account flows:
  - `/api/products`
  - `/api/products/:id`
  - `/api/orders`
  - `/api/mobile-auth/register`
  - `/api/mobile-auth/me`
  - `/api/mobile-auth/profile`
  - `/api/mobile-auth/orders`

That split keeps auth token issuance with Supabase while centralizing product, checkout, profile, and order logic in the web backend.
