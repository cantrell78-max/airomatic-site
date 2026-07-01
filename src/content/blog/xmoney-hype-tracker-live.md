---
title: "Building an xMoney Hype Tracker Live with Grok Build"
description: "Live session: a Gradio dashboard that tracks xMoney rollout hype on X — sentiment, trending posts, charts, and a Grok-powered Hype Score."
pubDate: 2026-07-01
youtubeId: Rr-T0IIi3bs
---

After the [hotel reservations chatbot](/blog/hotel-reservations-chatbot-day-2/), we're shipping another real Airomatic tool — this time tuned to the moment: **xmoney-hype-tracker**, a live dashboard that measures how the **xMoney rollout** is landing on X.

## What we're building

A Python app with a clean **Gradio** dashboard that pulls signal from social chatter and turns it into something you can actually read at a glance:

- **X post ingestion** — recent posts mentioning "xMoney" or "x money"
- **Grok analysis** — OpenAI-compatible client summarizes themes and rollout status
- **Sentiment breakdown** — positive, negative, and hype buckets
- **Plotly charts** — mentions over time and sentiment mix
- **Hype Score (0–100)** — volume and engagement rolled into one number
- **AI summary** — short rollout insights updated as new posts arrive

All built live in WSL with **Grok Build** — same stack as our other sessions: terminal, iteration, deploy when it's ready.

## Why this project?

Rollout hype moves fast on X. A single dashboard that quantifies volume, tone, and momentum is a practical slice of what Airomatic does: **turn noisy feeds into usable software**.

## Watch the stream

The session is embedded above. Follow along as we scaffold `xmoney-hype-tracker`, wire the Grok API, and stand up the Gradio UI from scratch.

**Previous episode** — [Hotel reservations chatbot, Day 2](/blog/hotel-reservations-chatbot-day-2/) ([YouTube](https://youtu.be/IC-6fu6cgG0)).

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI) for notifications when we go live. Questions or topic ideas? [Send a message](/contact/).