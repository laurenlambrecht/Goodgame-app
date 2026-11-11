# Shipping GoodGame to the App Store

Path: Expo EAS Build (cloud build + signing) → EAS Submit → TestFlight → App Store review.
No Xcode project needed; `ios/` is generated at build time.

## What's already set up in this repo

- `app.json`: bundle id `com.laurenlambrecht.goodgame` (the old `com.goodgame.app` is generic and likely taken), Android package to match, `ios.config.usesNonExemptEncryption: false` (no export-compliance prompt; the app only uses standard HTTPS).
- `eas.json`: `development`, `preview`, `production` profiles. Build numbers are managed remotely by EAS (`appVersionSource: remote`, `autoIncrement` on production). Bump `expo.version` in `app.json` for each new App Store version.
- `assets/`: stand-in GoodGame icon (replaces the default Expo template icon, which Apple rejects as placeholder art). Swap in a designed 1024×1024 PNG, no transparency, before the public release.
- `npm run build:ios` / `npm run submit:ios` shortcuts.

## One-time steps (Lauren)

1. **Apple Developer Program**: enroll at https://developer.apple.com/programs/enroll/ ($99/yr, individual or organization; organizations need a D-U-N-S number and take longer). Approval can take 1–2 days.
2. **Expo account**: sign up at https://expo.dev/signup (free tier is enough to start).
3. **App Store Connect app record**: https://appstoreconnect.apple.com → Apps → + → New App.
   - Platform iOS, name "GoodGame" (if taken, try e.g. "GoodGame: Pickup Sports"), bundle id `com.laurenlambrecht.goodgame`, SKU `goodgame-ios`.
   - Copy the numeric **Apple ID** of the app (App Information page) into `eas.json` → `submit.production.ios.ascAppId`.
4. From `~/Desktop/GoodGame/goodgame-app` on the Mac:
   ```bash
   git pull && npm install
   npx eas-cli@latest login
   npx eas-cli@latest init          # links the project to your Expo account (adds extra.eas.projectId to app.json)
   npm run build:ios                # first run: sign in with Apple ID, let EAS create certificates + provisioning profile
   npm run submit:ios               # uploads the build to App Store Connect / TestFlight
   ```
5. In App Store Connect → TestFlight, add yourself as an internal tester and install via the TestFlight app.

## Listing metadata to prepare

| Field | Notes |
|---|---|
| Subtitle (30 chars) | e.g. "Pickup games near you" |
| Description, keywords, promo text | |
| Screenshots | 6.9" iPhone (1320×2868) required; 6.5" optional. Take from the Simulator (Cmd+S). |
| Support URL | Required. A simple page or Notion/Carrd link is fine. |
| Privacy Policy URL | Required for all apps. |
| Category | Sports (primary), Social Networking (secondary) |
| Age rating questionnaire | Likely 4+ with no user-generated content today; becomes 12+/needs moderation once real chat/profiles exist. |
| App Privacy ("nutrition label") | Today: **Data Not Collected** (no accounts, no analytics, no location permission). Must be updated once a backend, accounts, location or payments are added. |
| Review notes | Explain what the reviewer should tap; provide a demo login once accounts exist. |

## App Review risks in the current build

The app currently runs entirely on mock data (`src/data.ts`) with in-memory state. That is fine for **TestFlight**, but is likely to be **rejected for public App Store release**:

- **Guideline 2.1 / 2.3 (completeness, accurate metadata)**: hard-coded games, a fake score of 92, and a pre-joined game look like a demo, not a working product.
- **The $5 deposit flow**: buttons say "Hold $5 & join" and "$5 refunded" but no money moves. Reviewers treat simulated payments as misleading. When real deposits are added, they're for a real-world service, so Stripe/Apple Pay is allowed (no In-App Purchase needed, guideline 3.1.3(e)/3.1.5), but the flow must actually work and be testable.
- **Guideline 4.2 (minimum functionality)**: nothing persists across launches; you can't create a game or an account.

To clear review, either (a) build a minimal real backend (accounts, real games list, create/join a game) and wire deposits to Stripe, or (b) ship a reduced v1 without the deposit copy and with real, user-created games.

Not a rejection risk: Apple Maps via `react-native-maps` needs no API key, and no location permission is requested today. If "games near me" is added, set `ios.infoPlist.NSLocationWhenInUseUsageDescription`.
