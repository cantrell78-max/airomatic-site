---
title: "Fairies Wear Boots — a late-night street stomp, live on airomatic.ai"
description: "We built a 2D side-scrolling action-platformer with Grok Build: a tiny fairy in oversized steel-toe boots, a looping English street that melts into a purple-black trip, and an original doom riff. Play free at /fairies-wear-boots."
pubDate: 2026-08-31T18:00:00.000Z
ogImage: /images/blog/fairies-wear-boots-og.jpg
---

![Rain-slick English night street under sodium lamps, occult-metal poster paint](/images/blog/fairies-wear-boots.jpg)

**Play it now:** [airomatic.ai/fairies-wear-boots](/fairies-wear-boots/)

We pointed Grok Build at a loud, specific picture: a small winged fairy in **comically enormous combat boots**, stomping a wet Birmingham-ish street at 2 a.m. until the brickwork gives up and turns into a purple-black trip. Title card big enough to read from the pavement:

**FAIRIES WEAR BOOTS**  
*Yeah, you gotta believe me.*

## What you play

A browser side-scroller (no install, no account):

- **You** are the fairy. The boots are the weapon.
- **Move** with WASD or arrows, **jump** with Space (or W / ↑), **stomp-kick** with J or a click
- Airborne mash on kick turns into a short **boot dance combo**
- Stomps have weight: screen-shake, a shockwave, boot-boys flattening into the cobbles
- **Trip orbs** swirl gold, purple, and sodium-amber — they invert gravity, stretch the street, or spawn extra fairies that trail your kicks
- Enemies: 1970s **boot-boys** on patrol, and floating **beer-bottle spirits** with a grin in the glass
- Mid-street, a **bigger boot-wearing fairy** and a **dancing dwarf** want a partner, not a funeral. Score steps. Believe them.

The street loops. Sodium lamps, rusted spear fences, rain, then glowing mushrooms and warped pub windows leaking bruise-purple light. Film grain sits on everything. The riff is original procedural doom — slow, distorted, swinging on cobblestones — plus rain.

![The fairy in moth wings and oversized steel-toe boots](/images/blog/fairies-wear-boots-fairy.png)

## Why this one

Airomatic ships tools, and it also ships the games that fall out of a session when the prompt is too particular to ignore. This one is occult-metal poster art as a playable loop: crushed blacks, gold trim, a tiny body in iron buckets for shoes. The first cut is one street, jump, stomp, score — enough to walk it tonight.

## Stack

| Piece | Choice |
|-------|--------|
| Runtime | Browser only |
| Rendering | Canvas 2D, painted sprites |
| Logic | Vanilla ES modules |
| Audio | Procedural Web Audio doom riff + stomp thumps |
| Host | `public/fairies-wear-boots/` on airomatic-site → Cloudflare Workers |

No backend. Click once and the riff starts. Mute with **M**. Pause with **P**.

## How to stomp

- **A / D** or arrows — move
- **Space / W / ↑** — jump
- **J** or click — stomp-kick
- Mash **J** in the air for the dance combo
- Collect orbs. Stomp the boot-boys. Kick the bottles. When the dwarf starts jigging in the mid-ground, you’ve reached the trip.

Phone: on-screen **◀ ▶ JUMP STOMP**.

## Try it

- **Play:** [/fairies-wear-boots/](/fairies-wear-boots/)
- **This write-up:** you’re reading it

If a sprite clips a lamp, a stomp feels light, or the street wraps wrong, [tell us](/contact/). The cobbles are still wet.

**Previous on the blog** — [Agentic desk Aug 31](/blog/agentic-desk-2026-08-31/) · [老鼠赛跑 / Rat Race](/blog/rat-race/).
