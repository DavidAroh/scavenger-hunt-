# The Director's Lost Treasure

A 12-QR physical and digital treasure hunt for Renaissance Innovation Labs (RIL), built for the Nerd Work event. Players start at the booth, register once, then follow fixed checkpoint QRs through the approved route. Each scan unlocks the next phone stage; the final QR returns them to the booth to claim comics + merch. Every registration is a lead.

Dev-brutalist UI on the RIL brand system (Open Sans, `#212120` / `#FFFFFF` / `#177AE5`, hard borders, hard shadows, stepped motion, `[ ]` bracket motif).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Framer Motion · Supabase · `qrcode`

---

## Run it locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add Supabase credentials to `.env.local` before opening registration. Without them, the landing page stays up but the hunt is clearly marked **not open**; the app will not silently accept leads into temporary memory. `RIL_DEMO_MODE=true` is an explicit local-only option and must not be used for tester runs. In dev the admin password is `ghostdev` unless `ADMIN_PASSWORD` is configured.

Try it: open `/`, register, then play the hunt. The event-ready answer key is in the staff-only [runbook](EVENT_RUNBOOK.md):

| Stage | Type | What to enter |
|---|---|---|
| The brief | narrative | Begin the hunt |
| Clue 01 | answer | `keyboard` |
| Rival signal | narrative | Keep moving |
| Hidden message | answer | `ril` |
| Map fragment I | narrative | Continue |
| Booth symbol | answer | `7` |
| Combined answer | answer | `keyboard7` |
| The race | timed (90s) | `clock` |
| The reveal | narrative | Continue |
| Map fragment II | narrative | Combine |
| The lock | codelock | naive `1990` is refused → corrected `0991` advances |
| Final lock | answer | `keyboard71` |

## How the game works

- **Twelve fixed QR codes** identify the real checkpoints. QR 09 at the booth starts registration; players then scan QR 01–08, QR 10–11, and QR 12 at the booth to finish. Each scan is checked against the current route stage on the server.
- Registration starts only from QR 09. Same email/phone resumes the existing participant instead of creating a duplicate lead.
- Registration = name + email **or** phone + hunt participation consent. Optional marketing consent is stored separately. Handle, interests, role, age range and program interest are optional and collapsed behind a *Tell us more* toggle.
- The whole trail is **one linear script** in [`lib/stages.ts`](lib/stages.ts). Everyone plays the same order on their own phone.
- Progress is enforced **on the server** ([`lib/hunt.ts`](lib/hunt.ts)): the client only ever receives the stage it has earned, and never the answers. Reloading is idempotent — close the tab and you resume on the exact stage with your collected items intact.
- The route combines venue movement with phone puzzles. Keep all checkpoint signs fixed, approved, visible, and reachable; the QR page confirms each checkpoint before revealing its stage.
- **The twist** (`codelock`): the naive map code is politely rejected with a nudge ("one piece was misread"); only the corrected code advances. Enforced server-side.
- **The race** (`timed`): a server-authoritative countdown. The on-screen timer is cosmetic — the server owns the clock, so reloading can't buy time; running out scrambles the prompt and restarts the window.
- **The reveal**: a rival "signal detected" animation ([`components/play/RevealSequence.tsx`](components/play/RevealSequence.tsx)), disabled under `prefers-reduced-motion`.
- Finish mints a claim code (`RIL-XXXX`). Every finisher gets a completion reward and raffle entry; the first N also qualify for the premium prize. Staff use `/admin` to verify claims and add extra raffle entries for RIL Versus, merch purchases and demos.

### Stage kinds (`lib/stages.ts`)

- `narrative` — a story beat, no input. `grants` can hand the player an item (a map fragment); `effect:"reveal"` plays the rival reveal; `tone:"rival"` tints the beat coral.
- `answer` — a typed answer matched against `accept` (case/space/punctuation-insensitive). `uses` surfaces earlier items; `grants` stores the answer as an item; `inputMode` picks the phone keyboard.
- `timed` — like `answer`, plus `seconds` and `reshuffle` prompts for retries.
- `codelock` — `naive` answers rejected with `deniedHint`, `corrected` answers advance.

## Screens

| Route | What |
|---|---|
| `/` | Story landing + resume banner / progress |
| `/play` | The game: registration gate → the current stage → finish + claim code |
| `/recover` | Resume by email/phone (new phone, cleared browser) |
| `/leaderboard` | Big-screen live board (auto-refresh, handles + time + rank) |
| `/experience` | Community showcase, bootcamp overview, ticket/merch offers and booth activities |
| `/admin` | Stats, prize claim desk, raffle-entry desk, stage funnel and lead table |
| `/admin/qr` | Print-ready sheet for all 12 fixed checkpoint QR codes |
| `/admin/export` | Leads CSV (formula-injection safe) |
| `/admin/raffle-export` | Weighted raffle-ticket CSV for a staff-run random draw |

## Go live

1. **Configure the event.** Review `lib/config.ts`; add approved project details, event dates, bootcamp curriculum, ticket/merch URLs and exact prize inventory. Place the blue `7` on the booth. See [`EVENT_RUNBOOK.md`](EVENT_RUNBOOK.md).
2. **Supabase** (required for real events): create a project and run [`supabase/schema.sql`](supabase/schema.sql). For an existing project, also run [`supabase/migrations/20260924_checkpoint_progress.sql`](supabase/migrations/20260924_checkpoint_progress.sql). RLS is on with no public policies; the app only talks to it server-side with the service-role key.
3. **Env** (`.env.local` / Vercel): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET` (long random), `NEXT_PUBLIC_BASE_URL` (your live domain, no trailing slash).
4. **Deploy** (Vercel works out of the box), open `/admin/qr`, **print the 12-code sheet**, and place each QR at its matching checkpoint.
5. **Dry run** the full route on a couple of phones before doors open. Scan QR 09, then 01–08, 10–11, and 12; also try an out-of-order scan.

## Design system (from the RIL press kit)

- Type: **Open Sans** 300/400/600/700 (brand). JetBrains Mono only for the terminal layer (command lines, codes, counters).
- Colour: ink `#212120`, white `#FFFFFF`, blue `#177AE5`; secondary sky `#2EA3E5`, teal `#29BDCC`, green `#29CC6E` (green = cleared/success). `coral #FF5A5F` is **not** an official brand colour — it's used for errors and, in the narrative layer, for the rival/adversary.
- Motion: stepped easing ([`lib/motion.ts`](lib/motion.ts)), typewriter command lines, hard-shadow button press, the rival reveal. Everything is disabled under `prefers-reduced-motion`.
- Logo rules honoured: horizontal only, white or black only, no boxes/effects/rotation, 16–32px margin.

## Before launch: read this

- **Event details must be confirmed.** The hunt puzzles and booth symbol are configured. Project lineup, bootcamp specifics, ticket and merchandise URLs, prize stock and event discount terms need approval and updating in `lib/config.ts` before launch.
- **Logo is a stand-in.** `components/BrandLogo.tsx` is redrawn from the PDF. Replace it with RIL's official SVG.
- **Consent wording.** Required hunt participation consent and optional marketing opt-in are separate. Have the organization's privacy owner review the wording and retention process before collecting live leads.
- **Supabase needs event-specific verification.** Apply the full schema (including the raffle entries table) and dry-run registration, recovery, progress, leaderboard, prize claims, CSV export and raffle-entry recording against the deployed project.
- **Resume trust model.** `/recover` accepts anyone who knows a participant's email/phone. That's fine for a game, which is why prize claims require staff to check the person's name/ID. Don't skip that step.
- **The answer endpoint is a new abuse surface.** There's a honeypot field, nothing more. Add rate limiting (Vercel WAF / Upstash) on the register + submit actions if you expect bots.
- **Demo store is not for production.** It's per-process memory; on serverless it will lose data.
- The QR sheet encodes `NEXT_PUBLIC_BASE_URL` (falls back to the request host). Print only after that's your live domain. Keep the QRs plain — no logo in the centre, no recolouring (kit logo rules + scan reliability).
