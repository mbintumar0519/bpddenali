# Denali Health · Bipolar Depression Research Landing Page

> **Draft recruitment material.** Not for public use until sponsor and IRB approval.

Next.js 16 (App Router) recruitment landing page for a bipolar depression
research study at Denali Health in the Atlanta, GA area. The page is designed
around the emotional experience of bipolar depression rather than study
mechanics — see `src/lib/study.ts` for the facts and `src/components/sections.tsx`
for the section-by-section copy.

## Getting started

```bash
cp .env.example .env.local   # fill in the CRM webhook + analytics IDs
npm install
npm run dev                  # http://localhost:3000
```

| Script              | Purpose                            |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Dev server                         |
| `npm run build`     | Production build                   |
| `npm run start`     | Serve the production build         |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | `tsc --noEmit`                     |

## Where things live

| Path                            | What it is                                                    |
| ------------------------------- | ------------------------------------------------------------- |
| `src/lib/study.ts`              | **All IRB-controlled facts** — copy, numbers, contact details  |
| `src/lib/prescreen.ts`          | Answer model, triage, validation (shared client/server)        |
| `src/lib/tracking.ts`           | UTM/click-ID capture + analytics event fan-out                 |
| `src/app/api/lead/route.ts`     | Lead intake → CRM webhook                                      |
| `src/components/Hero.tsx`       | Headline + the embedded pre-screen form, side by side           |
| `src/components/PrescreenForm.tsx`  | The pre-screen: a single scrollable list of questions, not a step wizard |
| `src/components/sections.tsx`   | Static page sections                                           |

Change study numbers, phone, address, or eligibility ranges in
`src/lib/study.ts` only — every component reads from it, so nothing drifts out
of sync with approved materials.

## Lead flow

1. The pre-screen is embedded directly in the hero (`id="screen"`) as one
   scrollable list of compact question rows — not a modal, not a step wizard.
   Every other `href="#screen"` CTA on the page just scrolls back up to it
   (see `Enhancements.tsx`).
2. `triage()` sorts the answers into `likely` / `review` / `unlikely`. This sets
   **callback priority only** — the visitor is never told they do or do not
   qualify, and study staff confirm every requirement.
3. On submit, `POST /api/lead` re-validates server-side, applies a honeypot,
   a submit-timing check, and a per-IP rate limit, then forwards to
   `GHL_WEBHOOK_URL`.

`GHL_WEBHOOK_URL` is **server-only** on purpose — the endpoint that creates CRM
records must never be reachable from the browser. If it is unset (local dev,
pre-launch), the API logs a warning and still returns success so the thank-you
screen renders.

Attribution (UTMs, `gclid`, `fbclid`, referrer) is captured on first touch and
persisted in `sessionStorage`, so a lead submitted on a later visit still
carries the campaign that paid for it.

## Analytics

GTM, GA4, and Meta Pixel each load only when their ID is set in the environment.
Events emitted: `prescreen_started`, `prescreen_abandoned`, `prescreen_submitted`
(also sent to Meta as `Lead`).

## Before launch

- [ ] Sponsor and IRB approval of all on-page copy
- [ ] Confirm the compensation schedule against the current approved consent form
- [ ] Swap the placeholder testimonial quotes (`REVIEWS` in `sections.tsx`)
      for verified, IRB-approved patient reviews
- [ ] Build out `/privacy` and `/terms` (footer links to them now; pages don't
      exist yet)
- [ ] Set `GOHIGHLEVEL_API_KEY` / `GOHIGHLEVEL_LOCATION_ID` and verify a test
      lead lands in the CRM
- [ ] Set `NEXT_PUBLIC_SITE_URL` so canonical/OG URLs resolve

## Design notes

The palette, typography (Fraunces display serif + Inter body), and section
copy follow a "calm mental-health brand" direction rather than a clinical one
— see `src/app/globals.css` for the color tokens. The hero, visual-break, and
final-conversion sections use gradient compositions rather than photography.

These are real, freely-licensed stock photos suitable to ship as-is, not
placeholders — but confirm with sponsor/IRB before launch, since a licensed
image bank (e.g. one the sponsor already pays for) may be preferred for a
production clinical-trial site.
# bpddenali
