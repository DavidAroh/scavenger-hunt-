# Build prompt: RIL Scavenger Hunt (paste into any AI builder)

Build a mobile-first Next.js web app for a QR-code scavenger hunt run by Renaissance Innovation Labs (RIL), Port Harcourt. Purpose: draw a crowd and capture leads. Participants scan QR codes placed around an event centre; the first scan forces registration (email OR phone) before revealing clue 01; each subsequent scan reveals the next clue; finishing at the RIL booth yields a claim code for a prize (comics + RIL merch).

## Flow
1. Any QR opens `/h/[token]`. Tokens are random 12-char strings (unguessable, not sequential).
2. No session cookie -> registration gate (any QR is an entry point). Fields: name, email|phone toggle, optional interest chips (Front-end, Back-end, Mobile, UI/UX, Digital Marketing, Here for the comics), marketing-consent checkbox, hidden honeypot. Same email/phone = resume, never duplicate.
3. Registered -> server validates the scan against the participant's track and returns one of: clue (valid), already (repeat), wrong (out of order / not started), finished (claim code + rank).
4. Tracks A/B/C are different orderings of the same locations; all start at `start`, all end at `booth`. New participants get the least-populated track.
5. Clues are per location (the riddle that leads to it). Order is enforced server-side; the client never gets an unearned clue.
6. Prize: first N (20) finishers win, the rest enter a raffle. Claim code `RIL-XXXX` (alphabet without 0/O/1/I/L). Staff verify the code + person at `/admin`.
7. Extras: `/recover` (resume by email/phone), `/leaderboard` (big screen, auto-refresh 8s, first name + last initial only), `/admin` (stats, claim desk, per-checkpoint scans, leads table, CSV export with formula-injection guard), `/admin/qr` (printable QR sheet), password-protected admin via signed httpOnly cookie.

## Visual identity (dev-brutalist on the RIL brand kit)
**Fonts:** Open Sans (brand): 700 display/headings, 600 labels/clues, 400 body, 300 supporting copy. JetBrains Mono 400/700 for terminal lines, codes, counters only.
- Display: 700, `clamp(2.25rem, 9vw, 3.5rem)`, line-height 1.05, tracking -0.02em
- Label: 600, uppercase, 11px, tracking 0.24em (matches the kit's sub-brand lockup)
- Clue text: 600, 1.35rem/1.25. Body 16px. Inputs >= 16px (no iOS zoom).

**Colours (hex):** ink `#212120` (page bg) · white `#FFFFFF` · blue `#177AE5` (primary, fills/borders/large text) · sky `#2EA3E5` (small accent text) · teal `#29BDCC` · green `#29CC6E` (cleared/success) · fog `#E3E4E5 #C7C9CC #ABAFB2 #8F9499 #73797F` · coral `#FF5A5F` (errors only, not a brand colour). White-on-blue is ~4.2:1: use for bold/large text only.

**Structure:** 3px solid borders, 0 radius, hard offset shadows with no blur (`6px 6px 0 #177AE5`, also white/green/coral variants), 8px grid, single column max 480px on mobile, safe-area insets respected. Brand patterns: halftone dots (dots grow row by row), chevron rows, 135deg diagonal stripes for locked states. `[ ]` corner brackets frame clues and CTAs (echoing the RIL icon).

**Logo rules (from the kit):** horizontal lockup only, white or black only, no boxes/gradients/rotation/stacking, 16-32px margin, top-left. Use the official SVG (a redraw is only a placeholder).

## Screens, section by section
- **Landing:** eyebrow label, giant "Scan. Solve. Sprint." with "Sprint." on a blue block, halftone accent top-right, 4 numbered how-it-works cards (mono blue numerals), chevron divider, Leaderboard (white button) and Resume (ghost button).
- **Gate:** eyebrow "Checkpoint 00 · Start", H1 "Register to unlock clue 01" (unlock = blue on white block), name, EMAIL|PHONE segmented control, contact input, interest chips (selected = blue fill with "+ "), consent, submit inside blue corner brackets. Error = coral bordered box with mono "ERR".
- **Clue:** green label "Checkpoint 01/06 cleared", huge blue numeral `01` (6.5rem, 700) beside "Nice one, {name}.", mono command line `$ ./unlock --clue 01` typing in, then the clue in a bracket frame, progress blocks, resume link.
- **Wrong turn:** coral label, "Wrong turn." / "Bold move. Wrong door.", current clue in a coral bracket frame + hint.
- **Finish:** green starburst stamp "DONE #rank" (rotate -4deg), "You cracked it, {name}.", time, claim code in a green hard-shadow box (mono 2.4rem, select-all), prize-zone / raffle message in a bracket frame, leaderboard button.
- **Progress blocks:** mono ASCII `[###---]` + n/N, then N blocks: cleared = green with "+", current = blue blinking, locked = striped outline.
- **Leaderboard (1920x1080 friendly):** stat tiles (Registered / Hunting / Finished), chevron rule, table Rank / Hunter / Time, rank 1 row full blue.
- **Admin / QR sheet:** same tokens; QR sheet is white paper with ink QR codes, print-safe, 3px borders.

## Motion
Stepped easing function `t => Math.floor(t*n)/n` for the mechanical feel. Typewriter 30ms/char capped at 1.2s. Entrance: 12px rise + fade, 240ms, 4 steps, 60ms stagger between form rows. Button press: translate(6px,6px) + shadow to 0, 80ms linear. Progress fill / numeral: 3-5 steps. Cursor blink 1s `steps(1)`. Finish stamp: scale 0.7 -> 1, rotate -8 -> -4deg, 300ms, 5 steps. Disable all under `prefers-reduced-motion`.

## Components (named)
`BrandLogo`/`BrandIcon`, `Shell`, `BracketFrame`, `Halftone`, `Starburst`, `Tile`, `ProgressBlocks`, `Typewriter`, `Gate`, `ScanView` (Clue/Wrong/Finish), `RecoverForm`, `LiveRefresh`, `ClaimForm`, `LoginForm`, `PrintButton`.

## Responsive
Design at 360px, scale to 430px; single column <= 480px centred from 640px. Leaderboard/admin use a wider container from 1024px. Tap targets >= 48px. Assume flaky venue connectivity: keep JS light, no blocking spinners.

## Data model
`participants(id, name, email unique, phone unique, interest[], consent, track, session_token unique, entry_location, source, created_at)` · `scans(participant_id, location_id, scanned_at; PK both)` · `completions(participant_id PK, finished_at, duration_ms, claim_code unique, claimed_at)`. RLS on, no public policies; all access server-side with the service-role key. Locations, clues, tracks and prize rules live in one config file.

## Tech stack
Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3 (tokens above in `tailwind.config.ts`), Framer Motion 12, Supabase JS v2 (with an in-memory fallback store for demo mode), `qrcode`, `@fontsource-variable/open-sans`, `@fontsource/jetbrains-mono`. Server actions for register/recover/admin; cookie sessions (httpOnly, sameSite=lax).
