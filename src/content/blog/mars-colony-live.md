---
title: "Building Mars-Colony Live with Grok Build"
description: "Live session: Mars-Colony — a satirical but technically serious Mars colonization simulator with Streamlit Mission Control, life support, robots, crew, and crisis events."
pubDate: 2026-07-08
youtubeId: KRNjt5EFqOA
---

After [KaTeX math publishing](/blog/math-publishing-demo-live/) on airomatic.ai, we pointed Grok Build at something more red-planet: **Mars-Colony** — a satirical but technically serious simulation and planning tool for colonizing Mars.

Tone-wise, think *The Martian* problem-solving, *Project Hail Mary* systems thinking, and *The Hitchhiker’s Guide to the Galaxy* footnotes. Engineering vocabulary stays real; the mission log is allowed to joke.

## What is Mars-Colony?

**Mars-Colony** is a modular Python app where you run a foothold outpost over **sols** (Martian days). Each step advances the colony: resources burn and regenerate, robots work and charge, habitat integrity drifts, crew morale moves, and random crises show up uninvited.

Phase 1 systems include:

- **Colony overview & mission planning** — name, crew size, difficulty, RNG seed, target sols
- **Habitat & infrastructure** — pressurized modules, integrity, solar efficiency, power budget
- **Life support & resources** — oxygen, water (recycling), food, energy
- **Robot & automation fleet** — surveyors, builders, haulers, maintainers
- **Crew / colonists** — roles, health, morale, overcrowding
- **Event & crisis system** — dust storms, equipment failures, supply delays, ice finds, solar flares, and the occasional ration-bar birthday

The interactive surface is **Streamlit Mission Control**: KPIs, resource charts, tabs for each subsystem, and a mission log full of useful warnings dressed as dry humor.

## Why this project?

Airomatic ships practical AI-adjacent software in public. Mars-Colony is a full product-shaped sandbox:

- Clean modular architecture (systems, models, simulation engine, UI)
- A real time loop you can step and observe
- Room to grow — player decisions, Grok-generated event narratives, and illustrated crisis stills via image APIs

It’s also a great live-coding target: you can scaffold structure, wire a sim tick, then watch dust storms wreck your solar arrays in the same session.

## Stack

| Piece | Choice |
|-------|--------|
| Language | Python |
| UI | Streamlit (Mission Control dashboard) |
| Charts | Plotly |
| Sim unit | 1 sol ≈ 1 Martian day (~24.66 Earth hours) |
| Agent | Grok Build |

**Why Streamlit over Gradio?** Multi-panel ops dashboards, session state, and time-series charts are first-class — closer to Mission Control than a single model-demo form.

## How to run it (locally)

```bash
cd Mars-Colony
source .venv/bin/activate   # or: uv venv && uv pip install -r requirements.txt
streamlit run mars_colony/ui/app.py
```

Open the local URL (usually `http://localhost:8501`). Use the sidebar to launch a mission, advance sols, and read the log.

Headless demo:

```bash
python -m mars_colony --cli --sols 30 --difficulty nominal
```

## Watch the stream

The live session is embedded above — follow along as we scaffold the project, implement Phase 1 systems, and run the colony for the first time.

**Live page** — always-on embed of the current featured stream: [Watch live](/live/).

**Previous episode** — [KaTeX math publishing demo](/blog/math-publishing-demo-live/) ([YouTube](https://youtu.be/u7SX0SGZ6XI)).

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI) for notifications when we go live. Questions or topic ideas? [Send a message](/contact/).
