# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Swift Freight Logistics** — a multi-page marketing and shipment-tracking website for a logistics company, deployed to Netlify at `https://swiftfreightlogix.netlify.app`.

## Commands

### Tailwind CSS (rebuild `output.css` after changing `input.css` or HTML classes)
```
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

### Run the email/API backend (from repo root)
```
node src/server.js
```

### Test email sending without starting the server
```
node src/test-email.js
```

### Run the admin tracking server (separate Express app)
```
cd tracking-app && node node.js
```

There is no test suite (`npm test` just exits with an error).

## Architecture

### Two separate Node.js servers

| Server | Entry point | Purpose |
|--------|-------------|---------|
| Main backend | `src/server.js` | Handles email dispatch via `src/mailer.js` (Nodemailer/Gmail) |
| Admin app | `tracking-app/node.js` (port 3000) | Lightweight Express server serving `tracking-app/client/` |

Note: `tracking-app/node.js` currently only contains the `app.listen` call — the `app` declaration and routes are missing, making it non-functional as-is.

### Frontend pages (`src/*.html`)

All pages are plain HTML + Tailwind + vanilla JS — no build step beyond Tailwind. Pages share:
- `src/style.css` — custom CSS (animations, overrides)
- `src/input.css` / `src/output.css` — Tailwind source and compiled output
- `src/script.js` — shared JS included inline in pages (tracking engine, payment switcher, reveal animations, back-to-top button)

Key pages:
- `index.html` — home/landing
- `payment.html` — shipment tracking UI (the main interactive feature); accepts a pre-filled tracking ID via `?id=` query param
- `quote.html` / `contact.html` — lead forms
- `services.html` / `about.html` — marketing pages

### Shipment tracking data flow

Tracking is **entirely client-side**: `script.js`'s `handleTracking()` fetches directly from the Contentful REST API using a hardcoded `spaceId` and `accessToken`. Shipment entries in Contentful must have `content_type=shipment` with fields: `trackingId`, `status`, `currentLocation`, `paymentStatus`, `destination`, `eta`, `packageDetails`, `name`, `sendersname`, `pickupDate`, `amountDue`, `btcAddress`, `usdtAddress`, `bankName`, `accountName`, `bankNumber`, plus transit step fields.

**Transit step field names in Contentful are inconsistent** — use these exact names:
- `TrasitStep3Name` / `TrasitStep3Location` / `transit3textcolor` (note: "Trasit", missing 'n')
- `Transitstep2Name` / `Transitstep2Location` / `transit2textcolor` (lowercase 's' in 'step')
- `TransitStep1Name` / `TransitStep1Location` (no textcolor variant used)
- `transit1textcolor` — used for the first (current status) step

There is a known bug in `script.js`: the active-check for transit step 2 uses `shipment.transitStep2Name` (wrong casing) instead of `shipment.Transitstep2Name`, so that step always renders as inactive.

### Email system (`src/mailer.js`)

Generates a `SFL-XXXXXXXXX` tracking ID, sends a styled HTML email with an embedded logo attachment (`./image/mainlog.jpeg`) via Gmail SMTP. Credentials are hardcoded in the file — `dotenv` is in `package.json` but not yet wired up.

Use `src/test-email.js` to fire a test email without starting the Express server.

### Admin panel (`tracking-app/client/`)

`admin.html` is served by the tracking-app Express server. `admin.js` is currently empty. This is a separate concern from the main site.

### Styling approach

Tailwind is loaded three ways simultaneously in `payment.html`: CDN browser build (`@tailwindcss/browser@4`), CDN (`cdn.tailwindcss.com`), and local compiled `output.css`. The root `tailwind.config.js` has an empty `content: []` and is not used; the active config is `src/tailwind.config.js`.

Custom fonts: **Bebas Neue** (display), **DM Sans** (body), **JetBrains Mono** (mono). Animation libraries: GSAP + ScrollTrigger (CDN), Lenis smooth scroll (CDN), ScrollReveal (CDN). Reveal animations are driven by CSS classes (`reveal-init`, `reveal-from-left`, `reveal-from-right`, `reveal-from-bottom`) toggled by an IntersectionObserver in `script.js`.

### `src/contentful.js`

Stub file with a broken `import` — currently unused. Do not rely on it.
