# RevenueMD — Project for Claude Code

This is the **RevenueMD** web app — an AI-assisted, payer-aware pre-submission
claim-scrubbing platform for Puerto Rico healthcare providers.
Tagline: *Revenue Intelligence Software.*

This folder is ready to open in **Claude Code**. Hand Claude Code this whole
folder and it can run, edit, and deploy the app.

---

## What this is
- A React + Vite single-page app (the full RevenueMD product UI).
- Brand: navy `#10245C` + teal `#16B6C9`, "Revenue**MD**" wordmark.
- Bilingual (English / Spanish), 10 modules: Overview, Batch queue, Intake,
  Claims, AI Analysis, Denials, Revenue, Payers, Compliance, Business.
- All data is demo/mock data — safe to show anyone. No real patient data.

## Main file
- `src/App.jsx` — the entire app lives here.
- `src/main.jsx`, `index.html`, `vite.config.js`, `package.json` — standard
  Vite scaffolding.

---

## First things to ask Claude Code

Paste any of these in plain English once you're in:

- "Install the dependencies and start the dev server so I can see the app."
- "Swap in my real RevenueMD logo image instead of the drawn one."
- "Walk me through deploying this to a live URL on Vercel."
- "Change [whatever] on the dashboard."

## To run it (what Claude Code will do for you)
```
npm install
npm run dev
```
Then open the `http://localhost:5173` link it prints.

---

## Honest notes
- This is the FRONT-END (what users click). It currently uses mock data.
- The BACKEND (rules engine, EDI 837 parser, batch processor — real Python)
  is a separate, larger project in `revenuemd-platform.zip` /
  `claimpro-architecture`. Open that separately if you want to work on the
  server side. (Folder still named "claimpro-architecture" internally — ask
  Claude Code to rename it to "revenuemd" if you want.)
- Before any real patient data flows through it: sign BAAs, enable the audit
  logging that's already built, and complete a security review.
- Compliance/payer rules marked "verify" are placeholders — confirm against
  current ASES / payer manuals with a certified PR coder before production.

## To swap in your real logo
1. Put your logo PNG in `src/` (e.g. `src/logo.png`).
2. Ask Claude Code: "Use src/logo.png as the brand logo in the sidebar and
   login instead of the drawn SVG mark."
