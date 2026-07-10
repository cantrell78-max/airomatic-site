---
title: "Agentic AI Startup News — live on airomatic.ai"
description: "Live session: a satirical, data-driven archive of AI startup funding announcements — cards, filters, founder portraits, and a living feed built with Grok Build."
pubDate: 2026-07-10
youtubeId: ISQM_Faun50
featuredStartupIds:
  - quantara-2026-07
  - aegisforge-2026-07
  - claimara-2026-07
---

After [Mars-Colony](/blog/mars-colony-live/), we turned Grok Build toward something closer to the daily noise of the AI ecosystem: **Agentic AI Startup News** — a living archive of satirical funding announcements that look a little too much like the real feed.

The tone is clean tech-news UI with a thin layer of performance art. Patterns detected. Deals riffed. Portraits generated.

## What is Agentic AI Startup News?

It's a new section on this site at **[/startups](/startups/)** — not a throwaway joke page, but a small product-shaped surface:

- **Data-driven feed** — every announcement lives in `startups.json` (company, round, verticals, founder + investor quotes)
- **Founder portraits** — fixed image assets, one per announcement, styled as serious headshots with the signature smug energy
- **Responsive card grid** — three columns on desktop, two on tablet, one on mobile
- **Modal detail view** — headline, full description, and both quotes without leaving the page
- **Vertical filters** — Quantum, Defense, Insurtech, Dev Tools, Real Estate, and more
- **Load more** — so the archive can grow batch by batch without dumping everything at once

Click any of the sample cards below to jump into the full archive.

## Why build this?

Airomatic ships practical AI-adjacent software in public. This project sits at a fun intersection:

1. **Content as data** — future batches are add-JSON-and-drop-images, not hand-edited pages
2. **Design system reuse** — same dark palette, mono labels, and card language as the rest of airomatic.ai
3. **Agentic irony** — agents watching funding news a little too closely, then performing the genre back at us

It’s also a sharp live-coding target: schema → cards → filters → modal → nav → deploy, all visible on stream.

## What we shipped in this session

1. Source batch under `agentic-ai-startup-news/` (JSON + portraits) treated as the source of truth
2. Integration into the Astro site: `/startups` route, reusable `StartupCard` component
3. Client-side filters and pagination
4. Nav + homepage teaser so the section feels native, not bolted on
5. This build log and a refreshed [Live](/live/) embed

## Stack

| Piece | Choice |
|-------|--------|
| Site | Astro 6 (static) |
| Data | `src/data/startups.json` |
| Images | `public/images/startups/` |
| UI | Existing CSS design system (no Tailwind) |
| Interactives | Vanilla client JS (filters, load more, modal) |
| Agent | Grok Build |

## How to add the next batch

Documented in the code, but the short version:

1. Add new objects to `src/data/startups.json`
2. Drop matching portrait files into `public/images/startups/`
3. Rebuild / redeploy — the page picks them up automatically

## Watch the stream

The session is embedded above — follow along as we wire the archive, polish the cards, and ship the section.

**Browse the archive** — [Agentic AI Startup News](/startups/)

**Live page** — always-on embed of the current featured stream: [Watch live](/live/)

**Previous episode** — [Building Mars-Colony Live](/blog/mars-colony-live/) ([YouTube](https://youtu.be/KRNjt5EFqOA))

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI) for notifications when we go live. Questions or topic ideas? [Send a message](/contact/).
