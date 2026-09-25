# Badminton Tournament App

React Native (Expo) app for running multi-season badminton doubles tournaments.
See the PRD for full context: roles, data model, tournament format.

## What's built (Phase 1 / MVP)

- Tournament CRUD with unique-name validation, multiple tournaments coexisting (2025, 2026, ...)
- Member + team management
- Round-robin schedule generation (circle method — balanced, no back-to-back stacking)
- Round 2 knockout bracket with the "Match 1 winner advances directly to the Final" rule
- Standings that only count matches with an actual recorded score (the bug we found and fixed earlier)
- Live / Upcoming / Past match views, no login required
- Admin auth (email OTP) gating all write actions
- Schedule regeneration that preserves already-completed results when a team is added mid-tournament

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to https://supabase.com, create a free project.
2. In the SQL Editor, paste and run `supabase/schema.sql` (in this repo).
3. In Project Settings -> API, copy your Project URL and anon public key.

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from step 2.

### 4. Run it

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your iPhone (App Store, free) to run it instantly — no build needed for development.

## Getting it onto an iPhone for real (no Mac required)

Expo Go is fine for you/testers during development, but for something installable
like a normal app icon (no Expo Go needed), use **EAS Build** — Expo's free cloud
build service:

```bash
npm install -g eas-cli
eas login          # free Expo account
eas build:configure
eas build --platform ios --profile preview
```

This builds the `.ipa` in the cloud (no Xcode/Mac needed on your end) and gives you
a link to install it via TestFlight or direct install. First-time iOS builds need
an Apple Developer account ($99/year) for the app to be signed and installed on a
real device — `eas build` walks you through this step-by-step.

## Project structure

```
app/                      Expo Router screens (file-based routing)
  index.tsx                Tournament picker (public)
  tournament/[id]/          Public viewer: Matches / Standings / Bracket tabs
  admin/                     Admin-only: auth gate, dashboard, members, teams, schedule, match control
components/                Reusable UI (MatchCard, StandingsTable, BracketView)
lib/                       Core logic: schedule.ts, standings.ts, generateSchedule.ts, hooks.ts, supabase.ts
constants/theme.ts         Design tokens (reuses the Girls=pink / Boys=blue branding from the spreadsheet)
supabase/schema.sql        Full Postgres schema + RLS policies + standings view
```

## Notes / what's intentionally not built yet (see PRD Roadmap)

- Push notifications
- Player-facing login ("my matches")
- Other sports (Cricket, Carom, Chess, Dartboard) — data model supports adding them, UI doesn't yet
- Public web link fallback (viewer-only, no app install) — straightforward to add via Expo's web export if wanted later
