# MyHealth — MVP Prototype

A patient-owned health record & continuity-of-care app, built from your `MyHealth_App_Proposal.docx`
and `MyHealth_MVP_Prototype_Framework.docx`. React Native (Expo) + Supabase + Claude AI.

> **Status:** functional MVP covering the full primary user journey (sign up → health profile →
> upload a record → emergency profile/QR → share records → access log → family → AI chat).
> This is demo-ready, not production-hardened — see "Before you launch for real" at the bottom.

---

## 1. What's inside

15 screens matching your screen map: Splash, Login, Signup, Onboarding, Home Dashboard, Health
Profile, Records, Add Record, Record Details, Medications, Health Tracking, Emergency Profile/QR,
Share Records, Access Log, Family, Profile/Settings — plus a 16th screen your brief called for:
**MyHealth AI**, a real Claude-powered chat assistant.

```
MyHealth/
├── App.js                     entry point
├── app.config.js              reads .env, feeds Supabase/Claude keys into the app
├── src/
│   ├── screens/                all 16 screens
│   ├── components/              Card, Button, StatusBadge, ScreenHeader
│   ├── navigation/               bottom tabs + root stack
│   ├── context/AuthContext.js    Supabase auth + profile state
│   ├── lib/supabase.js           Supabase client
│   ├── lib/db.js                 typed data-access functions for every table
│   ├── lib/claude.js             Claude API client for the chatbot
│   └── theme/theme.js            colors, spacing, type — your "white base, red accent" direction
└── supabase/schema.sql          full database schema + row-level security, run this once
```

## 2. Run it — in VS Code, on your phone

**You'll need:** Node.js 18+, and the free **Expo Go** app on your phone (App Store / Play Store).

```bash
# 1. Open the MyHealth folder in VS Code, then in its terminal:
npm install

# 2. Set up your environment file
cp .env.example .env
# open .env and fill in the 3 keys — see steps 3 & 4 below

# 3. Start the dev server
npx expo start
```

Scan the QR code that appears with the Expo Go app (Android: in-app scanner; iPhone: Camera app).
The app reloads live as you or I edit files.

## 3. Connect Supabase (2 minutes) — real signup, login, and saved data

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project: **SQL Editor → New query** → paste the entire contents of
   `supabase/schema.sql` → **Run**. This creates every table (profiles, records, medications,
   readings, shares, access_log, family_members), turns on row-level security so users can only
   ever see their own data, and creates a private storage bucket for uploaded documents.
3. Go to **Settings → API** and copy:
   - **Project URL** → paste into `.env` as `SUPABASE_URL`
   - **anon public key** → paste into `.env` as `SUPABASE_ANON_KEY`
4. Restart `npx expo start`.

Until you do this, the app still opens (Login screen shows a small notice), but sign-up/login and
saved data won't work — that's expected.

## 4. Connect Claude for "MyHealth AI" (1 minute)

1. Get a key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
2. Paste it into `.env` as `ANTHROPIC_API_KEY`.
3. Restart the dev server.

**Security note, read before you demo this to anyone but yourself:** this MVP calls the Anthropic
API directly from the phone, with the key bundled into the app, because that's the fastest path to
a working chatbot by Monday. Anyone who inspects the compiled app can extract that key. Before a
real release, move `src/lib/claude.js`'s fetch call into a small backend — a Supabase Edge Function
is the natural fit since you already have Supabase — so the key never leaves your server. I've
written `claude.js` so that's a one-file swap later, not a rebuild.

## 5. What I checked against the competition, and what I changed

You asked me to look at MyHealthNaija, MyMedicalBank, DRO Health, iBam Health, Doctoro, Helium
Health and LifeCare Connect before building. Here's what actually matters from that review:

- **iBam Health and Doctoro** are both building end-to-end telemedicine + e-prescription +
  pharmacy-delivery marketplaces — consultations, lab booking, doctor discovery, delivery
  tracking. That's a real, resource-heavy build, and it's exactly what your own proposal (Section
  8 & the "What We Should NOT Build in V1" list) correctly says to avoid until the patient-record
  layer is validated. I kept the MVP away from that — no doctor marketplace, no pharmacy, no
  appointment booking — on purpose, not by omission.
- Doctoro's strongest idea is consent-based, time-limited QR access with a visible access log —
  your proposal already specified this independently (Sections 4, 5, 13), so I built it as
  specified: the QR never carries medical data, only a pointer, and every grant/view/revoke is
  logged and revocable from the app (Share Records + Access Log screens).
- **None of the reviewed apps lead with real family/caregiver management** as a first-class,
  separately-permissioned feature — it's an add-on at best (iBam's "family plan" is billing-level
  sharing, not separate child/dependant profiles). Your proposal's Family screen is a genuine
  differentiator, so I built it as its own tab, not buried in settings.
- None of them lead with **AI that explains your own records back to you in plain language** —
  they use AI for triage/routing (iBam's "Smart Triage"), not for helping a patient understand a
  lab report they already have. That's the gap "MyHealth AI" fills: it's wired into Record Details
  ("Summarise with MyHealth AI") as well as its own chat tab, always with a visible "not a
  diagnosis" disclaimer, matching your proposal's Section 7 guardrails.
- I did not deep-dive MyHealthNaija, MyMedicalBank, Helium Health, or LifeCare Connect — if any of
  those turn out to be closer competitors on the record-vault-plus-emergency-profile idea
  specifically, that's worth a follow-up look before you finalize your wedge (your proposal's
  Section 9 flags this as an open decision, not something to assume).

## 6. Design direction

Followed your brief's Section 9 exactly rather than defaulting to a generic health-app look: white
base (#FCFCFD/#FFFFFF), a single controlled red accent (#D7263D) used only for primary actions,
emergency, and active states — never decoratively. Rounded 14px cards, generous spacing, status
labels (Current/Shared/Expired/Emergency) as small pill badges, large touch targets throughout for
older users per your accessibility principle.

## 7. What's mocked vs. real

| Feature | Status |
|---|---|
| Sign up / log in | Real (Supabase Auth) |
| Health profile, records, medications, readings, shares, access log, family | Real (Supabase Postgres, row-level security) |
| Document photo/upload | Real (Supabase Storage) |
| Emergency QR | Real QR code; it encodes a URL placeholder (`myhealth.app/emergency/<id>`) — wiring that URL to an actual permission-checked web view is a next step, not built yet |
| MyHealth AI chat | Real (Claude API) — see security note above before wider release |
| Push notifications, biometrics, 2FA | Not built (your proposal correctly scopes these to later) |

## 8. Suggested next steps (from your own proposal, Sections 15 & 20)

1. Test this prototype with 5–10 people this week — where do they hesitate?
2. Stand up the Supabase Edge Function to move the Claude key server-side.
3. Build the actual emergency-profile web view the QR code should resolve to.
4. Revisit the competitor list (Section 5 above) before locking your strategic wedge.
