---
title: "Go I Ching: the board is a Book of Changes"
description: "We built an offline browser game of Go with Grok Build: black and white as yin and yang, empty points as the unborn, the finished board read as a hexagram. Traditional Chinese and English."
pubDate: 2026-08-17
---

![Elder Yi at a Go board, a taiji circle and distant mountains behind him](/images/blog/go-i-ching.jpg)

**Play it now:** [airomatic.ai/go-i-ching](/go-i-ching/)

Before a stone is placed, Taiji is undivided. The first stone parts yin from yang — that is not marketing copy. It is the first thing the old man beside the board actually says.

We pointed Grok Build at a quiet idea that is hard to do thinly: **Go (Weiqi) and the I Ching are two faces of one Way.** Black and white are yin and yang. An intersection is a moment of change. Empty points are not unfilled squares; they are the ten thousand things that have not yet become. The board should feel like a living mandala. The companion at its side should read the position in front of you, not recite a pamphlet.

That game is **Go I Ching**.

## What you play

A complete game of Go in the browser. No install, no account, works offline:

- **Rules:** place on intersections, capture by surrounding, no suicide, simple ko
- **Scoring:** Chinese area (living stones + enclosed empty points), 7.5 komi for White
- **Boards:** 9×9 (default, for beginners), 13×13, 19×19
- **Modes:** two players locally, or play Elder Yi (Monte-Carlo on 9×9 and 13×13; a lighter heuristic on 19×19)
- **Table manners:** pass, resign, undo, mark dead stones, save, load, export SGF

The look is ink and wood: paper ground, pine-soot lines, stones with a little shine. There is no audio yet — we left the sound for later and spent the attention on the stones and the hexagrams.

## Why put the Book of Changes on the board

Go already talks about timing, thickness, giving way, space and influence. The I Ching already talks about time, place, yin and yang, After Completion and Before Completion. Glue them together carelessly and you get textbook pop-ups. For the fusion to be real, the master has to **speak from the living position**.

So Elder Yi is not a narrator skin. He watches:

- who is thick, who is thin, which quarter has taken shape
- whether the last act was a capture, an invasion, or tengen
- whether the game is in spring (opening), summer (middle), or autumn (endgame)
- northwest Heaven, northeast Mountain, southwest Earth, southeast Wind, center Taiji

You can press **Ask the Master** at any time. The program reads stone counts, thickness, corners and center, recent captures; it chooses a hexagram (and a second that resonates); then it returns the judgment to **this board**, not to a bookshelf. When the game ends, he reads the whole contest as a pair of figures, and says: winning is one season’s fruit; the change you learned on the board is next year’s seed.

All sixty-four hexagrams live in the **Hexagram Library**. Turn on **Wisdom Mode** and he speaks more often — about liberties, eyes, empty space, and ko. Ko, in his mouth, is the Book of Changes in miniature: a point that may not return until the world around it has changed.

![Portrait of Elder Yi: white beard, indigo robes, trigrams embroidered on the collar](/images/blog/go-i-ching-master.jpg)

## Chinese, or English

The game is Chinese, and so is the book. A toggle stays in the header: **中文 / EN**. Interface, tutorial, hexagram texts, and the master’s speech all follow. The choice is remembered. Chinese is Traditional, so it can sit in the same register as the Zhouyi and as the board’s own words — 圍棋, 停著, 點目.

The article you are reading defaults to Chinese. The control at the top is the other face of the same courtesy.

## How to play the tutorial

In the left panel (on a narrow screen, open **Menu** first) click **Tutorial**. Elder Yi walks seven steps that teach the rules as philosophy:

1. Sit. Weiqi and the Yijing are two faces of one Way.
2. Place the first stone on an **intersection** — not inside a square.
3. Liberties: four in the center, three on the side, two in the corner. When the last breath is taken, the stone is lifted.
4. Capture a white stone that has one liberty left (the red circle breathes).
5. Ko: even a fight must breathe; you may not recapture at once.
6. Area scoring and komi. Empty space you have made safe is as real as a stone.
7. Two passes end the game. Ask him whenever you like.

When the lesson is complete, a 9×9 game begins and you hold Black.

## What we chose

| Piece | Choice |
|-------|--------|
| Runtime | Browser, one folder, offline |
| Board | Canvas, wooden grain |
| Logic | Vanilla JavaScript, no framework |
| Engine | Capture, ko, Chinese area, SGF |
| Elder Yi | Position analysis → 64 hexagrams → bilingual reading |
| Host | `public/go-i-ching/`, same Cloudflare static assets as the other toys on this site |

No backend, no accounts. Records live in `localStorage`. To take a game with you, export SGF.

## What can still grow

Stone-click audio was left blank on purpose. A stronger 19×19 player, Simplified Chinese as a third language, hexagram lines that cling even closer to a single move — the tea is still warm. If a capture is wrong, a ko is misread, or a judgment slides off the position, [tell us](/contact/).

**Previous on the blog** — [Strive Hard](/blog/strive-hard-live/) · [Cybertruck Assembly Line](/blog/cybertruck-assembly-line-live/)

To watch this kind of thing get written in the open, subscribe on [YouTube](https://www.youtube.com/@airomaticAI). A topic to throw across the table: [Contact](/contact/).
