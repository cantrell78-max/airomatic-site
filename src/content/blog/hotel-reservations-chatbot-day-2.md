---
title: "Building a Hotel Reservations AI Chatbot Live with Grok Build – Day 2"
description: "Day 2 of build-in-public: a smart hotel reservations chatbot with customer and front-desk modes, SQLite, and a role-aware Grok agent."
pubDate: 2026-06-29
youtubeId: IC-6fu6cgG0
---

Day 1 was the meta-build — scaffolding [airomatic.ai](/) itself with Grok Build while streaming on YouTube. **Day 2** is the first real product: a **hotel reservations AI chatbot** powered by the Grok API.

## What we're building

This is Airomatic's first practical AI tool — not a demo site, but software a hotel could actually use:

- **Customer booking interface** — guests ask about availability, rates, and reservations in natural language
- **Front Desk staff mode** — elevated privileges for staff (override bookings, look up guests, handle edge cases)
- **SQLite backend** — lightweight persistence, no cloud database required for local dev
- **Role-aware AI agent** — Grok behaves differently depending on who's talking: guest vs. staff

All of it runs **locally in WSL on a basic laptop**. No fancy hardware — just Grok Build, a terminal, and step-by-step iteration.

## Why a hotel chatbot?

Hotels still juggle phone calls, booking portals, and front-desk software that don't talk to each other. A single conversational interface — with the right guardrails for staff vs. guests — is a concrete, shippable first product for Airomatic.

## Watch the stream

The session is embedded above. Follow along as we wire up the booking flow, staff privileges, and Grok integration from scratch.

**Previous episode** — [Day 1: building this site live](/blog/building-this-site-live/) ([YouTube](https://youtu.be/c8LH2OFCFVE)).

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI) for notifications when we go live. Questions or topic ideas? [Send a message](/contact/).