---
title: "Freedom Eagle — they picked the wrong roof"
description: "We built a 2D rooftop shooter with Grok Build: blonde commando, Twin Towers, New York 2001, 747s, red-white-blue lasers, patriotic fireworks, and a bitcrushed hard-rock Star Spangled Banner. Play free at /freedom-eagle."
pubDate: 2026-09-11T18:00:00.000Z
ogImage: /images/blog/freedom-eagle-og.jpg
---

![Blonde spiked-hair commando on a Twin Tower rooftop, eagles, sunburst, Statue of Liberty in the harbor](/images/blog/freedom-eagle.jpg)

**Play it now:** [airomatic.ai/freedom-eagle](/freedom-eagle/)

The brief was not subtle. Blonde commando. Spiked hair. Camo pants. Khaki muscle shirt. Machine gun. Twin Towers. New York City, 2001. Commercial 747s coming in hot. Red, white, and blue lasers. When you shoot them down they become fireworks. He talks in comic bubbles. The anthem is hard rock and sounds like it was ripped off a 96 kbps MP3.

So we built **Freedom Eagle**.

You are on the roof. Liberty is in the harbor. Manhattan is behind you. The 747s do not get a second try.

## What you play

A browser rooftop shooter (no install, no account):

- **You** are the commando. The gun is a stars-and-stripes machine gun that fires a triple laser — red, white, and blue at once
- **The Twin Towers** are the lives. North and South each have a health bar. A jet that gets through chips the facade. Either tower at zero ends the run
- **747s** come from both sides, then faster, then thicker. Wave number climbs with the clock
- **Kills** bloom into patriotic fireworks. The commando yells from a comic bubble: *FUCK YEAH!* · *NICE TRY TERRORIST SCUM!* · *USA! USA!* · *EAT LASER!*
- **Score** chains. Hold the roof and the combo stays hot
- Eagles patrol the sky. Flags whip. The girder between towers is the run you make when a jet lines up on the other roof

The soundtrack is a bitcrushed hard-rock **Star Spangled Banner** — distorted saws, power chords, kick and snare, mashed through a 5-bit crusher so it sounds like a burned CD in a Camaro. Mute with **M**. Pause with **P**.

![The commando in khaki muscle shirt, woodland camo, flag armband, and a stars-and-stripes machine gun](/images/blog/freedom-eagle-hero.png)

## Why this one

Airomatic ships tools, and it also ships the games that fall out of a session when the prompt is too particular to ignore. This one is Saturday-morning arcade America: crystal blue morning, gold sunburst, Liberty on the water, a man too large for the roof he is standing on, and a machine gun that only fires in the national colors.

The first cut is one roof, two towers, endless jets. Enough to play tonight.

## Stack

| Piece | Choice |
|-------|--------|
| Runtime | Browser only |
| Rendering | Canvas 2D, painted arcade sprites |
| Logic | Vanilla ES modules — `sim.js` is pure and unit-tested |
| Audio | Procedural Web Audio: bitcrushed rock anthem, laser, fireworks, impacts |
| Host | `public/freedom-eagle/` on airomatic-site → Cloudflare Workers |

No backend. Click **Defend America** and the anthem starts.

## How to fight

- **A / D** or arrows — run the rooftops
- **W / ↑** — jump the girder
- Mouse aim · hold click / **Space** / **J** — red white blue lasers
- Shoot the 747s before they hit the towers
- They come faster. They come thicker. Do not let a tower fall
- **P** pause · **M** mute

Phone: on-screen **◀ ▶ JUMP FIRE**.

## Try it

- **Play:** [/freedom-eagle/](/freedom-eagle/)
- **This write-up:** you’re reading it

If a jet ghosts through a facade, a firework eats the skyline, or the anthem clips on mute, [tell us](/contact/). The roof is still open.

**Previous on the blog** — [Gate Crash](/blog/gate-crash/) · [Fairies Wear Boots](/blog/fairies-wear-boots/).
