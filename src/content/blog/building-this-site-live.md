---
title: "Building this site live with Grok Build"
description: "How airomatic.ai went from a blank directory to a deployed Astro site — streamed on YouTube."
pubDate: 2026-06-23
youtubeId: c8LH2OFCFVE
---

This post documents the meta-build: using **Grok Build** to create the site you're reading, while streaming the process on YouTube.

## The stack

- **Astro 6** — static site, fast deploys, Markdown blog
- **Cloudflare Workers** — same deploy pattern as [aeromaticdrone.com](https://aeromaticdrone.com)
- **Grok Build** — AI agent that scaffolds files, runs commands, and iterates from natural language

## What we built in session one

1. Project scaffold under `~/projects/airomatic-site`
2. Dark AI-themed design system (purple accent, neural-network schematic background)
3. Pages: Home, Live, Blog, About, Contact
4. Blog collection with these launch posts
5. YouTube embed component for session recaps

## Session recording

Watch **Day 1** — *Starting an AI Company with Grok Build* — embedded above. The [Live](/live/) page always features the current stream or latest VOD via `PUBLIC_YOUTUBE_LIVE_ID` in `.env`.

## Watch next

Subscribe on YouTube for notifications when we go live. Future sessions will cover GitHub setup, Cloudflare custom domain (`airomatic.ai`), Formspree contact form, and the first real AI tool prototype.

Questions or topic ideas? [Send a message](/contact/).