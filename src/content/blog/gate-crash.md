---
title: "Gate Crash — a barge, a wrecking ball, the Golden Gate"
description: "We built a Three.js demolition sim with Grok Build: steer a crane barge in the strait, swing a wrecking ball through International Orange steel, and send Teslas into the bay. Faster wreck, higher score. Play free at /gate-crash."
pubDate: 2026-09-01T18:00:00.000Z
ogImage: /images/blog/gate-crash-og.jpg
---

![A rusted crane barge swinging a wrecking ball at the Golden Gate, Teslas on the deck](/images/blog/gate-crash.jpg)

**Play it now:** [airomatic.ai/gate-crash](/gate-crash/)

The brief was specific: a floating barge, a huge wrecking ball, the Golden Gate, Teslas on the span, fire, debris, a clock. So we built **Gate Crash**.

You are on the *Bay Hammer* in the strait. A lattice crane hangs a riveted iron ball over the roadway. International Orange steel is not one mesh — it is deck slabs, tower legs, and braces, each with hit points. Swing hard enough and they crumple, catch fire, and drop into the water. Traffic keeps coming until the asphalt under it is gone.

## What you play

A browser demolition sim (no install, no account):

- **You** steer the barge. The wrecking ball is the weapon.
- The **Golden Gate** is built as many objects: a sectional roadway, Art Deco towers with X-bracing, catenary cables, suspenders
- **Teslas** — sedans and Cybertrucks — keep driving whatever roadway is left. Hit them for combo points. A gap in the span dumps them into the bay on their own
- **Fire and debris** stay after a hit: explosions, sparks, burning sections, steel tumbling into the tide
- Knock a **whole tower** out and that half of the main span peels off in a chain
- The **clock starts on first contact**. Finish when every section is in the water

Score is structure + Teslas + a speed bonus against a three-minute par. Grade S if you are greedy and fast.

## Why this one

Airomatic ships tools, and it also ships the games that fall out of a session when the prompt is too particular to ignore. This one is San Francisco as a physics toy: fog over the headlands, International Orange against teal water, a pendulum you drive like a boat, cars into the tide.

The *Bay Hammer* sits alongside the main span with the boom already over the deck. You do not have to find the bridge. You have to wreck it before the clock eats the bonus.

## How it works

The ball is a pendulum on a distance constraint from the crane tip. Drive the barge and the mass lags, then catches up through the steel. **Space** (or a click) pumps extra speed along the tangent — time it at the bottom of the arc. Reel the cable so the sphere meets a deck slab, a truss, or a tower leg.

Each section is its own collider with hit points. A glancing blow chips and ignites. A full swing one-shots a slab, throws debris, and splash-damages neighbors. Teslas on a dying slab explode and fly. Take every piece of a tower and the span that depended on it comes down in sequence.

No physics engine CDN. Custom integration, buoyancy when wreckage hits the water, procedural wind and impacts.

## Stack

| Piece | Choice |
|-------|--------|
| Runtime | Browser only, ES modules |
| Renderer | Three.js 0.170 |
| Physics | Custom pendulum + debris + buoyancy |
| Audio | Procedural Web Audio — wind, barge thrum, impacts, splash |
| Bridge | Sectional meshes, catenary cables, instanced suspenders |
| Host | `public/gate-crash/` on airomatic-site → Cloudflare Workers |

No backend. Click **Drop the ball** and the foghorn starts. Mute with **M**. Pause with **P**.

## How to wreck

- **W / S** — throttle
- **A / D** — strafe
- **Arrows** — yaw the barge
- **Q / E** — yaw the boom
- **Space** or click — pump the wrecking ball
- **R / F** or wheel — reel the cable in or out
- Right-drag — orbit the camera
- **P** — pause · **M** — mute

Phone: left stick drives, **SWING** / **REEL** / **BOOM** on the right.

The cabin is at the stern. W takes you forward along the span; A/D slides you toward or away from the orange steel.

## Try it

- **Play:** [/gate-crash/](/gate-crash/)
- **This write-up:** you’re reading it

If the ball clips a tower, a Tesla refuses to explode, or the fog eats the Marin Headlands, [tell us](/contact/). The roadway is still open — for now.

**Previous on the blog** — [Fairies Wear Boots](/blog/fairies-wear-boots/) · [老鼠赛跑 / Rat Race](/blog/rat-race/).
