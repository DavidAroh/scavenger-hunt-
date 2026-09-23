# RIL at Nerd Work — Event Runbook

This runbook connects the hunt app to the physical booth. **The complete attendee journey stays inside the RIL booth footprint**: QR registration, phone puzzles, physical clue, head-to-head game, demos, showcase, offers and prize claims. Do not place clues elsewhere in the venue. Update the event-specific values in `lib/config.ts` before printing materials or opening registration.

## Before doors open

- Deploy with Supabase configured; the in-memory demo store is not suitable for live leads or prize claims.
- Set `NEXT_PUBLIC_BASE_URL` to the final HTTPS domain, then sign in to `/admin/qr` and print a scan-tested QR sheet.
- Put a clearly visible **blue numeral 7** on the booth. The physical clue accepts `7` (and the word `seven`). Keep it on the booth for the full event.
- Configure the bootcamp, ticket and merch URLs in `lib/config.ts`. Confirm the bootcamp curriculum, eligibility, dates, ticket discount rules, available sizes, stock and prices with the responsible RIL teams.
- Replace the generic showcase cards with approved project titles, descriptions, maker names and demo instructions. Obtain permission before displaying any participant work or personal details.
- Confirm actual prizes, quantity, raffle rules and claim process. Every finisher receives a configured completion reward and raffle entry; the first 20 also qualify for the premium bundle. Staff can add verified entries for RIL Versus, merch purchases and demos.
- Test the full journey on at least two phones and a laptop. Include reload/recovery, wrong answers, timer expiry, finish, leaderboard and staff prize claim.

## Hunt answer key (staff only)

| Stage | Expected answer / action |
| --- | --- |
| Clue 01 | `keyboard` |
| Hidden message | `RIL` — first letter of each line |
| Map fragment I | Record `1990`; it is the deliberate red herring |
| Booth symbol | Find the blue `7` on the booth |
| Combined answer | `keyboard7` |
| Timed race | `clock` (also accepts `time`) |
| Map fragment II | Read Fragment I backwards |
| Map code | `0991` |
| Final lock | `keyboard71` — first answer + booth numeral + last digit of corrected map code |

Do not post this section where participants can see it.

## Booth stations and handoffs

1. **Welcome / QR:** one staff member invites attendees to scan, explains the required contact field and participation consent, and points out the optional marketing checkbox.
2. **RIL Versus:** reserve two laptops, power, a chosen head-to-head game, a visible queue and a staff member to start matches and announce winners. The website does not run or score this game; decide the game and match length before the event.
3. **Treasure hunt:** keep the numeral 7 in place within the booth footprint, help with hints without giving answers, and direct stuck players to `/recover` if they changed phones or cleared their browser. All other hunt stages are on the participant's phone; no venue-wide search is required.
4. **Community showcase:** assign a maker or host to each demo. Keep a short introduction and a bootcamp QR/link beside each exhibit.
5. **Prize desk:** open `/admin`, look up the claim code, verify the winner's name or identity, check the prize inventory, then mark the claim. Do not mark a prize claimed before handing it over.
6. **Offers and raffle:** point attendees to `/experience`. Explain current ticket discounts, merchandise stock, bootcamp details and raffle eligibility using the approved terms for the event.

## Suggested shift roles

- **Host:** welcome, QR registration and crowd flow.
- **Game lead:** RIL Versus queue, rules and score display.
- **Hunt guide:** booth clue and non-spoiler hints.
- **Showcase lead:** demos, maker introductions and bootcamp questions.
- **Prize desk:** claim verification, inventory and incident log.

Small teams can combine roles. Keep one person responsible for each prize handoff and ensure staff breaks have cover.

## If something goes wrong

- **QR does not scan:** share the printed short URL shown under the QR; check that the live domain is correct.
- **Participant loses their session:** direct them to `/recover` and have them enter the same email or phone.
- **Timer expires:** the app restarts the timed stage with a reshuffled prompt; the overall completion clock continues.
- **Claim code cannot be found:** search again carefully, verify the participant identity, and record the issue for the event lead. Never invent a code or mark a different participant's prize claimed.
- **Connectivity/database failure:** pause new registrations and prize claims until service returns. Do not switch a live event to demo mode because its data is ephemeral.

## Closeout

- Reconcile claimed prizes against physical stock and export the lead CSV from `/admin/export`.
- When the raffle closes, export `/admin/raffle-export` and draw one ticket number at random. The file contains one row per ticket, so extra verified activity entries increase that participant's odds. Keep the export and record the selected ticket and prize handoff with the event lead.
- Restrict the CSV to authorized RIL staff and follow the organization's retention and deletion policy.
- Record attendance, completed hunts, prize claims, offer interest and operational issues for the post-event review.
