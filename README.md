# Selyo — online notarization (frontend demo)

A phone-friendly Next.js app for remote electronic notarization in the Philippines. Everything works in the browser
with mock data. There's no backend yet, so the full flow can be demoed before the database is added.

> "Selyo" is a placeholder brand. Rename it in `src/lib/brand.ts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Demo script (about 5 minutes)

1. **/signup** → "Continue with Google". This opens ID verification (consent and ₱99 fee → ID type → scan → face scan → confirm).
2. **Documents → New document** → "use a sample document" → **Sign now** (draw or type).
3. **Get it notarized** → act → notary → time → **Request appointment**.
4. Open **/notary** (sidebar "Open notary portal", or a second tab) → **Accept** the request.
5. Back as the client → **Join session**. Either:
   - click **Start autopilot**, and the app plays the notary's part, or
   - run the notary in a **second tab** at `/notary/session/<id>`. Both tabs stay in sync.
6. Consent to recording → **Pay** (GCash, Maya or card, all mocked) → the document is sealed → **Download notarized PDF**.
7. Upload that PDF at **/verify**. It matches by its real SHA-256 fingerprint. Edit the file and it fails.

"Reset demo data" is in the sidebar and on the Account page.

## Screens

| Area | Routes |
|---|---|
| Marketing | `/`, `/get-notarized`, `/pricing`, `/notaries`, `/notaries/[id]`, `/verify`, `/faqs`, `/for-notaries` |
| Auth & identity check | `/login`, `/signup`, `/onboarding/verify-id` |
| Client app | `/app`, `/app/documents`, `/app/documents/new`, `/app/documents/[id]`, `/app/notarizations`, `/app/notarizations/new`, `/app/notarizations/[id]`, `/app/pay/[id]`, `/app/account` |
| Notary portal | `/notary`, `/notary/appointments`, `/notary/appointments/[id]`, `/notary/register`, `/notary/credits`, `/notary/profile` |
| Video sessions | `/session/[id]` (client), `/notary/session/[id]` (notary) |

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Zustand · pdf-lib + qrcode · lucide-react.
The design tokens (colors, fonts, radius) are in `src/app/globals.css`.

## How to add the real backend later

All data goes through **`src/lib/store.ts`**. Screens only call its actions (`addDocument`, `signDocument`,
`requestNotarization`, `acceptAppointment`, `updateSession`, `requestPayment`, `payNotarization`,
`sealNotarization`, …) and read the types in **`src/lib/types.ts`**. Those types map one-to-one onto tables:
`users`, `notaries`, `documents`, `signers`, `notarizations`, `messages`, `activity`, `register_entries`.

| Demo piece | Replace with |
|---|---|
| `store.ts` + localStorage | API routes / server actions on Postgres (e.g. Supabase or Prisma + Neon), with React Query for data fetching |
| `lib/files.ts` (in-memory PDFs) | Object storage (Supabase Storage / S3) |
| Cross-tab sync (`storage` event) | Realtime updates (Supabase Realtime, Pusher, or the video SDK's data channel) |
| `auth-form.tsx` OTP / social buttons | Supabase Auth or Auth.js (email OTP, Google, Apple; eGovPH SSO when available) |
| `verify-id-wizard.tsx` capture simulation | A KYC provider with PhilSys QR + face liveness |
| `camera.tsx` + mock remote tile | Daily.co or LiveKit video rooms (recording only after consent) |
| `pay/[id]` mock checkout | PayMongo (GCash, Maya, cards) with webhooks |
| Client-side `pdf.ts` | Same code run on the server, plus a real X.509 digital signature and a stored hash |
| Seed data in `lib/mock/*` | Database seed script |

**Legal note:** going live for real notarizations requires accreditation as an Electronic Notarization Facility
under A.M. No. 24-10-14-SC and onboarding commissioned Electronic Notaries Public.
