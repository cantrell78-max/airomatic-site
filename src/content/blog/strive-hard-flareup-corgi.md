---
title: "Strive Hard update — FlareUp dating app & Corgi Café (seizure branding included)"
description: "New content for the SF founder RPG: FlareUp on the iHype with four satirical dating profiles, plus Corgi Café — a neon pitch-cult location that attacks your retinas. Play free at /strive-hard."
pubDate: 2026-08-03
ogImage: /images/blog/strive-hard-og.jpg
---

![Strive Hard — game poster](/images/blog/strive-hard.jpg)

**Play the update:** [airomatic.ai/strive-hard](/strive-hard/)

Chapter 1 of [Strive Hard](/blog/strive-hard-live/) already took you from a Tenderloin mattress to a yacht called Diligence. This pass expands the **free-roam** side of the Bay: a dating app that treats every match like a funnel, and a café that treats every customer like a pipeline.

## What’s new

### FlareUp (on the iHype)

The phone HUD grows a fifth icon: **FlareUp** — SF dating, but every bio is a pitch deck.

Four profiles ship in v1:

| Match energy | Who | The bit |
|--------------|-----|---------|
| Unreachable | **Kayla, 27 — GTM @ Corgi** | Speaks only in ICP / ACV / closed-won. Standards are a moat. **Never matches in-app.** May text you a rejection that still feels like a sales motion. |
| Soft chaos | **Jules, 31** | Community / “vibes ops.” Pronouns-as-status-signal, gentle FAQ energy — comedy kept light, not cruel. Can match and unlock texts. |
| Real life DLC | **Marisol, 34** | Single mom. “Man up or swipe left.” Match odds improve if you look solvent (cash, clout, seed). |
| Battle-tested | **Vanessa, 39** | Ready to settle. Rough dating history on the card. **“I need a real man.”** Consistency over newsletter energy. |

Like / pass, match chances, and matched people open **Messages** threads. Clear the deck and you can refresh — matched people stay matched. Your save migrates automatically if you already had a run in `localStorage`.

### Corgi Café (new Map pin)

Day-one location. Door shaped like a dog. Colors that should require a medical waiver.

The loop is pure brand hypnosis:

1. **Arrive** — onesie lanyard, “FOUNDER (PRE-BELIEF),” lights at roughly 12Hz  
2. **Menu-as-deck** — Series A cold brew, QR napkins, mutual GTM combat at the bar  
3. **What is Corgi?** — three employees, three definitions, zero clarity  
4. **Pitch floor** — soft closes every five feet; toilet soap says WASH · RINSE · REFER  
5. **Deep end** — short film of corgis raising seed; temporary tattoo on your wrist  
6. **Optional Kayla sighting** — only if you liked her on FlareUp first (she will ask for your ACV)

While you’re there, the **story panel goes full seizure-brand** (neon gradients, chromatic flicker, pulse bar). If you prefer calmer screens, the UI respects `prefers-reduced-motion` — weird colors stay, strobe stops.

### Story wiring

- Intro plan mentions FlareUp + Corgi; you can open either on day zero  
- Home hub references matches and “orange spots when you blink”  
- New-day flavor texts for both systems  

Chapter 1’s mattress → yacht spine is unchanged. This is the sideways expansion the free-roam hubs were waiting for.

## Why these two?

Dating apps and brand cafés are the same SF sport: **self as product**, **pipeline as personality**, **merch as proof of life**. FlareUp mocks the first. Corgi Café is the second with the brightness cranked past legal.

Still zero affiliation with any real incubator, yacht, sauna, dog company, or dating product. Rated R for bad takes and aggressive orange.

## Stack (unchanged, extended)

| Piece | Notes |
|-------|--------|
| Game | Vanilla HTML / CSS / ES modules under `public/strive-hard/` |
| Story | Scene graph in `scenarios.js` + location hubs |
| Dating | New `flareup.js` data + swipe logic in `game.js` |
| Saves | Same `localStorage` key; FlareUp fields migrate on load |
| Host | Cloudflare Workers via airomatic-site |

No backend. No app store. Ship the files. Strive harder.

## Try it

- **Play:** [/strive-hard/](/strive-hard/) — **Menu → Fullscreen** if the iframe feels tight  
- **Original launch post:** [Strive Hard goes live](/blog/strive-hard-live/)  
- **Feedback / co-write more scenarios:** [Contact](/contact/)

Want full FlareUp *date* scenes (not just texts), more Corgi lore, or per-founder romance routes? The group chat is open — and Kayla still isn’t in your ICP.

**Previous on the blog** — [Strive Hard launch](/blog/strive-hard-live/) · [Agentic AI Startup News](/blog/agentic-ai-startup-news-live/).

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI). Questions? [Contact](/contact/).
