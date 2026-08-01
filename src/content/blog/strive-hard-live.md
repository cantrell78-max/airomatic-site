---
title: "Strive Hard — Leisure Suit Larry for SF tech founders, live on airomatic.ai"
description: "A crude choose-your-own-adventure RPG: blank X account, Tenderloin studio, YC Startup School, Garry Chan’s sauna, and a yacht called Diligence. Score is followers. Phone is an iHype. Play free at /strive-hard."
pubDate: 2026-08-01
ogImage: /images/blog/strive-hard-og.jpg
---

![Strive Hard — game poster, a founder romance for the AI age](/images/blog/strive-hard.jpg)

**Play it now:** [airomatic.ai/strive-hard](/strive-hard/)

We pointed Grok Build at a stupidly on-brand idea: what if **Leisure Suit Larry** grew up in the Tenderloin with a blank X account, an oat-milk addiction, and a dream of becoming a billionaire influencer?

## What you play

**Strive Hard** is a browser RPG (no install, no account, autosave in your browser):

- **Pick a founder** — 24-year-old tech bro, 29-year-old Asian woman CMO, 20-year-old Indian CS major, or 18-year-old Chinese math genius
- **Scoreboard = your fake X account** — post selfies and funding rounds; watch followers and engagement climb (or die in the replies)
- **iHype phone** (Pear Inc. parody) on the side — **X**, **Map**, **Texts**, and a **Selfie** composer
- **Map the Bay** — Tenderloin studio, Vibe Code Café, hackathon, Y Combinator Startup School, Stanford, Garry Chan’s sauna, YC SUS yacht afterparty
- **Texts** from roommates, mom, rival founders, dealflow associates, and VCs who keep inviting you to “put our heads together on some coding problems… on the yacht?”

It’s choose-your-own-adventure slapstick: crude, satirical, and extremely San Francisco.

## Why ship this?

Airomatic builds in public — tools, demos, and the occasional game that says something about the culture we’re coding inside. Strive Hard is that culture with the polite filter removed:

- Startup school as free Zoom advice that costs your personality  
- Product-market fit as a theorem (or a waitlist of three emails)  
- Diligence that happens in a sauna  
- A boat literally named **Diligence**

Chapter 1 runs mattress → café/hackathon → YC → sauna → yacht. More scenarios, character-specific branches, and a real drawn map are parked for later co-writing.

## Stack

| Piece | Choice |
|-------|--------|
| Runtime | Browser only |
| UI | Vanilla HTML / CSS / ES modules |
| Story | Data-driven scene graph (`scenarios.js`) |
| Saves | `localStorage` |
| Host | `public/strive-hard/` on airomatic-site → Cloudflare Workers |

No backend. No app store. Ship files, hit refresh, strive harder.

## Design notes that mattered

1. **Phone as HUD** — X is the scoreboard; Map is travel; Texts are romance / VC heat; Selfie is always-on content grinding.
2. **Free-roam choices open Map** — when the story says “go somewhere,” the iHype actually pops the map app.
3. **Character chip in the top bar** — always know who’s failing upward.
4. **Rated R for bad takes** — not affiliated with any real incubator, yacht, or sauna.

## Try it / source of truth

- **Play:** [/strive-hard/](/strive-hard/) — use **Menu → Fullscreen** in-game for a larger play surface
- **This write-up:** you’re reading it
- **Build process:** Grok Build CLI — same public-shipping loop as Cybertruck Assembly Line, the startup archive, and the rest of the site

Want more locations, spicier routes per founder, or a literal Bay Area map art pass? [Tell us](/contact/) — the group chat is always open.

**Previous on the blog** — [Cybertruck Assembly Line](/blog/cybertruck-assembly-line-live/) · [Agentic AI Startup News](/blog/agentic-ai-startup-news-live/).

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI) for live sessions. Questions? [Contact](/contact/).
