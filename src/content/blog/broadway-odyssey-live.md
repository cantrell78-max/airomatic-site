---
title: "Broadway Odyssey, The Musical — a Grok Imagine contest film, cut in Grok Build"
description: "How we made a 3-minute gender-swapped Sirens number for the Grok Imagine × Homer’s Odyssey contest — stills, Imagine voices, and an FFmpeg concat. No Premiere."
pubDate: 2026-08-18
tweetId: "2089865032016482479"
ogImage: /images/blog/broadway-odyssey-og.jpg
---

![Jazz-hands finale: CEO Odysseus points off the bow while the crew throws their arms up at sunset](/images/blog/broadway-odyssey.jpg)

The film is embedded above — that’s the [quote-tweet submission](https://x.com/AiromaticAI/status/2089865032016482479) on X. Watch it there if the embed is shy.

NOW ON THE WINE-DARK SEA  
**BROADWAY ODYSSEY, THE MUSICAL**

Odysseus is the boss babe of the ship.  
The Sirens are fabulous gay men.  
As tempting as they are, she needs them like a fish needs a bicycle.

This is the live-build log: what the contest is, what we shot, and how Grok Build plus a concat list replaced a video editor.

## The contest

On August 17, 2026, [@grok](https://x.com/grok) asked for a scene from Homer’s *Odyssey* that shows what [Grok Imagine](https://x.com/imagine) can do with **video, image, and voice**. Top three films take **\$100K / \$50K / \$25K**.

Announcement: [x.com/grok/status/2089443401695470006](https://x.com/grok/status/2089443401695470006). Rules: [legal.x.com/en/odyssey-contest-terms.html](https://legal.x.com/en/odyssey-contest-terms.html).

A qualifying entry has to be:

- **3–5 minutes**
- **≥1 minute of English dialogue** (sung counts)
- A **coherent stylized scene from *The Odyssey***
- **Grok Imagine** for picture *and* character voices
- Other tools OK for **editing, music, SFX**
- Posted as a **quote** of that announcement
- Follow [@grok](https://x.com/grok) and [@imagine](https://x.com/imagine)
- **U.S., 18+**
- In by **August 31, 2026, 11:59 p.m. PT**

Judges look at adherence, creativity, originality, and **Verified Premium Home Timeline impressions**. No celebrity likenesses, no copyrighted songs, no brand logos, no explicit content. The official tip is the workflow we used: write the scene, lock the dialogue, break it into shots, prompt Imagine, then make the cut.

## The scene: Book XII, opening night

Most entries will look like bronze-age prestige TV. We went opening night.

*Broadway Odyssey, The Musical* is the **Sirens episode** as a camp fashion-musical:

- **Odysseus** — short-haired, androgynous CEO-captain in a charcoal pantsuit, one foot on the rail
- **The crew** — Gen Z chorus line in startup clothes (turtleneck + mini, red cardigan, camel wrap, trench) doing TikTok choreography on a *classical Greek galley*
- **The Sirens** — sequined men on a Mediterranean beach, selling the perfect day
- **The rowers** — tech bros in hoodies who actually pull the oars and never get a close-up

The ship is Homeric. The wardrobe is a board meeting. We kept the Odyssey machinery: Circe’s warning, wax, the captain bound to the mast so she can hear every note and still not go ashore. Then the galley leaves the cove.

Runtime of the submitted cut: **3:04**, 1280×720, 24 fps, well over a minute of Imagine voices.

## Why Grok Build

We started in the Imagine web UI — that’s where the character bible and the first two 15-second clips (title card + bow anthem) came from. Those two shots are still in the film.

The rest is a production, not a chat. **Grok Build** (Grok 4.6) held the bible, wrote lyrics in 6–12 second phrases, seeded every new still from the same faces, called Imagine, and stitched the result.

Imagine here is four tools, not a REST client we had to wire:

| Tool | Job on this film |
|---|---|
| **image_gen** | New faces with no reference: three Sirens (navy sequins, copper jacket, iridescent pearl) and the empty cove |
| **image_edit** | Recurring faces. Attach 1–3 refs (the cap is **three** images) and change only the moment: same Odysseus, now on the mast; same Callie and Rhea, now with hoodie rowers |
| **image_to_video** | Coverage, no speech. **6 or 10 seconds**, always **720p** so it matched the existing clips |
| **reference_to_video** | Dialogue and showtunes. Up to **15 seconds**, up to three Imagine voices. Prompt tags `<IMAGE_0>` and `<AUDIO_0>` |

**Voices we shipped**

- **eve** — Odysseus’s Circe briefing (the one solo captain vocal that cleared)
- **ara** — crew numbers, the duet, the mast lament, the jazz-hands finale
- **leo** — the Sirens

Two production rules paid rent:

1. **Still first.** Imagine animates frame one. A frozen lineup becomes a pan across a frozen lineup. A still that’s already mid-belt, jazz hands, and oars mid-stroke has somewhere to go.
2. **Don’t animate seven named faces in one take.** Identity drifts. Cover like a musical: wides for geography, 2-shots for handoffs, close-ups for vocals.

Imagine’s video rate limit is **two jobs at a time**. After that, wait.

Solo Odysseus close-ups with a sung or spoken belt were the flakiest path. The same woman in a **company number**, with **ara** carrying the lyric, cleared. So the captain *looks* like she’s belting, and the chorus *is* belting. Broadway already works that way. If a prompt came back `content-moderated`, we changed the *shot* instead of paraphrasing the same ask.

![Callie and Rhea belt a showtune while hoodie tech bros row on both rails](/images/blog/broadway-odyssey-rowers.jpg)

## A shot, start to finish

The hoodie-rower number — “the boys row hard — that’s the plan”:

1. Lock faces in the character bible (gray-studio stills).
2. `image_edit` them onto the galley, mouths open, choreography already posed.
3. Edit again: men in dark hoodies on both rails, oars mid-stroke, background labor, no hero light.
4. `reference_to_video`, 10 seconds, 720p, voice `ara`, lyrics in the prompt as a showtune.
5. Keep the clip only if it’s the same 1280×720 / 24 fps / H.264 / AAC 48 kHz as everything else. That lock is what makes the no-editor cut possible.

![Vesper and Aurelio, sequined Sirens on the cove, galley offshore](/images/blog/broadway-odyssey-sirens.jpg)

## The cut: FFmpeg, not Premiere

The contest allows other tools for editing. We never opened a timeline. The NLE is a text file.

This box didn’t even have FFmpeg. We dropped a static build (John Van Sickle’s amd64 binary) in `~/.local/bin`. Any ffmpeg that can concat works.

**1. Strip Imagine’s extra poster stream.** Each MP4 carries a JPEG as a third stream. Concat chokes on it.

```bash
ffmpeg -y -i shot.mp4 -map 0:v:0 -map 0:a:0 -c copy stripped/shot.mp4
```

`-c copy` means **no re-encode**. Picture and sound stay bit-for-bit.

**2. Write a concat list** — one shot per line, cut order:

```text
file '/path/to/stripped/T01.mp4'
file '/path/to/stripped/A00v2.mp4'
file '/path/to/stripped/B01.mp4'
file '/path/to/stripped/B02v2.mp4'
```

Ours runs title → company number → Circe briefing → crew showtune → Lin/Sabine paycheck number → wax → mast bind with rowers → original bow anthem → Odysseus/Callie duet → cove → Sirens sequence → mast lament → leave the island → jazz-hands finale. Nineteen shots.

**3. Splice the packets:**

```bash
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy BROADWAY_ODYSSEY.mp4
```

If every input is the same size, frame rate, and audio format, that join is just splicing. Hard cuts, not crossfades — a crossfade would force a re-encode, and a musical made of 6–15 second lyric phrases *wants* a hard cut on the line.

That’s the whole “we didn’t use a video editor” trick. Direct in Imagine. Assemble in a list.

## What we’d do again

- Bible before footage. The pixie, the suit, and the unsmiling face were locked before she sailed.
- Homeric plot, camp clothes. The mast is the screenshot. The minis are why people quote the post.
- Lyrics as shot lengths. If it doesn’t fit in ten seconds, it isn’t a line yet.
- More cuts, fewer 10-second horizon stares. v1 had too many. v2 replaced them with dancing, rowing, and company vocals.
- FFmpeg concat as the editor. Once the format is locked, the cut is a playlist.

## What we wouldn’t

- Animate the entire deck as one take and hope faces hold.
- Spend Imagine jobs retrying a prompt that already came back moderated.
- Fire five videos in parallel. The cap is two.
- Leave “cake of beeswax” in a prompt. Imagine will bake a cake.

## Watch / enter

- **The film (this entry):** [x.com/AiromaticAI/status/2089865032016482479](https://x.com/AiromaticAI/status/2089865032016482479)
- **Contest announcement:** [x.com/grok/status/2089443401695470006](https://x.com/grok/status/2089443401695470006)
- **Terms:** [legal.x.com/en/odyssey-contest-terms.html](https://legal.x.com/en/odyssey-contest-terms.html)

She hears every note. She does not get off the boat.

**Previous on the blog** — [Agentic desk Aug 14](/blog/agentic-desk-2026-08-14/) · [Strive Hard](/blog/strive-hard-live/).

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI) for live sessions. Questions? [Contact](/contact/).
