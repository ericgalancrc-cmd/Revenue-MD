# Auth0 setup — real per-user login

The app runs in demo mode (no login, single shared "demo" org) until Auth0
is configured. This doc covers what to set up once you have an Auth0
account, and how to share data across multiple staff at the same clinic.

## 1. Create the tenant + application

1. Sign up at https://auth0.com and create a tenant.
2. **Applications → Create Application** → name it (e.g. "RevenueMD") →
   type **Single Page Application**.
3. In the app's **Settings** tab, note the **Domain** and **Client ID**.
4. Set **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed
   Web Origins** to your Vercel URL (e.g. `https://revenue-md.vercel.app`)
   and `http://localhost:5173` for local dev.

## 2. Create the API

1. **Applications → APIs → Create API**.
2. Name it, set an **Identifier** (e.g. `https://api.revenuemd.com` — this
   is just a string identifier, not a real URL that gets called).
3. This identifier is the `AUTH0_AUDIENCE`.

## 3. Set environment variables

**Vercel** (frontend):
- `VITE_AUTH0_DOMAIN` = the Domain from step 1
- `VITE_AUTH0_CLIENT_ID` = the Client ID from step 1
- `VITE_AUTH0_AUDIENCE` = the Identifier from step 2

**Render** (backend, in `render.yaml` or the dashboard):
- `AUTH0_DOMAIN` = the Domain from step 1
- `AUTH0_AUDIENCE` = the Identifier from step 2

Both sides must be set together — setting only the backend's `AUTH0_DOMAIN`
without the frontend's matching client ID makes every API request fail
with 401, since the frontend would never obtain a token the backend accepts.

## 4. Turn on MFA

**Security → Multi-factor Auth** → enable at least one factor (e.g. OTP via
authenticator app) and set the policy to **Always** or **Adaptive**. This is
a HIPAA Security Rule expectation for remote access to ePHI systems
(`SEC-007` in the app's own Compliance tab) — it's a tenant-level dashboard
setting, not something the app's code can turn on for you.

## 5. Share data across a clinic's staff (optional, but usually what you want)

By default, each Auth0 user is treated as their own isolated "org" — correct
for a solo practitioner, but wrong the moment a clinic has more than one
staff login, since nobody would see each other's claims.

To fix that, add a **post-login Action** that stamps every user's access
token with a shared `org_id` you assign:

1. **Actions → Library → Build Custom**.
2. Name it (e.g. "Set org_id claim"), trigger: **Login / Post Login**.
3. Paste:

   ```js
   exports.onExecutePostLogin = async (event, api) => {
     const namespace = "https://revenuemdpr.com";
     // Set org_id in each user's app_metadata (see step 4 below) to group
     // staff under the same clinic. Falls back to the user's own ID —
     // i.e. their own private silo — if nothing's been assigned yet.
     const orgId = event.user.app_metadata?.org_id || event.user.user_id;
     api.idToken.setCustomClaim(`${namespace}/org_id`, orgId);
     api.accessToken.setCustomClaim(`${namespace}/org_id`, orgId);
   };
   ```

4. **Deploy**, then drag it into the **Login** flow (Actions → Flows →
   Login) and apply.
5. To put a staff member in a clinic's shared org: **User Management →
   Users** → select the user → **app_metadata** → paste:
   ```json
   { "org_id": "clinic-your-clinic-name" }
   ```
   Every user with the same `org_id` value shares the same claims data.
   Pick any stable string — it just needs to be unique per clinic and
   identical for everyone on that clinic's staff.

The backend (`backend/auth.py`) already reads this exact claim
(`https://revenuemdpr.com/org_id`) — no backend changes needed once this
Action is deployed.
