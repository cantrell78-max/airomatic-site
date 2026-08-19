---
title: "Rat Race: attention is finite — don't get pinned at the X"
description: "We built a wet-street cyberpunk overhead game with Grok Build: rats race for a finite pile of pellets at the X, get fatter and slower as they eat, and Sgt. Meowz will seize the stash. Simplified Chinese and English."
pubDate: 2026-08-18
---

![A rain-slick cyberpunk alley: a rat sprints toward a glowing X kiosk while a cop cat stalks the dumpsters](/images/blog/rat-race.jpg)

**Play it now:** [airomatic.ai/rat-race](/rat-race/)

Attention on X is finite. Everyone piles onto the same button, grabs heat, then bolts before enforcement arrives — that is not a metaphor pasted on afterward. It is the rule set.

We pointed Grok Build at a joke that is not small: **make the social-media rat race an actual rat race.** Overhead cyberpunk alley, wet asphalt, neon Chinese, a handful of collared rats charging a kiosk shaped like an X. The pellets run out. Among those who ate, the fattest cheeks win. Stay too long and the cat in the uniform comes.

That game is **Rat Race**.

## What you play

An angled top-down 2.5D game in the browser. No install, no account:

- **Goal:** reach the **X-FEED** at the north end of the block and hold Space (or E) to eat gold pellets
- **Clock:** the machine holds a finite pile. You can watch it shrink. When it is empty, the rat with the most pellets wins
- **Fat:** eating makes you rounder and slower. Skinny rats fit one-tile alleys and outrun the cop; stuffed rats do not
- **The cat:** Sgt. Meowz patrols. Noise at the X draws him. Get tagged and you spill pellets; anyone can steal them
- **Cover:** dumpsters, CRT stacks, fridges, boxes, barrels. Hide on the **far side** from the cat
- **Rivals:** Vex (cautious), Noodle (greedy), Pivot (scavenger) — three AI rats after the same pile of attention

The look is 16-bit pixel, rain, neon. The wall signs are real Chinese: 鼠, 内卷, 关注, 投喂, 赛跑, 老鼠. The junk you hide behind is branded like dumped startups — FLEETFIX dumpsters, FRYSK televisions, DRAFX fridges, PIVOT boxes, COLDSTART drums.

## Why an X, why rats

Posting is a run at the same machine: a limited pile you can see diminishing, a button you cannot camp, other rats who are greedier, more cautious, or better at picking up what you drop when enforcement lands.

So the pellets are not garnish. They are the timer. The cat is not a random mob. He is the cost of lingering on the button. Fat is not a costume. It is speed and collision.

## Chinese, or English

The game defaults to **Simplified Chinese**. Title, buttons, status, results, hints all follow. A toggle sits on the title screen and in the HUD: **ENGLISH / 中文**. The choice is remembered.

Pixel fonts cannot draw the characters, so the Chinese UI switches to ZCOOL KuaiLe and Noto Sans SC — otherwise 「投币开始」 would be tofu. English keeps the arcade bitmap face.

The article you are reading defaults to Chinese. The control at the top is the other face of the same courtesy.

## How to run

- **WASD** or arrows to move (camera-relative)
- **Shift** to dash
- Hold **Space** / **E** at the X to eat
- **P** to pause
- Phone: stick on the left, dash and feed on the right

Outrun the cat while you are still skinny, tuck behind junk, go back when he leaves. Gorge until you cannot move and you are already dinner. After the X empties, floor pellets still count — we later stopped ones wedged in walls from stalling the match.

## What we chose

| Piece | Choice |
|-------|--------|
| Runtime | Browser, Three.js orthographic 2.5D |
| Look | Pixel billboard sprites, brick, wet asphalt |
| Logic | Vanilla ES modules, no framework, no backend |
| Rivals | A*, hide, loot, unstick if they freeze |
| Language | Simplified Chinese default, English toggle, localStorage |
| Host | `public/rat-race/`, same Cloudflare static assets as the other toys on this site |

No accounts. Audio is procedural rain and bass. Tap once so sound can start.

## What can still grow

An on-screen pause for phones, tighter touch capture, a four-way walk for Sgt. Meowz — the rain has not stopped. If a rat wedges behind a fridge again, or a pellet refuses to end the round, [tell us](/contact/).

**Previous on the blog** — [Go I Ching](/blog/go-i-ching/) · [Strive Hard](/blog/strive-hard-live/)

To watch this kind of thing get written in the open, subscribe on [YouTube](https://www.youtube.com/@airomaticAI). A topic to throw across the table: [Contact](/contact/).
