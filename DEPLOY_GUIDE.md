# ClaimPro PR — Get It Live on a URL (open on your Mac in a browser)

This guide takes the demo you've seen and puts it **online at a real link**
you can open in Safari/Chrome on your Mac — no installer needed. You can then
"Add to Dock" so it launches like an app.

There are two stages:
- **Stage 1 — Demo live in ~20 min (free).** Just the clickable front end
  (mock data). Perfect to share with investors/clinics today.
- **Stage 2 — Real app (later).** Connect the FastAPI backend + database so it
  processes real claims. Outlined at the bottom.

---

## STAGE 1 — Put the demo online (free, ~20 minutes)

You'll use **Vercel** (free hosting for web front ends). No credit card needed.

### What you need
- A free GitHub account → https://github.com/signup
- A free Vercel account → https://vercel.com/signup (sign in "with GitHub")
- The two files in this package: `package.json` and `App.jsx`
  (`App.jsx` is your full site — the same one from the preview)

### Step 1 — Make a project folder on your Mac
Open the **Terminal** app (press ⌘+Space, type "Terminal", Enter) and run:

```bash
mkdir claimpro-pr
cd claimpro-pr
mkdir src
```

### Step 2 — Add the files
- Put `package.json` and `index.html` and `vite.config.js` in the `claimpro-pr` folder
- Put `App.jsx` and `main.jsx` inside the `src` folder

(Everything you need is in this package — just drag them into place in Finder.)

### Step 3 — Test it on your Mac first
In Terminal, from inside the `claimpro-pr` folder:

```bash
npm install
npm run dev
```

It will print a line like `Local: http://localhost:5173`. Hold ⌘ and click that
link — your app opens in the browser. This is it running on your Mac.
Press `Ctrl+C` in Terminal to stop it.

### Step 4 — Put it on GitHub
```bash
git init
git add .
git commit -m "ClaimPro PR demo"
```
Then create an empty repo at https://github.com/new (name it `claimpro-pr`),
and run the two lines GitHub shows you under "…or push an existing repository",
which look like:
```bash
git remote add origin https://github.com/YOURNAME/claimpro-pr.git
git push -u origin main
```

### Step 5 — Deploy on Vercel (this is the part that gives you the URL)
1. Go to https://vercel.com/new
2. Click **Import** next to your `claimpro-pr` repo
3. Vercel auto-detects it's a Vite app — just click **Deploy**
4. ~60 seconds later you get a live URL like
   `https://claimpro-pr.vercel.app`

**That URL is your app.** Open it on your Mac, your phone, send it to anyone.

### Step 6 — Make it feel like a Mac app (optional)
- Open the URL in **Safari**
- Menu bar: **File → Add to Dock**
- Now it launches from your Dock in its own window, like an installed app.
  (In Chrome: **⋮ menu → Cast, Save, Share → Install page as app**.)

### Updating it later
Any time you change a file, just:
```bash
git add . && git commit -m "update" && git push
```
Vercel redeploys automatically in under a minute. No reinstalling, ever —
that's the whole advantage of SaaS over a desktop installer.

---

## Custom domain (optional, ~$12/yr)
When you want `app.claimpropr.com` instead of the `.vercel.app` link:
1. Buy the domain (Namecheap, Cloudflare, or Vercel itself)
2. In Vercel: **Project → Settings → Domains → Add**
3. Follow the DNS instructions it gives you. Done.

---

## STAGE 2 — Make it a REAL app (when you're ready for live data)

The demo uses mock data. To process real claims you add the backend you
already have in `claimpro-architecture/`:

1. **Backend (FastAPI)** → deploy to **Render** or **Railway** (both have simple
   "connect GitHub repo" flows like Vercel). They give you a backend URL.
2. **Database (PostgreSQL)** → Render/Railway/Supabase all offer managed
   PostgreSQL — click to create, copy the connection string into your backend's
   `DATABASE_URL`.
3. **Connect them** → set the frontend's API base URL to your backend URL, swap
   the mock data arrays for `fetch()` calls.
4. **Before real patient data:** sign BAAs (AWS, Anthropic, Clerk), turn on the
   audit logging that's already built, and get a security review. (Covered in
   the main README.)

I can build any of these stages out for you — just ask.

---

## Quick reference — which service does what

| Piece | Service | Cost |
|---|---|---|
| Front end (the URL) | Vercel | Free |
| Code storage | GitHub | Free |
| Backend (later) | Render or Railway | Free tier → ~$7/mo |
| Database (later) | Supabase / Render PG | Free tier → ~$7/mo |
| Custom domain (optional) | Namecheap / Cloudflare | ~$12/yr |

You can be live on a free `.vercel.app` URL today, and only start paying when
you add the real backend and want a custom domain.
