# Android Release Flow

This app is configured for Android production builds with EAS Build and Google Play submissions with EAS Submit.

## What is already configured

- Android package name: `com.streesarees.mobile`
- Production cloud builds create an Android App Bundle (`.aab`)
- Remote app version management is enabled in `eas.json`
- Production build numbers auto-increment on EAS
- Two submit profiles are configured:
  - `internal`: uploads to the Google Play internal track
  - `production`: uploads to the Google Play production track as a draft release

## One-time setup

1. Log in to Expo:

```bash
npm run eas:login
npm run eas:whoami
```

2. Link this mobile project to Expo/EAS if it is not linked yet:

```bash
npm run eas:init
```

3. Create the required production environment variables on EAS.
Important: `mobile/.env` is local-only and is not available to cloud builds.

```bash
npx eas-cli env:create --environment production --name EXPO_PUBLIC_API_URL --value https://stree-sarees-com.vercel.app/api --visibility plaintext
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co --visibility plaintext
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_publishable_key --visibility sensitive
```

Privacy policy URL for Play Console:

`https://stree-sarees-com.vercel.app/privacy-policy`

4. If this app already exists on Google Play with an older `versionCode`, sync the remote Android build version before the first EAS production build:

```bash
npx eas-cli build:version:set
```

5. Configure Android credentials:

```bash
npm run eas:credentials:android
```

This covers:

- the Android signing keystore for builds
- the Google Play service account JSON for Play submissions

## Build commands

Internal QA build:

```bash
npm run eas:build:android:preview
```

Production store build on EAS:

```bash
npm run eas:build:android:production
```

Production store build on this machine:

```bash
npm run eas:build:android:production:local
```

## Submission flow

First-ever Play Store upload:

- Google requires the first Android upload to be done manually at least once.
- Build the `.aab`, then upload it in Google Play Console manually.

Later internal-track upload:

```bash
npm run eas:build-and-submit:android:internal
```

Later production-track upload:

```bash
npm run eas:submit:android:production
```

The `production` submit profile is intentionally set to a draft production release so the build is uploaded to Play Console without instantly releasing it to users.

## Recommended release order

1. Update the app store version in `app.json` if you are starting a new public release cycle.
2. Build a production `.aab`.
3. Smoke test the internal track build.
4. Submit to the Play production track.
5. Finish review and release steps inside Google Play Console.
