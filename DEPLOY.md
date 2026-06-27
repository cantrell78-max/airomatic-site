# Deploy — GitHub + Cloudflare Workers

## Cloudflare build settings (Workers Builds)

This project uses Cloudflare’s **Workers Builds** flow (Git → build → `wrangler deploy`), not the older “Pages only” screen that shows **Build output directory: `dist`**.

| Setting | Value |
|---------|--------|
| Git repository | `cantrell78-max/airomatic-site` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` (default) |
| Static files | `./dist` via `wrangler.jsonc` in the repo |

Node version **22** in the project’s environment settings (matches `.nvmrc`).

## 1. GitHub repository

```bash
cd ~/projects/airomatic-site
git remote add origin git@github.com:cantrell78-max/airomatic-site.git
git push -u origin main
```

## 2. Connect Cloudflare Workers to GitHub

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Choose **Import a repository** (Workers Builds / Connect to Git)
3. Authorize GitHub if prompted — select `cantrell78-max/airomatic-site`
4. Build settings (table above) → **Save and Deploy**
5. Cloudflare may open a PR or push a `cloudflare/workers-autoconfig` branch — merge if you want the full Astro + Cloudflare adapter setup; the static `wrangler.jsonc` in `main` is enough for this site as-is.
6. Wait for first deploy → preview URL `https://airomatic-site.<account>.workers.dev`

## 3. Custom domain (airomatic.ai)

1. Workers project → **Settings** → **Domains & Routes** → **Add** → **Custom domain**
2. Enter `airomatic.ai` and optionally `www.airomatic.ai`
3. Cloudflare adds DNS records automatically if the domain is on the same account
4. HTTPS certificate provisions in a few minutes

### Redirect www → apex (optional)

Use **Rules** → **Redirect Rules** in the Cloudflare dashboard (not `_redirects` — absolute URLs fail Workers static deploys).

## 4. Environment variables

Set in Cloudflare → project → **Settings** → **Variables and Secrets** (or **Build** env for build-time):

| Variable | Purpose |
|----------|---------|
| `PUBLIC_YOUTUBE_URL` | YouTube channel link |
| `PUBLIC_YOUTUBE_LIVE_ID` | Featured stream/VOD on `/live/` |
| `PUBLIC_FORMSPREE_ID` | Contact form |
| `PUBLIC_CONTACT_EMAIL` | Fallback email |

Copy names from `env.example`. Never commit `.env`.

## 5. Day-to-day updates

```bash
cd ~/projects/airomatic-site
git add .
git commit -m "Update site"
git push
```

Cloudflare rebuilds on every push to `main` when the project is connected to Git.

### Auto-deploy not running?

In **Workers & Pages** → **airomatic-site**:

1. **Deployments** — Source should say **Git** with a commit hash, not **Direct Upload** or manual **Wrangler**.
2. **Settings → Builds** — production branch `main`, build `npm run build`, deploy `npx wrangler deploy`.
3. **Connect to Git** — re-authorize GitHub and confirm repo `cantrell78-max/airomatic-site`.

## 6. Local preview

```bash
source ~/.nvm/nvm.sh
cd ~/projects/airomatic-site
npm run dev
```

Open http://localhost:4321