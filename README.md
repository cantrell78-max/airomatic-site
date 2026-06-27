# airomatic.ai

Static marketing site for **Airomatic** — an AI startup built in public. Astro, dark schematic theme, live Grok Build sessions on YouTube.

## Quick start

```bash
cd ~/projects/airomatic-site
source ~/.nvm/nvm.sh
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Environment

Copy `env.example` to `.env` and fill in:

| Variable | Purpose |
|----------|---------|
| `PUBLIC_YOUTUBE_URL` | YouTube channel link |
| `PUBLIC_YOUTUBE_LIVE_ID` | Featured stream/VOD on `/live/` |
| `PUBLIC_FORMSPREE_ID` | Contact form |
| `PUBLIC_CONTACT_EMAIL` | Fallback email |

## Pages

| Path | Purpose |
|------|---------|
| `/` | Home |
| `/live/` | YouTube live sessions hub |
| `/blog/` | Markdown posts in `src/content/blog/` |
| `/about` | Founder story + Airomatic legacy |
| `/contact` | Form + links |

## Deploy

GitHub + Cloudflare Workers Builds — see **[DEPLOY.md](./DEPLOY.md)** for full setup.

- Build: `npm run build`
- Deploy: `npm run deploy` (or `npx wrangler deploy`)
- Custom domain: `airomatic.ai` in Cloudflare dashboard

## Related

- [aeromaticdrone.com](https://aeromaticdrone.com) — Aeromatic Drone Services (sibling site)