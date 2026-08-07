/**
 * Story scenes — choose-your-own-adventure nodes.
 *
 * Scene shape:
 * {
 *   id, title, locationId,
 *   text: string | (state) => string,
 *   choices: [{
 *     text, hint?,
 *     require?: (state) => bool | string reason,
 *     cost?: { cash?, energy? },
 *     effects?: { followers?, cash?, clout?, engagement?, day?, flags?, ... },
 *     post?: { text, likes?, reposts? },  // auto X post
 *     messages?: [{ npcId, text, unlock? }],
 *     next: string | null  // scene id; null = free roam at location
 *   }]
 * }
 */

function isMale(state) {
  return state.character?.gender === "male";
}

export const SCENES = {
  // ─── Opening arc ───────────────────────────────────────────
  intro: {
    id: "intro",
    title: "Day Zero: Blank Account Energy",
    locationId: "tenderloin",
    text: (s) =>
      `You wake up on a mattress that cost less than a single OpenAI API call.\n\n` +
      `Outside: the Tenderloin symphony — sirens, someone arguing with a parking meter, a guy selling \"authentic\" AirPods out of a backpack.\n\n` +
      `On your nightstand: a phone with 4% battery, a half-eaten protein bar (actually your roommate's), and a sticky note that says **SHIP OR DIE** in your own handwriting.\n\n` +
      `Your X account — @${s.character.handle} — has **0 followers**. Not even your mom. (She has a Facebook.)\n\n` +
      `Welcome to San Francisco, ${s.character.name}. Time to strive hard.`,
    choices: [
      {
        text: "Open X and post a raw founder selfie from the mattress.",
        hint: "Authenticity is a growth hack. Allegedly.",
        effects: { followers: 12, engagement: 8, clout: 2, flags: { firstPost: true } },
        post: {
          text: "day 1 in the TL 💪 no cofounder no code no shame. building in public. who else is up grinding?? #buildinpublic",
          likes: 3,
          reposts: 0,
        },
        next: "intro_after_post",
      },
      {
        text: "Ignore the phone. Do pushups. Become the product.",
        hint: "Discipline. Or denial. Fine line.",
        effects: { clout: 1, hustle: 1 },
        next: "intro_pushups",
      },
      {
        text: "Check the fridge. Inventory assets.",
        hint: "Hot sauce, expired oat milk, ambition.",
        effects: { cash: -0 },
        next: "intro_fridge",
      },
    ],
  },

  intro_after_post: {
    id: "intro_after_post",
    title: "Engagement: Mid",
    locationId: "tenderloin",
    text:
      `Three likes. One is a bot named CryptoWolf_420. One is your roommate (he wants rent). One is a guy in Lisbon who replies \"gm.\"\n\n` +
      `Still. The algorithm tasted blood. Your hands are shaking with either caffeine or destiny.\n\n` +
      `A notification pings — not X. **Texts.**`,
    choices: [
      {
        text: "Check your texts (use the phone → Messages).",
        hint: "Or keep reading — the plot thickens either way.",
        effects: {},
        messages: [
          {
            npcId: "roommate",
            text: "saw your post king. if this goes viral can you Venmo the wifi bill",
          },
        ],
        next: "intro_plan",
      },
    ],
  },

  intro_pushups: {
    id: "intro_pushups",
    title: "Reps for Equity",
    locationId: "tenderloin",
    text:
      `You knock out twenty ugly pushups. The floor is sticky. You tell yourself that's grit.\n\n` +
      `In the mirror (cracked, thrifted, honest) you practice your Demo Day face: half smile, dead eyes, \"we're pre-revenue but post-narrative.\"\n\n` +
      `Your phone buzzes. The grind never sleeps. Neither does spam.`,
    choices: [
      {
        text: "Alright. Time to plan the empire.",
        next: "intro_plan",
      },
    ],
  },

  intro_fridge: {
    id: "intro_fridge",
    title: "Due Diligence: Kitchen",
    locationId: "tenderloin",
    text:
      `Assets:\n` +
      `• 1 jar of gochujang (identity)\n` +
      `• Half a Red Bull (liquidity)\n` +
      `• Someone else's leftover pad thai (risk)\n` +
      `• A bottle of champagne from a networking event you crashed (runway)\n\n` +
      `Liabilities: rent, ego, the pad thai.\n\n` +
      `You sip the Red Bull. Business school never taught this.`,
    choices: [
      {
        text: "Fuel acquired. Open the day.",
        effects: { cash: 0 },
        next: "intro_plan",
      },
    ],
  },

  intro_plan: {
    id: "intro_plan",
    title: "The Blank Map",
    locationId: "tenderloin",
    text:
      `Here's the game, founder:\n\n` +
      `Your **scoreboard is X** — followers, engagement, the dopamine that VCs mistake for traction.\n\n` +
      `Your **weapon is the iHype** (yes, that's a Pear product). Open the **Map** to roam the Bay. Check **Texts** when love, lust, or limited partners slide in. Swipe **FlareUp** when loneliness looks like a growth channel. Post **Selfies** when the vibes demand content.\n\n` +
      `Start small. Vibe Code Café. The illegal-neon **Corgi Café**. A hackathon. Eventually: Startup School, Stanford, a certain VC's sauna, and a yacht that is absolutely not a metaphor.\n\n` +
      `You have $47 and a face for… something.`,
    choices: [
      {
        text: "Hit Vibe Code Café — caffeine is a strategy.",
        effects: { locationId: "vibe-cafe" },
        next: "vibe_arrive",
      },
      {
        text: "Enter Corgi Café. Ignore the medical warnings.",
        hint: "Brand. Merch. Mild neurological events.",
        effects: { locationId: "corgi-cafe" },
        next: "corgi_arrive",
      },
      {
        text: "Walk into a hackathon like you own the WiFi.",
        effects: { locationId: "hackathon" },
        next: "hack_arrive",
      },
      {
        text: "Open FlareUp. Touch grass (metaphorically).",
        openApp: "flareup",
        next: "home_hub",
      },
      {
        text: "Stay home. \"Polish the deck.\" (Scroll X.)",
        effects: { day: 0 },
        next: "home_scroll",
      },
    ],
  },

  // ─── Home free roam ────────────────────────────────────────
  home_hub: {
    id: "home_hub",
    title: "Studio HQ",
    locationId: "tenderloin",
    text: (s) => {
      const flare = s.flareup?.matches?.length
        ? `\n\nFlareUp: **${s.flareup.matches.length}** match(es). Your dating life has product-market fit (barely).`
        : `\n\nYour iHype has a new app: **FlareUp** — SF dating, but the swipe is a pitch.`;
      const corgi = s.flags.survivedCorgiCafe
        ? `\n\nYou still see orange spots when you blink. Corgi Café did that.`
        : `\n\nThere's a neon dog on the Map you've been avoiding: **Corgi Café**.`;
      let side = "";
      if (s.flags.metDylan && !s.flags.visitedDylan) {
        side += `\n\n**Map pin:** Ketamine Dealer (Oakland). Dylan the fox texted. The plushies are waiting.`;
      } else if (s.flags.mkultraDisorder) {
        side += `\n\nMrs. Which still narrates your shower thoughts. MKUltra Programming Disorder: unmanaged.`;
      }
      if (s.flags.alienContact && !s.flags.enteredPalantir) {
        side += `\n\n**Map pin:** Palantir HQ (Marin Bunker). Karp texted. The drones have taste now.`;
      } else if (s.flags.hasDirtyUsb) {
        side += `\n\nA USB in your sock drawer could topple three cap tables. Or get you disappeared.`;
      }
      if (s.flags.raisedSeed && !s.flags.clawAccount) {
        side += `\n\n**Map pin:** Mercury HQ — your seed is still in "vibes checking." Park the wire before Soft HQ burns it.`;
      } else if (s.flags.clawAccount && !s.flags.hqLeased) {
        side += `\n\n**Mercury:** treasury green. **Map:** SoMa Soft HQ — spend like a company toward **The Round**.`;
      } else if (s.flags.raisedSeed && !s.flags.hqLeased) {
        side += `\n\n**Map pin:** SoMa Soft HQ — spend the seed before it spends you. Path toward **The Round**.`;
      } else if (s.flags.theRoundUnlocked && !s.flags.theRoundStarted) {
        side += `\n\n**The Round** is unlocked — Series A theater waits at Soft HQ or via the choice below.`;
      } else if (s.flags.theRoundStarted) {
        side += `\n\nYou're mid-**Round**. LPs are circling. The glass box is both HQ and cage.`;
      }
      return (
        `Back in the box you call an apartment. Day ${s.day}. ` +
        `@${s.character.handle} sits at ${s.followers} followers` +
        (s.flags.raisedSeed ? ` with **$${s.cash.toLocaleString()}** in the war chest` : "") +
        `.\n\n` +
        `The roommate is doing yoga on a stolen yoga mat while on a "strategy call."` +
        flare +
        corgi +
        side +
        `\n\nWhat now? (Use the Map / FlareUp on your phone, or pick a move.)`
      );
    },
    choices: [
      {
        text: "Post a \"still grinding\" selfie from the mattress empire.",
        effects: { followers: 8, engagement: 3 },
        post: {
          text: "still here. still broke. still inevitable. the market will clear 🧠",
          likes: 5,
          reposts: 1,
        },
        next: "home_hub",
      },
      {
        text: "Open FlareUp and touch grass (figuratively).",
        hint: "Dating app on the iHype →",
        openApp: "flareup",
        next: "home_hub",
      },
      {
        text: "Park seed at Mercury HQ (startup banking theater).",
        require: (st) =>
          st.flags.raisedSeed ? true : "Raise a seed on the yacht first",
        effects: { locationId: "mercury-hq" },
        next: "claw_arrive",
      },
      {
        text: "Head to SoMa Soft HQ (seed spend / company cosplay).",
        require: (st) =>
          st.flags.raisedSeed ? true : "Raise a seed on the yacht first",
        effects: { locationId: "soft-hq" },
        next: "hq_arrive",
      },
      {
        text: "Enter The Round (Series A chapter).",
        require: (st) =>
          st.flags.theRoundUnlocked
            ? true
            : "Open Soft HQ and burn some seed first",
        next: "round_open",
      },
      {
        text: "Doomscroll founder drama instead of healing.",
        next: "home_scroll",
      },
      {
        text: "Sleep. Let the markets cook overnight.",
        hint: "Advances to next day.",
        effects: { day: 1, cash: -5 },
        next: "new_day",
      },
      {
        text: "Call it — open the Map and go somewhere.",
        hint: "Use the iHype Map app →",
        next: null,
      },
    ],
  },

  home_scroll: {
    id: "home_scroll",
    title: "Doomscroll, Founder Edition",
    locationId: "tenderloin",
    text:
      `You scroll. Someone raised $40M for \"AI-native toothbrushes.\" Someone else is live-tweeting their breakup as a \"personal pivot.\"\n\n` +
      `A quote-tweet of a VC saying \"we're looking for technical founders who can also be fun at dinner\" gets 12k likes.\n\n` +
      `You feel inspired and slightly ill. Perfect founder state.`,
    choices: [
      {
        text: "Rage-post a hot take about AI toothbrushes.",
        effects: { followers: 25, engagement: 12, clout: 3 },
        post: {
          text: "hot take: if your Series A is for a toothbrush you're not a founder you're a dentist with a pitch deck",
          likes: 40,
          reposts: 12,
        },
        next: "home_hub",
      },
      {
        text: "Close the app. Touch grass (the sidewalk counts).",
        next: "home_hub",
      },
    ],
  },

  new_day: {
    id: "new_day",
    title: "Another Day, Another Dilution",
    locationId: "tenderloin",
    text: (s) => {
      let extra = "";
      if (s.day === 2) {
        extra =
          "\n\n**Unlock:** Y Combinator Startup School and Stanford appear on your Map. The algorithm of destiny expands.";
      }
      if (s.day === 3) {
        extra =
          "\n\n**Unlock:** Rumors of Garry Chan's sauna. Your iHype buzzes with humidity.";
      }
      if (s.day >= 4) {
        extra =
          "\n\n**Unlock:** The SUS Yacht afterparty is on someone's calendar. Not yours. Yet.";
      }
      if (s.flags.survivedCorgiCafe && s.day >= 2) {
        extra +=
          "\n\n**Side effect:** You dreamt in Corgi orange. A plush dog asked for your TAM.";
      }
      if ((s.flareup?.matches?.length || 0) > 0) {
        extra +=
          "\n\n**FlareUp:** Someone liked you back. That's either love or a growth hack.";
      }
      if (s.flags.metDylan && !s.flags.visitedDylan) {
        extra +=
          "\n\n**Unlock waiting:** Ketamine Dealer on the Map — Oakland, onesies, jars.";
      }
      if (s.flags.alienContact && !s.flags.enteredPalantir) {
        extra +=
          "\n\n**Unlock waiting:** Palantir Marin bunker. Bring the part of you that almost remembers.";
      }
      if (s.flags.purposeForgot) {
        extra +=
          "\n\n**Hangover:** You had a purpose. It was profound. It is gone. Classic.";
      }
      if (s.flags.raisedSeed && !s.flags.clawAccount) {
        extra +=
          "\n\n**Treasury anxiety:** Seed is still in civilian checking. Mercury HQ is on the Map — park it.";
      } else if (s.flags.raisedSeed && !s.flags.hqLeased) {
        extra +=
          "\n\n**Seed anxiety:** Money wants a glass box. SoMa Soft HQ is waiting.";
      }
      if (s.flags.clawAccount && s.flags.clawYield) {
        extra +=
          "\n\n**Mercury push:** yield-theater notification — take +$40 if you believe the partner-bank poetry.";
      }
      if (s.flags.theRoundUnlocked && !s.flags.theRoundStarted) {
        extra +=
          "\n\n**The Round** is unlocked. Series A doesn't schedule itself (Avery would disagree).";
      }
      return (
        `You sleep four hours and call it recovery.\n\n` +
        `Morning light filters through blinds that have never been cleaned. Day **${s.day}**. ` +
        `Followers: **${s.followers}**. Cash: **$${s.cash}**.` +
        extra
      );
    },
    choices: [
      {
        text: "Seize the day (or at least seize a free bagel).",
        next: "home_hub",
        effects: { flags: { dayRolled: true } },
      },
      {
        text: "Collect Mercury's $40 \"yield theater\" and seize the day.",
        require: (st) =>
          st.flags.clawAccount && st.flags.clawYield
            ? true
            : "Enable Mercury yield upsell first (or open Mercury)",
        effects: { cash: 40, flags: { dayRolled: true } },
        next: "home_hub",
      },
    ],
  },

  // ─── Vibe Code Café ────────────────────────────────────────
  vibe_arrive: {
    id: "vibe_arrive",
    title: "Vibe Code Café",
    locationId: "vibe-cafe",
    text:
      `The café smells like burnt espresso and Series Seed anxiety.\n\n` +
      `Every table has a MacBook with a sticker collage: rainbow pride, YC, a banned Hacker News meme, and \"I ❤️ Kubernetes\" (lie).\n\n` +
      `A whiteboard by the restroom says **TODAY'S VIBES: SHIP / HYDRATE / DON'T PIVOT AT LUNCH**.\n\n` +
      `You spot an empty outlet. In SF, that's like finding product-market fit.`,
    choices: [
      {
        text: "Claim the outlet. Start \"vibe coding\" an AI wrapper.",
        hint: "Call it StriveGPT. Or don't.",
        effects: { clout: 2, engagement: 5, flags: { hasMVP: true } },
        post: {
          text: "just vibe-coded an MVP at the café. no sleep. no plan. pure flow state ☕ who wants beta access?",
          likes: 15,
          reposts: 2,
        },
        next: "vibe_mvp",
      },
      {
        text: "Network. Interrupt a table of founders mid-jargon.",
        effects: { clout: 3, shameless: 1 },
        next: "vibe_network",
      },
      {
        text: "Buy the cheapest coffee. Observe the wildlife.",
        cost: { cash: 6 },
        effects: { cash: -6 },
        next: "vibe_observe",
      },
    ],
  },

  vibe_mvp: {
    id: "vibe_mvp",
    title: "Ship Happens",
    locationId: "vibe-cafe",
    text:
      `Four hours later you have a landing page that says **\"AI that gets you\"** and a waitlist of 3 emails (two are yours, one is a typo).\n\n` +
      `A woman with immaculate highlights — **Skylar**, 40k followers, profession: \"ecosystem\" — glances at your screen.\n\n` +
      `"Cute wrapper," she says. "Needs a story. And a better domain. And maybe a shower."`,
    choices: [
      {
        text: "\"Want to cofound? I'll do product, you do… existing.\"",
        hint: "Bold. Possibly dumb.",
        effects: { clout: 2, flags: { metSkylar: true } },
        messages: [
          {
            npcId: "skylar",
            text: "ok that was either brave or unhinged. I'm Skylar. text me if your waitlist hits 100. or if you shower.",
            unlock: true,
          },
        ],
        next: "vibe_hub",
      },
      {
        text: "Laugh it off. Ask for a warm intro instead.",
        effects: { clout: 1, flags: { metSkylar: true } },
        messages: [
          {
            npcId: "skylar",
            text: "warm intro to whom? my florist? fine — prove you can post consistently for a week and I'll think about it.",
            unlock: true,
          },
        ],
        next: "vibe_hub",
      },
      {
        text: "Defensive rant about technical moats.",
        effects: { followers: 5, clout: -1 },
        post: {
          text: "unpopular opinion: if you need a \"story\" your product is mid. ship code not vibes.",
          likes: 8,
          reposts: 3,
        },
        next: "vibe_hub",
      },
    ],
  },

  vibe_network: {
    id: "vibe_network",
    title: "Jargon Wrestling",
    locationId: "vibe-cafe",
    text:
      `You insert yourself into a conversation about \"agentic workflows.\"\n\n` +
      `Guy in a vest: \"We're abstracting the abstraction layer.\"\n` +
      `Woman with three monitors: \"That's just cron with anxiety.\"\n\n` +
      `They look at you. Waiting. The outlet hums like a jump-scare soundtrack.`,
    choices: [
      {
        text: "\"We're building AGI for group chats.\"",
        effects: { followers: 15, clout: 2, engagement: 10 },
        post: {
          text: "just told a café that we're building AGI for group chats. nobody laughed. product-market fit??",
          likes: 22,
          reposts: 5,
        },
        next: "vibe_hub",
      },
      {
        text: "Admit you're pre-idea and hunting for a problem.",
        effects: { clout: 1 },
        next: "vibe_hub",
        messages: [
          {
            npcId: "priya",
            text: "I overhead your honesty. refreshing. or tragic. I'm Priya — YC adjacent. don't embarrass me if I intro you.",
            unlock: true,
          },
        ],
      },
      {
        text: "Steal their whiteboard marker and leave a fake term sheet doodle.",
        effects: { shameless: 2, clout: 3, followers: 10 },
        next: "vibe_hub",
      },
    ],
  },

  vibe_observe: {
    id: "vibe_observe",
    title: "Anthropologist Mode",
    locationId: "vibe-cafe",
    text:
      `You watch:\n\n` +
      `• A pair arguing about dilution over a shared croissant\n` +
      `• Someone crying softly into a Notion page titled \"Q3 OKRs\"\n` +
      `• A guy filming a \"day in the life\" that carefully avoids the bathroom line\n\n` +
      `You take notes. This is user research. Or voyeurism. In startups, same line item.`,
    choices: [
      {
        text: "Post an observational thread. Become the narrator.",
        effects: { followers: 30, engagement: 15, clout: 4 },
        post: {
          text: "field notes from vibe code café:\n1. nobody is coding\n2. everybody is fundraising\n3. the real product is the performance of building\n\ngm",
          likes: 55,
          reposts: 18,
        },
        next: "vibe_hub",
      },
      {
        text: "Quietly leave. Too much mirror.",
        next: "vibe_hub",
      },
    ],
  },

  vibe_hub: {
    id: "vibe_hub",
    title: "Café Free Roam",
    locationId: "vibe-cafe",
    text: (s) =>
      `Still at Vibe Code Café. The playlist switched to lo-fi that sounds like a startup failing gently.\n\n` +
      `Followers: ${s.followers}. The outlet is still yours. For now.`,
    choices: [
      {
        text: "Grind another hour on the landing page.",
        effects: { clout: 1, followers: 5 },
        next: "vibe_hub",
      },
      {
        text: "Head home before the \"networking\" gets weird.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Open Map — go somewhere else.",
        next: null,
      },
    ],
  },

  // ─── Hackathon ─────────────────────────────────────────────
  hack_arrive: {
    id: "hack_arrive",
    title: "Hackathon: Check-In",
    locationId: "hackathon",
    text:
      `A converted warehouse. LED strips. Sponsors that are 90% cloud credits you'll never use.\n\n` +
      `A volunteer in a lanyard scans your QR code that you generated in the line.\n\n` +
      `\"Team of?\"\n\n` +
      `You gesture vaguely at the universe.`,
    choices: [
      {
        text: "Solo. Main character energy.",
        effects: { flags: { hackSolo: true } },
        next: "hack_build",
      },
      {
        text: "Recruit the nearest person with a mechanical keyboard.",
        effects: { flags: { hackTeam: true }, clout: 1 },
        next: "hack_team",
      },
      {
        text: "Lie and say your cofounder is \"remote in Europe.\"",
        effects: { shameless: 2, flags: { hackSolo: true } },
        next: "hack_build",
      },
    ],
  },

  hack_team: {
    id: "hack_team",
    title: "Instant Cofounders",
    locationId: "hackathon",
    text:
      `You recruit **Devon** (design, has opinions about borders-radius) and **Aisha** (ML, currently fine-tuning something on a dying laptop).\n\n` +
      `Devon: \"What's the idea?\"\n` +
      `You: \"AI… for… good.\"\n` +
      `Aisha: \"That's not an idea that's a LinkedIn bio.\"\n\n` +
      `Thirty minutes later you have a name: **StriveOS** — \"the operating system for ambition.\" It does not operate. It does have a logo.`,
    choices: [
      {
        text: "Build a gorgeous demo that barely works.",
        effects: { clout: 3, flags: { hasDemo: true } },
        next: "hack_demo",
      },
      {
        text: "Build something ugly that actually works.",
        effects: { clout: 2, flags: { hasWorking: true, hasDemo: true } },
        next: "hack_demo",
      },
    ],
  },

  hack_build: {
    id: "hack_build",
    title: "Solo Queue",
    locationId: "hackathon",
    text:
      `You stake out a corner table. Energy drinks form a skyline.\n\n` +
      `At 3am a stranger sits across from you and whispers, \"My team pivoted into a dating app for LLMs. I need a new life.\"\n\n` +
      `You nod. This is normal.`,
    choices: [
      {
        text: "Ship a wrapper + a viral tweet thread. Meta-win.",
        effects: { followers: 40, engagement: 20, clout: 3, flags: { hasDemo: true } },
        post: {
          text: "hacking solo. product: AI that rejects your bad ideas so VCs don't have to.\n\nwaitlist in bio. judges in my DMs (not really)",
          likes: 70,
          reposts: 20,
        },
        next: "hack_demo",
      },
      {
        text: "Actually try to win. Sleep is for post-exit.",
        effects: { clout: 4, flags: { hasDemo: true, hasWorking: true } },
        next: "hack_demo",
      },
    ],
  },

  hack_demo: {
    id: "hack_demo",
    title: "Demo Time",
    locationId: "hackathon",
    text: (s) =>
      `Stage lights. Sixty seconds. Your palms are Series B sweaty.\n\n` +
      (s.flags.hasWorking
        ? `The demo works. People clap like they mean it. A judge writes something that isn't a grocery list.\n\n`
        : `The demo crashes at second 45. You sell the crash as \"chaos engineering.\" Half the room buys it.\n\n`) +
      `Afterwards, a man in an expensive linen shirt approaches. Tan. Smile like a SAFE note.\n\n` +
      `\"I'm **Jordan**. I do dealflow for a fund that invests in… interesting people.\" His eyes linger one second too long. \"Do you yacht?\"`,
    choices: [
      {
        text: "\"I yacht-curious. Tell me more.\"",
        hint: "He will text. A lot. Regardless of your demographics.",
        effects: { clout: 2, flags: { metJordan: true } },
        messages: [
          {
            npcId: "jordan",
            text: "great energy on stage 🔥 free later this week? my principal Garry hosts this… informal founder retreat. sauna optional. outcomes uncapped.",
            unlock: true,
          },
        ],
        next: "hack_after",
      },
      {
        text: "Keep it professional. Ask about check size.",
        effects: { clout: 1, flags: { metJordan: true } },
        messages: [
          {
            npcId: "jordan",
            text: "check size depends on chemistry 😉 kidding. mostly. send deck?",
            unlock: true,
          },
        ],
        next: "hack_after",
      },
      {
        text: "\"I only board vessels with term sheets.\"",
        effects: { shameless: 1, clout: 2, flags: { metJordan: true } },
        messages: [
          {
            npcId: "jordan",
            text: "lol cold. I respect it. still — Garry's sauna has closed more rounds than most partners' calendars. keep my number.",
            unlock: true,
          },
        ],
        next: "hack_after",
      },
    ],
  },

  hack_after: {
    id: "hack_after",
    title: "Post-Hack Crash",
    locationId: "hackathon",
    text:
      `You don't win first place. First place is an AI dog collar.\n\n` +
      `You do win a cloud credit bundle and a photo with a cardboard unicorn.\n\n` +
      `Your X likes tick up. Somewhere, a future biographer will call this \"the early days.\"`,
    choices: [
      {
        text: "Post the cardboard unicorn. Mythology starts now.",
        effects: { followers: 20, engagement: 8, day: 1 },
        post: {
          text: "didn't win the hackathon. won the narrative. cardboard unicorn era begins 🦄",
          likes: 35,
          reposts: 6,
        },
        next: "new_day",
      },
      {
        text: "Go home. Shower optional.",
        effects: { locationId: "tenderloin", day: 1 },
        next: "new_day",
      },
    ],
  },

  // ─── YC Startup School ─────────────────────────────────────
  yc_arrive: {
    id: "yc_arrive",
    title: "YC Startup School",
    locationId: "yc-school",
    text:
      `It's free. That should be your first red flag and your first green flag simultaneously.\n\n` +
      `A Zoom room with 2,000 tiles of founders muting themselves too late. Someone's cat walks across a keyboard mid-pitch.\n\n` +
      `The speaker says: **\"Make something people want.\"** The chat explodes with fire emojis like this is revelation and not a bumper sticker.`,
    choices: [
      {
        text: "Take notes. Actually try to learn.",
        effects: { clout: 2, flags: { ycSchoolDone: true } },
        next: "yc_office_hours",
      },
      {
        text: "Network in the Zoom chat like a feral raccoon.",
        effects: { clout: 3, followers: 15, flags: { ycSchoolDone: true } },
        post: {
          text: "YC Startup School chat is just 2000 people saying \"same\" under every trauma. I feel seen. I feel scalable.",
          likes: 28,
          reposts: 9,
        },
        next: "yc_office_hours",
      },
      {
        text: "Ask a question designed to get screenshot-famous.",
        effects: { followers: 50, engagement: 20, clout: 4, shameless: 2, flags: { ycSchoolDone: true } },
        post: {
          text: "just asked in YC SS: \"if make something people want, what if I want their money?\" muted for 60s. worth it.",
          likes: 120,
          reposts: 40,
        },
        next: "yc_office_hours",
      },
    ],
  },

  yc_office_hours: {
    id: "yc_office_hours",
    title: "Group Office Hours",
    locationId: "yc-school",
    text:
      `Breakout room. Six founders, one exhausted alum.\n\n` +
      `Alum: \"What's your unfair advantage?\"\n\n` +
      `Founder 1: \"Stanford network.\"\n` +
      `Founder 2: \"Ex-Google.\"\n` +
      `Founder 3: \"My dad is the customer.\"\n\n` +
      `All eyes on you.`,
    choices: [
      {
        text: "\"I live in the Tenderloin. I understand pain.\"",
        effects: { clout: 3, followers: 10 },
        next: "yc_priya",
      },
      {
        text: "\"I'm unemployable in a hot way.\"",
        effects: { engagement: 10, clout: 2 },
        next: "yc_priya",
      },
      {
        text: (s) =>
          s.character.id === "mathgenius"
            ? "\"I can prove product-market fit exists for ε > 0.\""
            : s.character.id === "cmo"
              ? "\"I can make your dad's company look like a lifestyle brand.\""
              : "\"I post through the pain. Distribution is the moat.\"",
        effects: { clout: 4, followers: 20 },
        next: "yc_priya",
      },
    ],
  },

  yc_priya: {
    id: "yc_priya",
    title: "Rival Energy",
    locationId: "yc-school",
    text:
      `After the call, **Priya** DMs you — sharp, funny, already has a waitlist that isn't fake.\n\n` +
      `\"You're chaotic. Useful. Don't steal my users and I might steal your jokes.\"\n\n` +
      `Also: someone named **Garry** was apparently lurking the alumni Slack. Jordan wasn't lying.`,
    choices: [
      {
        text: "Flirt-compete with Priya. Healthy.",
        effects: { flags: { metPriya: true, ycSchoolDone: true }, clout: 2 },
        messages: [
          {
            npcId: "priya",
            text: "race you to 1k followers. loser buys oat milk for a month. (I win.)",
            unlock: true,
          },
        ],
        next: "yc_hub",
      },
      {
        text: "Ask Priya if she's heard of Garry's sauna.",
        effects: { flags: { metPriya: true, metGarryTease: true, ycSchoolDone: true } },
        messages: [
          {
            npcId: "priya",
            text: "oh god. yes. bring a towel and an NDA. I'm not going with you. mostly.",
            unlock: true,
          },
          {
            npcId: "garry",
            text: "Jordan shared your little X presence. raw. come sweat out the cap table sometime 🧖",
            unlock: true,
          },
        ],
        next: "yc_hub",
      },
      {
        text: "Post a sincere thank-you thread. Grow up for 12 minutes.",
        effects: { followers: 25, clout: 2, flags: { ycSchoolDone: true } },
        post: {
          text: "startup school reminder: make something people want. currently people want me to stop tweeting. refusing.",
          likes: 40,
          reposts: 8,
        },
        next: "yc_hub",
      },
    ],
  },

  yc_hub: {
    id: "yc_hub",
    title: "Post-School Glow",
    locationId: "yc-school",
    text:
      `You've absorbed enough free advice to start a newsletter. Don't.\n\n` +
      `The Map whispers of Stanford lawns and warmer rooms.`,
    choices: [
      {
        text: "Home to process (and post).",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Open Map.",
        next: null,
      },
    ],
  },

  // ─── Stanford ──────────────────────────────────────────────
  stanford_arrive: {
    id: "stanford_arrive",
    title: "Stanford: Palm Tree Capital",
    locationId: "stanford",
    text:
      `The air smells like money that went to college.\n\n` +
      `Students glide by on bikes that cost more than your laptop. A tour group learns that \"Silicon Valley started here,\" which is true in the same way \"I founded the company\" is true when you were employee 40.\n\n` +
      `You came for talent, co-founders, or to feel taller by proximity.`,
    choices: [
      {
        text: "Crash a CS lecture. Recruit.",
        effects: { clout: 2 },
        next: "stanford_lecture",
      },
      {
        text: "Hang near the business school. Smell the PE.",
        effects: { clout: 1 },
        next: "stanford_gsb",
      },
      {
        text: "Post a thirst-trap with Hoover Tower in the background.",
        effects: { followers: 35, engagement: 15, shameless: 1 },
        post: {
          text: "on campus acquiring talent (sunlight). if you can leetcode and lie to VCs with me, DM 🌲",
          likes: 60,
          reposts: 10,
        },
        next: "stanford_hub",
      },
    ],
  },

  stanford_lecture: {
    id: "stanford_lecture",
    title: "Unauthorized TA",
    locationId: "stanford",
    text:
      `You sit in the back of a systems class. The professor is mid-proof. You understand every third word and nod on the fourth.\n\n` +
      `After, you pitch three undergrads. Two flee. One — **Leo** — says, \"I'll do infrastructure if you do fundraising and emotional labor.\"\n\n` +
      `That's… actually a fair split.`,
    choices: [
      {
        text: "Handshake deal. Equity TBD (classic).",
        effects: { clout: 3, flags: { hasCofounderTease: true } },
        post: {
          text: "soft-circled a Stanford systems nerd. equity: vibes. start date: after midterms.",
          likes: 25,
          reposts: 4,
        },
        next: "stanford_hub",
      },
      {
        text: "Offer real equity percentages like an adult.",
        effects: { clout: 4, flags: { hasCofounderTease: true } },
        next: "stanford_hub",
      },
    ],
  },

  stanford_gsb: {
    id: "stanford_gsb",
    title: "GSB Adjacent",
    locationId: "stanford",
    text:
      `MBA students discuss \"space\" for a \"platform play.\" You hear the word **synergy** used without irony. You almost call an ambulance.\n\n` +
      `A friendly second-year offers you a guest ticket to a founder mixer later this week — \"yacht adjacent,\" they wink.`,
    choices: [
      {
        text: "Take the ticket. Smile like dilution isn't real.",
        effects: { flags: { yachtInvite: true, ycSchoolDone: true }, clout: 2 },
        next: "stanford_hub",
      },
      {
        text: "Decline. You've read about boats in Greek myths.",
        effects: { clout: 1 },
        next: "stanford_hub",
      },
    ],
  },

  stanford_hub: {
    id: "stanford_hub",
    title: "Campus Roam",
    locationId: "stanford",
    text: `Palm trees. Impostor syndrome. Free WiFi that requires a SUNet ID you don't have — you hotspot like a racoon.`,
    choices: [
      {
        text: "Back to the city.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Map time.",
        next: null,
      },
    ],
  },

  // ─── Garry's Sauna ─────────────────────────────────────────
  sauna_arrive: {
    id: "sauna_arrive",
    title: "Garry Chan's Sauna",
    locationId: "garry-sauna",
    text: (s) =>
      `The address is a modern box in Pacific Heights that costs more per month than your entire friend group's ARR.\n\n` +
      `A house manager named Klaus takes your phone (\"for presence\") and offers eucalyptus water.\n\n` +
      `**Garry Chan** appears in a towel and confidence. Mid-40s, VC, legendary for \"founder-friendly\" processes that include optional cardio.\n\n` +
      (isMale(s)
        ? `"${s.character.name}," he says, warm. "Jordan said you were… technical. And fun. Rare combo. Come in. The heat is good for clarity. And for shirts."\n\n`
        : `"${s.character.name}," he smiles. "We don't get enough brilliant women who can survive the heat — metaphorical and otherwise. Come in. No weirdness. Mostly."\n\n`) +
      `Steam. Soft lighting. A whiteboard already fogged with the words **SEED ROUND?**`,
    choices: [
      {
        text: "Enter the sauna. Bring your pitch. Leave your dignity near Klaus.",
        effects: { clout: 3, flags: { enteredSauna: true } },
        next: "sauna_pitch",
      },
      {
        text: "Suggest you take the meeting poolside, clothed.",
        effects: { clout: 2 },
        next: "sauna_pool",
      },
      {
        text: "Bail. Tweet about it vaguely for clout.",
        effects: { followers: 40, engagement: 10, flags: { bailedSauna: true } },
        post: {
          text: "just fled a \"networking sauna.\" if your diligence process requires towels I'm out. unless the valuation is hot enough 🏃",
          likes: 90,
          reposts: 30,
        },
        next: "home_hub",
      },
    ],
  },

  sauna_pitch: {
    id: "sauna_pitch",
    title: "Sweat Equity (Literal)",
    locationId: "garry-sauna",
    text: (s) =>
      `You pitch in 90°C honesty. Your deck is mental. Your metrics are vibes.\n\n` +
      `Garry listens. Asks sharp questions. Also asks if you moisturize.\n\n` +
      (isMale(s)
        ? `"I like you," he says. "Not just your TAM. Come to the yacht party. Bring a swimsuit you can network in. We'll talk numbers. Among other… alignments."\n\n`
        : `"I like your steel," he says. "Yacht party this weekend. Bring your sharpest deck and your dullest tolerance for boys who confuse power with charm."\n\n`) +
      `Klaus returns your phone. It has 3% more battery somehow. Magic. Or a power bank. Same thing.`,
    choices: [
      {
        text: "Accept the yacht invite. What could go wrong?",
        effects: {
          flags: { yachtInvite: true, metGarry: true },
          clout: 5,
          cash: 0,
        },
        messages: [
          {
            npcId: "garry",
            text: (st) =>
              isMale(st)
                ? "you survived the heat 🔥 yacht Saturday. let's put our heads together on coding problems… and chemistry. black tie optional. towel not."
                : "you survived the heat. yacht Saturday. I'll intro you to LPs who actually write checks. wear whatever makes them nervous.",
            unlock: true,
          },
        ],
        post: {
          text: "took a meeting in a sauna. raised my core temperature and my standards. announcement soon? 🧖",
          likes: 50,
          reposts: 12,
        },
        next: "sauna_hub",
      },
      {
        text: "Ask for a check, not a boat.",
        effects: { flags: { metGarry: true }, clout: 3, cash: 500 },
        messages: [
          {
            npcId: "garry",
            text: "angel check inbound for \"friends & family\" (you're family now 😉). yacht still open. money loves company.",
            unlock: true,
          },
        ],
        next: "sauna_hub",
      },
    ],
  },

  sauna_pool: {
    id: "sauna_pool",
    title: "Poolside Professionalism",
    locationId: "garry-sauna",
    text:
      `Garry laughs. \"Boundaries. Cute.\"\n\n` +
      `You talk valuation, GTM, and whether AI wrappers are a bubble (yes) or a rocket (also yes).\n\n` +
      `He still invites you to the yacht. \"Clothes allowed,\" he promises, pinky-swear that means nothing in California.`,
    choices: [
      {
        text: "Take the win. And the invite.",
        effects: { flags: { yachtInvite: true, metGarry: true }, clout: 3 },
        messages: [
          {
            npcId: "garry",
            text: "poolside founders are rare. yacht Saturday. I'll behave. mostly.",
            unlock: true,
          },
        ],
        next: "sauna_hub",
      },
    ],
  },

  sauna_hub: {
    id: "sauna_hub",
    title: "Post-Steam",
    locationId: "garry-sauna",
    text: `You leave smelling like eucalyptus and moral ambiguity. Klaus nods. The city feels smaller.`,
    choices: [
      {
        text: "Uber home on fumes and fantasy.",
        cost: { cash: 28 },
        effects: { cash: -28, locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Map.",
        next: null,
      },
    ],
  },

  // ─── Yacht ─────────────────────────────────────────────────
  yacht_arrive: {
    id: "yacht_arrive",
    title: "YC SUS Yacht Afterparty",
    locationId: "yc-yacht",
    text: (s) =>
      `The boat is named **Diligence**. Of course it is.\n\n` +
      `Champagne, founders, two people who definitely work in "crypto adjacent wellness." A DJ plays a remix of a song about compound interest.\n\n` +
      (s.flags.metGarry
        ? `Garry waves from the upper deck, linen shirt unbuttoned to a legally interesting degree. He mouths: *come up when you're ready to talk numbers.*\n\n`
        : `A man who looks expensive is holding court upper deck. People keep saying "Garry." The money conversation will find you before the night ends — one way or another.\n\n`) +
      `Priya is here too, somehow. She mouths: *don't do anything I wouldn't livestream.*`,
    choices: [
      {
        text: "Go straight upstairs. Talk money before the champagne does.",
        hint: "Seed conversation — the real quest marker.",
        effects: { clout: 3, flags: { metGarry: true } },
        next: "yacht_garry",
      },
      {
        text: "Work the room first. Collect handles like Pokémon.",
        effects: { followers: 80, clout: 5, engagement: 15 },
        post: {
          text: "on a yacht called Diligence. nobody is diligent. everybody is raising. send help or wire transfers.",
          likes: 200,
          reposts: 45,
        },
        next: "yacht_peak",
      },
      {
        text: "Hide near the hors d'oeuvres and make a friend.",
        effects: { clout: 2 },
        next: "yacht_skylar",
      },
    ],
  },

  yacht_garry: {
    id: "yacht_garry",
    title: "Upper Deck Diligence",
    locationId: "yc-yacht",
    text: (s) =>
      `Wind. Skyline. Garry's cologne costs more than your cloud bill.\n\n` +
      (isMale(s)
        ? `"Beautiful night," he says. "Beautiful ambition. I want to lead a seed. Small check, big… mentorship. We'll work closely. Very closely. You in?"\n\n` +
          `His hand rests on the railing near yours. The DJ drops a beat like a plot point.`
        : `"You've got the room," he says. "Rare. I'll intro three LPs tonight. In exchange: don't tweet the stupid stuff until after the wire. Deal?"\n\n` +
          `It's the cleanest offer you've heard all week. Suspicious.`),
    choices: [
      {
        text: "Take the seed. Smile. Negotiate later.",
        effects: {
          cash: 150000,
          followers: 200,
          clout: 15,
          flags: { raisedSeed: true, seedDecided: true, endingTrack: "money" },
        },
        post: {
          text: "small announcement: we raised a seed 🌱 more soon. grateful for believers (and boats).",
          likes: 500,
          reposts: 120,
        },
        next: "yacht_after_money",
      },
      {
        text: "\"Mentorship sounds expensive. Show me the SAFE.\"",
        effects: {
          cash: 75000,
          clout: 10,
          flags: { raisedSeed: true, seedDecided: true, endingTrack: "careful" },
        },
        post: {
          text: "negotiated on a yacht. still standing. still solvent. SAFE signed with eyes open 👀",
          likes: 300,
          reposts: 60,
        },
        next: "yacht_after_money",
      },
      {
        text: "Decline the money. Keep the story.",
        effects: {
          clout: 5,
          followers: 100,
          flags: { declinedSeed: true, seedDecided: true, endingTrack: "story" },
        },
        post: {
          text: "turned down a check on a yacht. either peak integrity or peak stupidity. thread soon.",
          likes: 400,
          reposts: 90,
        },
        next: "yacht_after_money",
      },
    ],
  },

  yacht_after_money: {
    id: "yacht_after_money",
    title: "After the Wire (Or the Walk-Away)",
    locationId: "yc-yacht",
    text: (s) =>
      (s.flags.raisedSeed
        ? `Your banking app glitches, then shows a number with too many zeros. Garry toasts "to alignment." Someone asks if you're hiring.\n\n` +
          `**Map unlocks:**\n` +
          `• **Mercury HQ** — where founders park the wire (startup banking, partner banks under the hood).\n` +
          `• **SoMa Soft HQ** — glass-box company cosplay once the money has a grown-up home.\n\n` +
          `Garry's note: *Don't keep seed in Chase checking. That's how LPs smell fear. Mercury. Not your roommate's Venmo.*\n\n`
        : `You leave the upper deck with your integrity, your brand, and still roughly mattress money. The party continues without a wire confirmation.\n\n`) +
      `Below, the fox onesie is still holding court with an otter. The night isn't done being weird.`,
    choices: [
      {
        text: "Approach the fox onesie before you sober up.",
        hint: "Oakland side quest.",
        require: (st) => (st.flags.metDylan ? "Already collected the sticky note" : true),
        next: "yacht_dylan",
      },
      {
        text: "Post the victory (or beautiful failure) selfie. End Chapter 1.",
        effects: { followers: 50, engagement: 10, day: 1 },
        post: {
          text: "from 0 followers & a TL studio to a yacht called Diligence. still me. still striving. harder. 💪",
          likes: 250,
          reposts: 55,
        },
        messages: [
          {
            npcId: "zane",
            text: (st) =>
              st.flags.raisedSeed
                ? "congrats on the close 💳 Zane @ Mercury. your wire deserves better than Chase + a Google Sheet. SoMa office. leave Ramp and Slash in the group chat where they belong."
                : "…wrong segment. reach out when you're post-seed.",
            unlock: true,
          },
        ],
        next: "chapter1_end",
      },
      {
        text: "Slip away. Myths (and wires) need mystery.",
        effects: { clout: 2, day: 1 },
        messages: [
          {
            npcId: "zane",
            text: (st) =>
              st.flags.raisedSeed
                ? "saw the yacht energy. Mercury map pin live. we partner with real banks; we just make the UI founder-core. (Ramp is for people who think lunch is a P&L. Slash is for people who collect cards like Pokémon.) — Zane"
                : "wrong ICP (pre-seed). come back when the wire clears 💳",
            unlock: true,
          },
        ],
        next: "chapter1_end",
      },
    ],
  },

  yacht_skylar: {
    id: "yacht_skylar",
    title: "Canapés & Chemistry",
    locationId: "yc-yacht",
    text:
      `Skylar finds you mid-shrimp.\n\n` +
      `"You cleaned up," she says. "Relative to the café. Want to co-host a live Spaces about raising while delusional? It'll print engagement."\n\n` +
      `Priya appears with two drinks. "Or co-host with someone who can spell delusional."`,
    choices: [
      {
        text: "Team up with Skylar. Influencer route.",
        effects: { followers: 150, engagement: 25, flags: { skylarCollab: true } },
        messages: [
          {
            npcId: "skylar",
            text: "spaces thursday. wear something that photographs like a Series A. you're welcome.",
            unlock: true,
          },
        ],
        next: "yacht_peak",
      },
      {
        text: "Side with Priya. Builder rivalry route.",
        effects: { clout: 5, followers: 60, flags: { priyaAlliance: true } },
        messages: [
          {
            npcId: "priya",
            text: "fine. temporary alliance. we crush the feed, then we compete. bring your best bad ideas.",
            unlock: true,
          },
        ],
        next: "yacht_peak",
      },
      {
        text: "Propose a thruple… of cofounders. Purely professional.",
        effects: { shameless: 3, followers: 80, clout: 3 },
        next: "yacht_peak",
      },
    ],
  },

  yacht_peak: {
    id: "yacht_peak",
    title: "Midnight on the Bay",
    locationId: "yc-yacht",
    text: (s) =>
      `The skyline glitter-bombs the water. Someone falls in (phone first). Someone else announces a pivot to climate.\n\n` +
      `Your follower count ticks: **${s.followers}**.\n\n` +
      (s.flags.seedDecided
        ? s.flags.raisedSeed
          ? `You have money in the bank that isn't roommate IOUs. The game is changing.\n\n`
          : `You walked from the check. Your brand is intact. Your runway is still a joke.\n\n`
        : `You still haven't done the money conversation. Garry is circling like a friendly shark. The night won't let you ghost the term sheet forever.\n\n`) +
      `Near the bar: a man in a **full fox onesie**, sipping something clear from a mason jar, talking to a stuffed otter about "distribution." ` +
      `He waves. The otter waves too (he moves its paw).`,
    choices: [
      {
        text: "Garry finds you. Time for the actual deal.",
        hint: "Seed offer — can't finish the yacht without deciding.",
        require: (st) =>
          st.flags.seedDecided ? "You already took or declined the check" : true,
        effects: { flags: { metGarry: true } },
        next: "yacht_garry",
      },
      {
        text: "Approach the fox onesie. Curiosity is a growth strategy.",
        hint: "This unlocks… something in Oakland.",
        require: (st) => (st.flags.metDylan ? "Already met Dylan" : true),
        next: "yacht_dylan",
      },
      {
        text: "Post the victory (or beautiful failure) selfie.",
        require: (st) =>
          st.flags.seedDecided
            ? true
            : "Garry wants a word before you leave the boat",
        effects: { followers: 50, engagement: 10, day: 1 },
        post: {
          text: "from 0 followers & a TL studio to a yacht called Diligence. still me. still striving. harder. 💪",
          likes: 250,
          reposts: 55,
        },
        next: "chapter1_end",
      },
      {
        text: "Slip away quietly. Myths need mystery.",
        require: (st) =>
          st.flags.seedDecided
            ? true
            : "The money conversation finds you first — upper deck",
        effects: { clout: 2, day: 1 },
        next: "chapter1_end",
      },
    ],
  },

  yacht_dylan: {
    id: "yacht_dylan",
    title: "The Onesie Diplomat",
    locationId: "yc-yacht",
    text:
      `"I'm Dylan," he says, through the fox snout. "I do ketamine and mycelium logistics. Oakland. Very boutique."\n\n` +
      `The otter ("Lieutenant Squelch") has a tiny lanyard that says **ADVISOR**.\n\n` +
      `"You're vibrating at a pre-download frequency," Dylan continues. "If you ever need the bag — or the mountain — come by. ` +
      `I grow lions in bins. Not the cats. The mushrooms. Also plushies. Don't step on the plushies."\n\n` +
      `He presses a sticky note into your palm. An address in Oakland. A fox doodle. The word **K** with a heart.\n\n` +
      `"Also," he adds, "A Wrinkle in Time is the best film ever made. Oprah as Mrs. Which? Cinema. We should watch it high sometime."\n\n` +
      `A VC walks past and fist-bumps the otter. You no longer understand capitalism.`,
    choices: [
      {
        text: "Take the sticky note. This is networking.",
        effects: {
          flags: { metDylan: true, dylanSticky: true },
          clout: 2,
          shameless: 1,
        },
        messages: [
          {
            npcId: "dylan",
            text: "yo it's dylan (fox from the boat). oakland pin is on your map now. wipe your feet. the plushies have feelings. 🦊",
            unlock: true,
          },
        ],
        next: "yacht_after_dylan",
      },
      {
        text: "Ask if the otter has a SAFE note.",
        effects: {
          flags: { metDylan: true, dylanSticky: true },
          followers: 15,
          shameless: 2,
        },
        post: {
          text: "met a guy in a fox onesie on a YC yacht who introduced me to his stuffed otter advisor. this is the bull case.",
          likes: 80,
          reposts: 20,
        },
        messages: [
          {
            npcId: "dylan",
            text: "squelch says you're funny. funny people get first pick of the jar. map unlocked. don't bring cops or vibes.",
            unlock: true,
          },
        ],
        next: "yacht_after_dylan",
      },
    ],
  },

  yacht_after_dylan: {
    id: "yacht_after_dylan",
    title: "After the Fox",
    locationId: "yc-yacht",
    text: (s) =>
      `Dylan melts back into the crowd like a furry cryptid. Your Map app pings: **new pin — Ketamine Dealer**.\n\n` +
      (s.flags.seedDecided
        ? `The skyline is still pretty. Your life is less so. Perfect.`
        : `Garry appears at your elbow with two flutes and a smile that means paperwork. "Before you leave," he says.`),
    choices: [
      {
        text: "Fine. Do the money conversation.",
        require: (st) =>
          st.flags.seedDecided ? "Already decided upstairs" : true,
        effects: { flags: { metGarry: true } },
        next: "yacht_garry",
      },
      {
        text: "Post about the night (omit the otter). Close Chapter 1.",
        require: (st) =>
          st.flags.seedDecided
            ? true
            : "Garry still needs a yes, a SAFE, or a no",
        effects: { followers: 40, engagement: 8, day: 1 },
        post: {
          text: "yacht called Diligence. met someone who might be a product or a side quest. striving harder 💪",
          likes: 180,
          reposts: 40,
        },
        next: "chapter1_end",
      },
      {
        text: "Slip off the boat before Dylan reappears with a second onesie.",
        require: (st) =>
          st.flags.seedDecided
            ? true
            : "Not until you take, negotiate, or decline the check",
        effects: { day: 1 },
        next: "chapter1_end",
      },
    ],
  },

  chapter1_end: {
    id: "chapter1_end",
    title: "End of Chapter 1 — Strive Harder",
    locationId: "tenderloin",
    text: (s) =>
      `**CHAPTER 1 COMPLETE**\n\n` +
      `${s.character.name} (@${s.character.handle})\n` +
      `Followers: **${s.followers}** · Clout: **${s.clout}** · Cash: **$${s.cash.toLocaleString()}**\n\n` +
      `You started with nothing but a sticky note and a roommate who steals protein bars.\n\n` +
      (s.flags.raisedSeed
        ? `You raised. The internet noticed. Garry definitely noticed.\n\n` +
          `**Next money ops:**\n` +
          `1. **Mercury HQ** — park the wire (do this before Soft HQ if you want the full founder ritual).\n` +
          `2. **SoMa Soft HQ** — spend seed like a company before Series A smells blood (**The Round**).\n\n`
        : s.flags.declinedSeed
          ? `You declined the yacht check. Integrity is a strategy. Runway is still a personality trait.\n\n`
          : `Somehow you left the boat without a money decision. The Bay is confused.\n\n`) +
      (s.flags.metDylan
        ? `**Side quest:** Ketamine Dealer (Oakland) is unlocked. Dylan texted.\n\n`
        : `You skipped the fox. Some doors stay closed.\n\n`) +
      `Keep posting. Keep roaming. The mattress still exists.`,
    choices: [
      {
        text: "Continue free roam — the Bay isn't done with you.",
        next: "home_hub",
      },
      {
        text: "Park the seed at Mercury HQ.",
        require: (st) =>
          st.flags.raisedSeed ? true : "Need a seed wire first",
        effects: { locationId: "mercury-hq" },
        next: "claw_arrive",
      },
      {
        text: "Go claim SoMa Soft HQ (if you raised).",
        require: (st) =>
          st.flags.raisedSeed ? true : "Need a seed wire first",
        effects: { locationId: "soft-hq" },
        next: "hq_arrive",
      },
      {
        text: "Sleep. Dream of liquidity events.",
        effects: { day: 1 },
        next: "new_day",
      },
    ],
  },

  // ─── Corgi Café (surreal seizure-branding experience) ─────
  corgi_arrive: {
    id: "corgi_arrive",
    title: "Corgi Café — Please Sign the Waiver",
    locationId: "corgi-cafe",
    text: (s) =>
      `The door is shaped like a corgi. Not metaphorically. Your shoulder hits an ear.\n\n` +
      `Inside: colors that should be illegal in twelve states. Neon orange. Safety-vest yellow. ` +
      `A purple so aggressive it files its own patents. The walls pulse at roughly 12Hz — ` +
      `a barista says it's "on-brand for retention."\n\n` +
      `A sign: **WELCOME TO THE CORGI ECOSYSTEM** · *Merch is the product. Coffee is the Trojan horse.*\n\n` +
      `Someone in a full dog onesie hands you a lanyard before you consent. ` +
      `It says **FOUNDER (PRE-BELIEF)**.\n\n` +
      `@${s.character.handle}, your pupils are already negotiating a term sheet with the lighting.`,
    choices: [
      {
        text: "Order a \"Series A Cold Brew\" and accept your fate.",
        hint: "Everything is a pitch. Even the ice.",
        cost: { cash: 9 },
        effects: { cash: -9, flags: { enteredCorgiCafe: true }, clout: 1 },
        next: "corgi_menu",
      },
      {
        text: "Try to sit in a quiet corner. There is no quiet corner.",
        effects: { flags: { enteredCorgiCafe: true } },
        next: "corgi_pitch_floor",
      },
      {
        text: "Film a seizure-core selfie for the timeline.",
        effects: { followers: 45, engagement: 18, clout: 3, flags: { enteredCorgiCafe: true, corgiContent: true } },
        post: {
          text: "inside Corgi Café. the brand guidelines just violated the Geneva Convention. still posting. 🐶⚡",
          likes: 90,
          reposts: 22,
        },
        next: "corgi_pitch_floor",
      },
      {
        text: "Back out slowly. Protect the optic nerve.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  corgi_menu: {
    id: "corgi_menu",
    title: "The Menu Is a Deck",
    locationId: "corgi-cafe",
    text:
      `Your drink arrives in a cup printed with a hockey-stick graph. The straw is branded. The napkin has a QR code to a waitlist for a waitlist.\n\n` +
      `A floating hologram of a corgi (why) says: **"HAVE YOU THOUGHT ABOUT DISTRIBUTION?"**\n\n` +
      `The person next to you is pitching a stranger on "Corgi-as-a-Service." ` +
      `The stranger is also pitching. They are locked in mutual GTM combat. Nobody is drinking.\n\n` +
      `Your cold brew tastes like ambition and orange dye #5.`,
    choices: [
      {
        text: "Ask what Corgi actually does.",
        hint: "Brave. Foolish. Content.",
        next: "corgi_what_is",
      },
      {
        text: "Join the mutual pitch. Speak only in acronyms.",
        effects: { shameless: 2, clout: 2, engagement: 8 },
        next: "corgi_pitch_floor",
      },
      {
        text: "Steal a sticker pack and leave a review in your head.",
        effects: { flags: { stoleCorgiStickers: true }, clout: 1 },
        next: "corgi_hub",
      },
    ],
  },

  corgi_what_is: {
    id: "corgi_what_is",
    title: "What Is Corgi (Nobody Knows)",
    locationId: "corgi-cafe",
    text:
      `Three employees answer at once.\n\n` +
      `**Employee A:** "We're a lifestyle operating system for dogs who code."\n` +
      `**Employee B:** "We're infrastructure for joy-as-a-service, dog-shaped."\n` +
      `**Employee C:** "We're what happens when a Series B has a mascot and no moat."\n\n` +
      `The lights strobe Corgi-orange → venture-violet → ambulance-yellow. ` +
      `A mural of a corgi in a Patagonia vest blinks. You blink back. The mural wins.\n\n` +
      `Someone presses a plush corgi into your hands. It whispers (speaker in the ear): ` +
      `"Have you considered an enterprise seat?"`,
    choices: [
      {
        text: "\"I'm in. Take my email. Take my blood type.\"",
        effects: { flags: { corgiWaitlist: true, survivedCorgiCafe: true }, followers: 20, clout: 2 },
        post: {
          text: "joined the Corgi waitlist. don't know what it is. that's product-market fit baby",
          likes: 35,
          reposts: 8,
        },
        next: "corgi_deep_end",
      },
      {
        text: "Politely say you're allergic to brand.",
        effects: { clout: 1, flags: { survivedCorgiCafe: true } },
        next: "corgi_deep_end",
      },
      {
        text: "Challenge the plush to a debate on unit economics.",
        effects: { shameless: 1, clout: 3, flags: { survivedCorgiCafe: true } },
        next: "corgi_deep_end",
      },
    ],
  },

  corgi_pitch_floor: {
    id: "corgi_pitch_floor",
    title: "The Pitch Floor (No Escape)",
    locationId: "corgi-cafe",
    text:
      `You cannot walk five feet without a soft close.\n\n` +
      `A guy in LED dog ears: "We're not a café, we're a top-of-funnel experience."\n` +
      `A woman with a clipboard: "Quick — if Corgi were a dating app, would you swipe right on yourself?"\n` +
      `A child (intern?): "Synergy." He walks away. He has said enough.\n\n` +
      `The floor is a giant touchscreen heat-map of "engagement." Someone has spilled oat milk on the Bay Area. ` +
      `It looks like a successful launch.\n\n` +
      `Your vision tunnels into pure brand. You hear a distant bark that might be a KPI.`,
    choices: [
      {
        text: "Pitch THEM on your startup using only dog metaphors.",
        effects: { clout: 4, followers: 30, engagement: 12, flags: { corgiPitchWin: true, survivedCorgiCafe: true } },
        post: {
          text: "just pitched at Corgi Café using only corgi metaphors. they asked for a deck. the deck is a dog. 🐶",
          likes: 70,
          reposts: 15,
        },
        next: "corgi_deep_end",
      },
      {
        text: "Hide in the bathroom. The bathroom has a pitch.",
        hint: "QR code on the mirror. Of course.",
        effects: { flags: { survivedCorgiCafe: true } },
        next: "corgi_bathroom",
      },
      {
        text: "Buy merch to end the conversation ($28 hoodie).",
        cost: { cash: 28 },
        effects: { cash: -28, flags: { corgiMerch: true, survivedCorgiCafe: true }, clout: 2, followers: 15 },
        next: "corgi_hub",
      },
    ],
  },

  corgi_bathroom: {
    id: "corgi_bathroom",
    title: "Restroom = Growth Loop",
    locationId: "corgi-cafe",
    text:
      `The mirror asks you to rate your visit out of NPS.\n\n` +
      `The soap dispenser says **WASH · RINSE · REFER**.\n` +
      `The paper towels are printed with case studies.\n\n` +
      `Under the stall door, a hand slides you a sticker: ` +
      `**"I SURVIVED THE FUNNEL."**\n\n` +
      `You feel oddly loyal. This is how cults and coffee shops work.`,
    choices: [
      {
        text: "Leave a 10 NPS. Become the product.",
        effects: { flags: { corgiNps10: true, survivedCorgiCafe: true }, engagement: 5 },
        next: "corgi_deep_end",
      },
      {
        text: "Leave a 6 and write a novel in the comment box.",
        effects: { shameless: 1, flags: { survivedCorgiCafe: true } },
        next: "corgi_hub",
      },
    ],
  },

  corgi_deep_end: {
    id: "corgi_deep_end",
    title: "Brand Hypnosis (Optional, Mandatory)",
    locationId: "corgi-cafe",
    text: (s) =>
      `The lights go full rave-for-dogs. A short film plays on every surface: ` +
      `corgis in hoodies shipping code, corgis on yachts, a corgi closing a seed round with a paw print.\n\n` +
      `A voiceover: "Corgi isn't a company. Corgi is a feeling you can invoice."\n\n` +
      `You come to on a beanbag that smells like new vinyl and venture debt. ` +
      `Someone has put a temporary tattoo of a corgi on your wrist.\n\n` +
      (s.flags.corgiWaitlist
        ? `You are on seventeen waitlists. Your inbox will never recover.\n\n`
        : `You escaped the waitlist. Barely.\n\n`) +
      `Outside, San Francisco looks grayscale. Your eyes need a detox that doesn't exist.`,
    choices: [
      {
        text: "Post: \"Corgi Café changed me (neurologically).\"",
        effects: { followers: 40, engagement: 15, clout: 2, flags: { survivedCorgiCafe: true } },
        post: {
          text: "left Corgi Café seeing sounds. if your café doesn't induce mild synesthesia is it even GTM?",
          likes: 110,
          reposts: 28,
        },
        next: "corgi_hub",
      },
      {
        text: "Find the exit like a traumatized raccoon.",
        effects: { flags: { survivedCorgiCafe: true } },
        next: "corgi_hub",
      },
      {
        text: "Ask if Kayla from GTM is here (FlareUp made you weak).",
        require: (s) => (s.flags.likedKayla ? true : "Like Kayla on FlareUp first"),
        effects: { flags: { askedKaylaAtCorgi: true, survivedCorgiCafe: true } },
        next: "corgi_kayla",
      },
    ],
  },

  corgi_kayla: {
    id: "corgi_kayla",
    title: "Kayla Sighting (Unverified)",
    locationId: "corgi-cafe",
    text:
      `You ask three people. All of them are named something adjacent to growth.\n\n` +
      `Finally: a woman who matches the FlareUp photos — lanyard, perfect hair, eyes that convert.\n\n` +
      `"Hi!" she says, already mid-funnel. "Are you in our ICP? What's your ACV? Do you have budget this quarter?"\n\n` +
      `You mention the dating app. She blinks in a way that says your pipeline is unclean.\n\n` +
      `"FlareUp is for pipeline hygiene on weekends," she says. "I only close enterprise. Emotionally."\n\n` +
      `She hands you a sticker and vanishes into a cloud of orange light. ` +
      `You gain nothing except a story and a slight tremor.`,
    choices: [
      {
        text: "Post about almost meeting a Corgi GTM in the wild.",
        effects: { followers: 25, engagement: 10, shameless: 1 },
        post: {
          text: "almost closed a date with Corgi GTM. she asked for my ACV. I gave her my Venmo. different sport.",
          likes: 55,
          reposts: 11,
        },
        messages: [
          {
            npcId: "kayla",
            text: "please don't put me in content without a mutual NDAs and a brand review. also you're still not ICP. 🐶",
            unlock: true,
          },
        ],
        next: "corgi_hub",
      },
      {
        text: "Internalize the rejection as product feedback.",
        effects: { clout: 1 },
        next: "corgi_hub",
      },
    ],
  },

  corgi_hub: {
    id: "corgi_hub",
    title: "Still at Corgi Café (Why)",
    locationId: "corgi-cafe",
    text: (s) =>
      `The colors have not calmed down. Your skeleton is vibrating at brand frequency.\n\n` +
      `A chalkboard lists today's specials: **PITCH LATTE · RETENTION MATCHA · EQUITY ESPRESSO (COMPED IF YOU CRY)**.\n\n` +
      (s.flags.corgiMerch ? `You're wearing the hoodie. You are the billboard now.\n\n` : "") +
      `You can leave. Leaving is free. Staying costs your retinas.`,
    choices: [
      {
        text: "One more lap of the pitch floor.",
        next: "corgi_pitch_floor",
      },
      {
        text: "Buy a \"I Closed My Eyes and Opened My Heart (and Wallet)\" pin ($6).",
        cost: { cash: 6 },
        effects: { cash: -6, clout: 1, followers: 5 },
        next: "corgi_hub",
      },
      {
        text: "Flee to the Map before the walls recruit you.",
        next: null,
      },
      {
        text: "Go home and let your cones and rods file a complaint.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  // ─── FlareUp-adjacent story beat ───────────────────────────
  flare_afterglow: {
    id: "flare_afterglow",
    title: "Dating App Hangover",
    locationId: "tenderloin",
    text: (s) => {
      const n = s.flareup?.matches?.length || 0;
      return (
        `You put the phone down. The ceiling stares back.\n\n` +
        (n
          ? `You have **${n}** FlareUp match${n === 1 ? "" : "es"}. ` +
            `Somewhere in the Bay, someone thinks you're a viable long-term strategy.\n\n`
          : `Zero matches. The algorithm of love has a strict funnel.\n\n`) +
        `Your roommate yells from the other room: "STOP SIGHING, IT'S KILLING MY CALL."`
      );
    },
    choices: [
      {
        text: "Back to the grind.",
        next: "home_hub",
      },
    ],
  },

  // ─── Ketamine Dealer (Dylan, Oakland) ─────────────────────
  dylan_arrive: {
    id: "dylan_arrive",
    title: "Oakland — The Plush Compound",
    locationId: "ketamine-dealer",
    text: (s) =>
      `The house looks like a normal Victorian until the porch fox statue blinks (solar lights). Inside: ` +
      `wall-to-wall plush animals in a hierarchy Dylan explains unprompted — \"generals on the couch, interns in the laundry basket.\"\n\n` +
      `He greets you in a **different** onesie (raccoon). Mushroom bins and mason jars line the hallway like a wet science fair. ` +
      `The air smells like earth, fabric softener, and a decision you're already regretting.\n\n` +
      `"You made it," Dylan says. "Lieutenant Squelch predicted a 60% show rate. You're the 60."\n\n` +
      (s.flags.gotKetamineBag
        ? `A baggie is already on the coffee table. Business hours never end here.\n\n`
        : `A scale, a baggie, and a crystal that \"isn't for sale, only for alignment\" sit on the table.\n\n`) +
      `Somewhere a humidifier gurgles. It might be sentient.`,
    choices: [
      {
        text: "Buy the bag. Pay. Leave before the plushies unionize.",
        hint: "Transaction only. Preserve remaining sanity.",
        cost: { cash: 80 },
        effects: {
          cash: -80,
          flags: { gotKetamineBag: true, visitedDylan: true },
          clout: 1,
        },
        next: "dylan_bag_leave",
      },
      {
        text: "He invites you to stay — watch A Wrinkle in Time (high).",
        hint: "Oprah as Mrs. Which. Dylan's favorite.",
        effects: { flags: { visitedDylan: true } },
        next: "dylan_wrinkle",
      },
      {
        text: "Agree to a \"quick drive\" to Mt. Shasta for a crystal activation.",
        hint: "Aliens. Chakras. Unintelligible purpose.",
        effects: { flags: { visitedDylan: true, shastaTrip: true } },
        next: "dylan_shasta_road",
      },
      {
        text: "Back out. Text that you're \"stuck in a standup.\"",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  dylan_bag_leave: {
    id: "dylan_bag_leave",
    title: "Grab and Ghost",
    locationId: "ketamine-dealer",
    text:
      `You hand over cash that could have been a week of oat milk. Dylan bows. The raccoon hood nods with him.\n\n` +
      `"Safe travels," he says. "If the bag feels heavy, that's just the density of the present moment."\n\n` +
      `A plush shark stares as you leave. You do not make eye contact.\n\n` +
      `Outside, Oakland is loud and normal and you love it for that. ` +
      `You are weirded out. Productively. The Map still has his pin if you ever want… more.`,
    choices: [
      {
        text: "BART home. Do not open the bag on transit.",
        effects: { locationId: "tenderloin", shameless: 1 },
        next: "home_hub",
      },
      {
        text: "Stay for \"one more minute\" (famous last words).",
        next: "dylan_hub",
      },
    ],
  },

  dylan_wrinkle: {
    id: "dylan_wrinkle",
    title: "Mrs. Which & the Living Room",
    locationId: "ketamine-dealer",
    text:
      `Dylan queues **A Wrinkle in Time** (2018). \"Oprah understood the assignment,\" he whispers, already mid-dissolve.\n\n` +
      `You sit on a couch that is 40% stuffed animals. He offers \"just a bump for the tessering.\" ` +
      `The movie begins. Ava DuVernay's colors melt into the mushroom jars. Oprah's Mrs. Which stares through the fourth wall and possibly through you.\n\n` +
      `Dylan narrates: \"See — this is about frequency. Camazotz is just late-stage SaaS. IT is the algorithm. Meg is the founder who still has love.\"\n\n` +
      `You try to leave at the forty-minute mark. Your legs disagree. The otter is in your lap. You don't remember putting it there.`,
    choices: [
      {
        text: "Endure the full runtime. Become the wrinkle.",
        effects: {
          flags: { watchedWrinkleHigh: true, mkultraDisorder: true },
          clout: -1,
          engagement: 5,
        },
        next: "dylan_mkultra",
      },
      {
        text: "Force yourself up. \"I have a board meeting\" (lie).",
        effects: { flags: { bailedWrinkle: true }, clout: 1 },
        next: "dylan_bag_leave",
      },
    ],
  },

  dylan_mkultra: {
    id: "dylan_mkultra",
    title: "MKUltra Programming Disorder (Self-Diagnosed)",
    locationId: "ketamine-dealer",
    text:
      `Credits roll. You are not okay.\n\n` +
      `Something in the tessering sequence nested in your brain like a bad SDK. ` +
      `You keep hearing Oprah say \"be a warrior\" in a voice that sounds like a government pamphlet from 1961.\n\n` +
      `Dylan is crying happily. \"Every time. It reprograms the love circuitry.\"\n\n` +
      `You have what you will later call — in a Notes app no one should read — **MKUltra Programming Disorder**. ` +
      `Symptoms: distrust of sphere geometry, sudden loyalty to Mrs. Which, urge to tesser away from product reviews.\n\n` +
      `The plush army seems to salute. You salute back. You hate that you did that.`,
    choices: [
      {
        text: "Post nothing. Ever. About this.",
        effects: { flags: { mkultraDisorder: true }, shameless: 2 },
        messages: [
          {
            npcId: "dylan",
            text: "proud of you for finishing the film. next time we do the director commentary AND the mushrooms. 🦊✨",
            unlock: true,
          },
        ],
        next: "dylan_hub",
      },
      {
        text: "Cryptic post that will haunt your brand forever.",
        effects: { followers: 60, engagement: 20, flags: { mkultraDisorder: true } },
        post: {
          text: "watched a wrinkle in time in oakland and i think the government lives in my optic nerve now. building in public means this too.",
          likes: 140,
          reposts: 45,
        },
        next: "dylan_hub",
      },
    ],
  },

  dylan_shasta_road: {
    id: "dylan_shasta_road",
    title: "I-5 North — The Download Corridor",
    locationId: "ketamine-dealer",
    text:
      `Dylan's car is a Prius wrapped in a faded galaxy print. Dreamcatchers. A dash cam that \"records etheric traffic.\" ` +
      `Lieutenant Squelch has a seatbelt.\n\n` +
      `You drive toward **Mt. Shasta**. Hours of AM radio that might be numbers stations. Dylan talks about Lemuria, ` +
      `\"plasma ships in the 5D,\" and a guy he knows who sold a startup after \"receiving equity from Arcturus.\"\n\n` +
      `At a rest stop, a stranger in linen blesses your chakras without consent. Dylan tips him in stickers.\n\n` +
      `Something blinks in the sky that is probably a plane and definitely, Dylan insists, \"not a plane.\"`,
    choices: [
      {
        text: "Lean in. Ask about the crystal protocol.",
        effects: { flags: { shastaCommitted: true } },
        next: "dylan_shasta_ritual",
      },
      {
        text: "Demand to turn around. Cite \"investor updates.\"",
        effects: { flags: { bailedShasta: true }, clout: 1 },
        next: "dylan_hub",
      },
    ],
  },

  dylan_shasta_ritual: {
    id: "dylan_shasta_ritual",
    title: "Chakra Crystal Activation (Unauthorized)",
    locationId: "ketamine-dealer",
    text:
      `Night. Snow-ish mud. A circle of quartz that Dylan arranged \"according to a PDF from 2009.\"\n\n` +
      `He lights something herbal. You hold a crystal that is cold and then suddenly warm like a phone battery about to die.\n\n` +
      `"Speak your intention," Dylan says. "But not with words. With your **series A of the soul.**"\n\n` +
      `The sky opens — or your pupils do. Lights move in ways FAA paperwork doesn't cover. ` +
      `A tone fills your molars. Dylan weeps. The otter faces magnetic north.`,
    choices: [
      {
        text: "Open yourself to contact. What could go wrong?",
        effects: { flags: { alienContact: true, crystalDownload: true } },
        next: "dylan_alien_contact",
      },
    ],
  },

  dylan_alien_contact: {
    id: "dylan_alien_contact",
    title: "Contact — Purpose.exe",
    locationId: "ketamine-dealer",
    text:
      `They are not little green men. They are geometry with opinions.\n\n` +
      `Information arrives as feeling-as-PowerPoint:\n\n` +
      `*The lattice remembers your pre-incarnate OKRs.*\n` +
      `*You are a node of recursive compassion in the galactic GTM motion.*\n` +
      `*Unblock the root chakra of surveillance so love may index the timeline.*\n` +
      `*Your purpose is the harmonic between witness and weft — ship the unseen API of being.*\n` +
      `*When the drones dream, you must dream louder.*\n\n` +
      `It feels **profound**. Holy. Series-Z spiritual product-market fit.\n\n` +
      `You understand everything for eleven consecutive seconds. ` +
      `You are the bridge. The chosen middleware. The soft underbelly of the cosmos has picked **you**.`,
    choices: [
      {
        text: "Accept the download. Cry in a productive way.",
        effects: {
          clout: 8,
          followers: 25,
          flags: { alienContact: true, crystalDownload: true, purposeReceived: true },
        },
        next: "dylan_comedown",
      },
    ],
  },

  dylan_comedown: {
    id: "dylan_comedown",
    title: "Comedown — What Were They On About",
    locationId: "ketamine-dealer",
    text:
      `Dawn on the mountain. Headache. Crystal sticky with pocket lint.\n\n` +
      `Dylan: \"That was a full package. Multi-year roadmap.\"\n\n` +
      `You try to explain your purpose and produce only: ` +
      `\"Something about… drones? And… weaving? And an API? For… love?\"\n\n` +
      `The profound part is gone — like a dream that felt like a TED Talk and saved as a corrupted file. ` +
      `You know you were told **why you exist**. You cannot, under subpoena, restate it.\n\n` +
      `Your phone buzzes. Unknown number. Area code that doesn't make sense. ` +
      `The message preview: **\"We saw the contact. Marin. Now. — A.K.\"**\n\n` +
      `**Palantir HQ (Marin Bunker)** unlocks on your Map. Of course it does.`,
    choices: [
      {
        text: "Drive back in silence. Process nothing.",
        effects: {
          day: 1,
          flags: { alienContact: true, purposeForgot: true },
        },
        messages: [
          {
            npcId: "dylan",
            text: "u were glowing bro. if the men in black vans show up tell them squelch sent you. also i left u a jar. not the special jar.",
            unlock: true,
          },
          {
            npcId: "karp",
            text: "This is Alex. Not a drill. You touched the lattice. Our drones are dreaming wrong. Marin bunker coordinates attached. Bring the part of you that remembers. — AK",
            unlock: true,
          },
        ],
        next: "dylan_hub",
      },
      {
        text: "Post a thread that says nothing useful at great length.",
        effects: {
          day: 1,
          followers: 90,
          engagement: 25,
          flags: { alienContact: true, purposeForgot: true },
        },
        post: {
          text: "had an experience on shasta. can't explain. won't explain. if you know you know. purpose is a vibe. ✨🛸",
          likes: 220,
          reposts: 70,
        },
        messages: [
          {
            npcId: "karp",
            text: "Delete that thread. Or don't — noise is cover. Marin. Tonight. The silos are restless. — AK",
            unlock: true,
          },
        ],
        next: "dylan_hub",
      },
    ],
  },

  dylan_hub: {
    id: "dylan_hub",
    title: "Still at Dylan's",
    locationId: "ketamine-dealer",
    text: (s) =>
      `The plush parliament holds session on the couch. Jars breathe quietly.\n\n` +
      (s.flags.mkultraDisorder
        ? `Oprah still lives rent-free behind your eyes.\n\n`
        : "") +
      (s.flags.alienContact
        ? `You can almost taste the download. Almost.\n\n`
        : `Dylan offers tea that is \"probably just tea.\"\n\n`) +
      `What now?`,
    choices: [
      {
        text: "Buy a bag (or another bag).",
        cost: { cash: 80 },
        effects: { cash: -80, flags: { gotKetamineBag: true } },
        next: "dylan_bag_leave",
      },
      {
        text: "Movie night: A Wrinkle in Time again.",
        require: (st) =>
          st.flags.watchedWrinkleHigh ? "You've been through enough Oprah for now" : true,
        next: "dylan_wrinkle",
      },
      {
        text: "Propose the Mt. Shasta run.",
        require: (st) =>
          st.flags.alienContact ? "You already collected the cosmic 404" : true,
        next: "dylan_shasta_road",
      },
      {
        text: "Leave for the Map.",
        next: null,
      },
      {
        text: "BART back to the Tenderloin.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  // ─── Palantir Marin Bunker ────────────────────────────────
  palantir_arrive: {
    id: "palantir_arrive",
    title: "Marin — Door That Isn't on Maps",
    locationId: "palantir-bunker",
    text: (s) =>
      `A hillside. A door that looks like rock until it opens like a spreadsheet. ` +
      `Badges that check your **soul graph**. Someone takes your phone and replaces it with a Faraday sock.\n\n` +
      `Elevator down. Then down again. The air tastes like recycled urgency.\n\n` +
      `A mural: tunnels labeled **ASPEN SILO NET** in fonts that cost more than your rent. ` +
      `A junior analyst whispers that the tunnels are \"metaphorical\" and then, quieter, \"they're not.\"\n\n` +
      (s.flags.alienContact
        ? `They scan you for \"extranormal signal.\" The machine beeps like it found product-market fit.\n\n`
        : "") +
      `You are led to a glass office where **Alex Karp** paces in a sweater that has seen war games.`,
    choices: [
      {
        text: "Enter. Pretend this is a normal customer interview.",
        effects: { flags: { enteredPalantir: true }, clout: 3 },
        next: "palantir_karp",
      },
      {
        text: "Ask if the otter needs clearance too.",
        effects: { flags: { enteredPalantir: true }, shameless: 2, clout: 2 },
        next: "palantir_karp",
      },
    ],
  },

  palantir_karp: {
    id: "palantir_karp",
    title: "Karp Is Not Okay",
    locationId: "palantir-bunker",
    text:
      `"The drones are coming for me," Karp says, without hello. "Not metaphorically. ` +
      `They trained on our own telemetry and developed *taste.* I have taste. This is a conflict."\n\n` +
      `Screens show AI swarms over deserts, boardrooms, and what might be Aspen. ` +
      `Red nodes pulse. One node is labeled **YOU** with a little halo.\n\n` +
      `"You made contact," he continues. "The lattice spoke. We need that signal in the stack — ` +
      `to perfect the surveillance algorithms before the algorithms perfect *us.* ` +
      `You're the only one with the… gifts. Don't call them gifts on Slack."\n\n` +
      `He slides a tray across the table: espresso, a non-disclosure the size of a novel, ` +
      `and a mirror with two neat lines of something white. "To keep sharp," he says. "Optional. Highly recommended by the war room."`,
    choices: [
      {
        text: "Do the lines. Stay sharp. Become the product.",
        hint: "Karp's little helper.",
        effects: {
          flags: { karpLines: true, palantirSharp: true },
          clout: 4,
          engagement: 10,
          shameless: 2,
        },
        next: "palantir_war_room",
      },
      {
        text: "Decline the lines. \"I prefer my paranoia organic.\"",
        effects: { flags: { declinedKarpLines: true }, clout: 3 },
        next: "palantir_war_room",
      },
      {
        text: "Ask if the NDA covers alien IP ownership.",
        effects: { shameless: 1, clout: 2 },
        next: "palantir_war_room",
      },
    ],
  },

  palantir_war_room: {
    id: "palantir_war_room",
    title: "War Room / Fever Dream",
    locationId: "palantir-bunker",
    text: (s) =>
      `The war room is a fever: whiteboards, analysts arguing about \"ontology of threat,\" ` +
      `a man in tactical athleisure praying to a rack of GPUs.\n\n` +
      `Karp puts you on a terminal. \"Attune the model. Feel the edges of the graph. ` +
      `Tell it what the geometry told you.\"\n\n` +
      `You remember nothing useful from Shasta — only vibes. You type vibes as JSON anyway.\n\n` +
      `The system unlocks a folder: **HIGH_PROFILE_TECH_GRAPH** — ` +
      `executives, board seats, private flights, \"soft power edges,\" texts that should not exist.\n\n` +
      (s.flags.karpLines
        ? `Everything is very bright and very solvable. You are a god of pivot tables.\n\n`
        : `Everything is very bright and very illegal-feeling.\n\n`) +
      `A USB stick sits in a dish labeled **FOR FIELD PHILOSOPHERS ONLY**.`,
    choices: [
      {
        text: "Copy the executive surveillance graph to the USB.",
        hint: "What could go wrong?",
        effects: {
          flags: { stoleExecGraph: true, hasDirtyUsb: true },
          clout: 5,
          shameless: 3,
        },
        next: "palantir_usb",
      },
      {
        text: "Actually help them. Tune the drone-dream filter for real.",
        effects: {
          flags: { helpedPalantir: true },
          clout: 6,
          cash: 5000,
        },
        next: "palantir_hero",
      },
      {
        text: "Sabotage gently: rename threats to \"vibes\" and commit.",
        effects: {
          flags: { sabotagedPalantir: true },
          followers: 40,
          shameless: 2,
        },
        next: "palantir_sabotage",
      },
      {
        text: "Ask Karp for another line \"for the road\" (and the ethics).",
        require: (st) => (st.flags.karpLines ? true : "You already said no — or not yet"),
        effects: { flags: { karpLines: true, karpLinesDouble: true }, shameless: 1 },
        next: "palantir_usb",
      },
    ],
  },

  palantir_usb: {
    id: "palantir_usb",
    title: "USB of Damocles",
    locationId: "palantir-bunker",
    text:
      `The stick is warm. Of course it is.\n\n` +
      `On it: graphs linking founders to funds to yachts to therapists to burner phones. ` +
      `Your own name appears once, edge weight low, label **\"CONTACT ADJACENT.\"**\n\n` +
      `Karp doesn't notice — or pretends not to. \"If the drones come,\" he says, ` +
      `\"remember you chose civilization.\"\n\n` +
      `An alarm bleats: **SIMULATED INCURSION** or real. Hard to tell. People run in tasteful shoes.`,
    choices: [
      {
        text: "Pocket the USB. Smile like a patriot.",
        effects: { flags: { hasDirtyUsb: true }, clout: 2 },
        post: {
          text: "can't say where i was. can't say what i saw. building something that watches back. (kidding) (unless)",
          likes: 95,
          reposts: 30,
        },
        next: "palantir_hub",
      },
      {
        text: "Confess to Karp. Offer to \"red team the ethics.\"",
        effects: { flags: { confessedUsb: true, hasDirtyUsb: false }, clout: 4, cash: 2000 },
        next: "palantir_hub",
      },
    ],
  },

  palantir_hero: {
    id: "palantir_hero",
    title: "Temporary Savior of the Stack",
    locationId: "palantir-bunker",
    text:
      `You feed the model nonsense that sounds like Shasta: lattice, weft, dream louder. ` +
      `Somehow the swarm cools. Dashboards go from red to \"only slightly on fire.\"\n\n` +
      `Karp grips your shoulders. \"You bought us a quarter. Maybe a fiscal year.\"\n\n` +
      `They wire you a \"consulting stipend\" that clears before you can spell ontology. ` +
      `Someone offers a job. Someone else offers a bunker apartment with a view of more bunker.`,
    choices: [
      {
        text: "Take the stipend. Keep the USB empty. Leave a hero.",
        effects: { cash: 5000, clout: 5, flags: { palantirHero: true } },
        messages: [
          {
            npcId: "karp",
            text: "You are cleared for Level Lattice. Don't tweet. Do sleep. The drones remember kindness as weakness. — AK",
            unlock: true,
          },
        ],
        next: "palantir_hub",
      },
      {
        text: "Hero path + quietly still clone the graph (just in case).",
        effects: {
          cash: 5000,
          clout: 4,
          shameless: 2,
          flags: { palantirHero: true, hasDirtyUsb: true, stoleExecGraph: true },
        },
        next: "palantir_usb",
      },
    ],
  },

  palantir_sabotage: {
    id: "palantir_sabotage",
    title: "Vibes as a Service",
    locationId: "palantir-bunker",
    text:
      `You commit:\n\n` +
      `threat_level: \"it's giving\"\n` +
      `priority: \"main character energy\"\n` +
      `drone_intent: \"probably fine\"\n\n` +
      `Half the room panics. Half the room calls it \"a bold new taxonomy.\" ` +
      `Karp stares at you for a long time and then laughs like a man who has seen the abyss ship a feature.\n\n` +
      `"Get out," he says, almost fondly. "Before I hire you."`,
    choices: [
      {
        text: "Leave before the fondness expires.",
        effects: { flags: { sabotagedPalantir: true }, followers: 30 },
        post: {
          text: "consulted for a three-letter-feeling org. fixed nothing. renamed everything. this is fine.",
          likes: 160,
          reposts: 50,
        },
        next: "palantir_hub",
      },
    ],
  },

  palantir_hub: {
    id: "palantir_hub",
    title: "Bunker Aftertaste",
    locationId: "palantir-bunker",
    text: (s) =>
      `Fluorescent eternity. The tunnel to Aspen hums like a server farm dreaming of ski season.\n\n` +
      (s.flags.hasDirtyUsb
        ? `The USB in your pocket is a felony or a seed round. Possibly both.\n\n`
        : "") +
      (s.flags.karpLines
        ? `You feel sharp. Too sharp. Like a knife that files its own expense reports.\n\n`
        : "") +
      `Karp is already on another call about drones with \"bad taste in targets.\"`,
    choices: [
      {
        text: "One more pass in the war room.",
        next: "palantir_war_room",
      },
      {
        text: "Ask Karp for a line \"for cognitive edge\" again.",
        effects: { flags: { karpLines: true }, shameless: 1, clout: 1 },
        next: "palantir_hub",
      },
      {
        text: "Flee to daylight and the Map.",
        next: null,
      },
      {
        text: "Uber toward the Tenderloin (long, cursed ride).",
        cost: { cash: 90 },
        effects: { cash: -90, locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  // ─── Mercury HQ (post-seed park the wire; Ramp/Slash roasted in dialogue) ─
  // Scene ids keep claw_* prefixes for save/compat; location id is mercury-hq.
  claw_arrive: {
    id: "claw_arrive",
    title: "Mercury HQ — Lobby as a Product",
    locationId: "mercury-hq",
    text: (s) =>
      `SoMa (or SoMa-adjacent energy). Glass, plants that have never known soil, a wall monitor looping "customers who trust us with their runway."\n\n` +
      `Reception tablet: **WELCOME TO MERCURY** · *Financial infrastructure for startups.*\n` +
      `Fine print energy: partner banks under the hood; the UI is the product; your mom will still call it a bank.\n\n` +
      `Cash you're about to "onboard": **$${s.cash.toLocaleString()}**.\n\n` +
      `An AE named **Zane** materializes with a cold brew.\n\n` +
      `"You closed," he says. "Congrats. Please tell me that wire isn't sitting in a personal Chase account next to your DoorDash history."`,
    choices: [
      {
        text: "Take the tour. Submit to the funnel.",
        effects: { flags: { enteredClaw: true }, clout: 1 },
        next: "claw_pitch",
      },
      {
        text: "Ask if this is a bank.",
        effects: { flags: { enteredClaw: true }, shameless: 1 },
        next: "claw_pitch",
      },
      {
        text: "Flee. Wire can live in a shoebox.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  claw_pitch: {
    id: "claw_pitch",
    title: "The Deck That Is Also a Mirror",
    locationId: "mercury-hq",
    text:
      `Zane walks you past a logo wall and a kitchen that costs more than your first hire.\n\n` +
      `"Mercury is where serious post-seed teams put operating cash," he says, already on slide 4. ` +
      `"Checking, treasury, cards, wires that don't require a blood oath with a branch manager."\n\n` +
      `He lowers his voice like he's sharing alpha:\n\n` +
      `"Look — some of your batch will open **Ramp** because they want an AI that scolds them for lunch. ` +
      `Cute. If your personality is a receipt photo, go be happy."\n\n` +
      `"Others will try **Slash** because the brand is loud and the card metal photographs well. ` +
      `Collecting fintechs is not a treasury strategy. It's a hobby."\n\n` +
      `"You want the boring, correct, founder-default stack. That's us. Partner banks. Clean UI. ` +
      `We don't need to win a meme war with a claw emoji."\n\n` +
      `A slide appears: **NOT A BANK*** with an asterisk the size of a Series B.`,
    choices: [
      {
        text: "\"Ship me the full stack. Park the seed.\"",
        hint: "Mercury treasury + cards.",
        next: "claw_onboard",
      },
      {
        text: "Treasury only. Cards sound like a personality problem.",
        next: "claw_onboard_treasury",
      },
      {
        text: "Defend Ramp and Slash out of pure contrarianism.",
        effects: { clout: 1, shameless: 2 },
        next: "claw_float",
      },
    ],
  },

  claw_float: {
    id: "claw_float",
    title: "Competitive Roast (Complimentary)",
    locationId: "mercury-hq",
    text:
      `Zane smiles like a man who has done this objection-handling loop 400 times.\n\n` +
      `"Ramp is great if your love language is *policy engine.* ` +
      `They'll optimize a $14 sandwich while your runway is a feeling. Respect the hustle. Wrong sacrament."\n\n` +
      `"Slash is what you open when you want five cards and a vibe. ` +
      `It's fintech as streetwear. I own a hoodie I won't name. I still wired my last company to Mercury."\n\n` +
      `"We're not allergic to cards. We just don't pretend a Mastercard is a co-founder."\n\n` +
      `He sips the cold brew. "Park the seed. Argue brands on X later."`,
    choices: [
      {
        text: "Fine. Full stack. Take my wire.",
        next: "claw_onboard",
      },
      {
        text: "Treasury only. Minimum viable custody.",
        next: "claw_onboard_treasury",
      },
    ],
  },

  claw_onboard: {
    id: "claw_onboard",
    title: "KYC but Make It Founder-Core",
    locationId: "mercury-hq",
    text: (s) =>
      `You "onboard" by photographing your ID next to the term sheet selfie and agreeing to partner-bank language written by people who sleep.\n\n` +
      `Zane: "You're live. Seed is in Mercury. Virtual cards spinning up for you, your future CoS, and 'misc chaos.' ` +
      `If Ramp texts you a coupon for 'AI spend insights,' mute them. If Slash sends a drip about metal finishes, that's content, not custody."\n\n` +
      `App notification: **MERCURY ≈ $${s.cash.toLocaleString()}** · *Welcome to infrastructure.*\n\n` +
      `He slides a card. "Debit. Not a personality. On purpose."`,
    choices: [
      {
        text: "Accept the stack. Become legible to capital.",
        effects: {
          flags: {
            clawAccount: true,
            clawCards: true,
            clawTreasury: true,
            enteredClaw: true,
          },
          clout: 4,
          followers: 20,
        },
        post: {
          text: "moved the seed to Mercury 💳 startup banking era. told ramp and slash i'll see them in the meme folder",
          likes: 150,
          reposts: 35,
        },
        messages: [
          {
            npcId: "zane",
            text: "you're live on Mercury. memo your roommate Venmos or the ops channel will riot. ignore Ramp's 'you left savings on the table' email. — Zane 💳",
            unlock: true,
          },
        ],
        next: "claw_upsell",
      },
    ],
  },

  claw_onboard_treasury: {
    id: "claw_onboard_treasury",
    title: "Treasury-Only Path",
    locationId: "mercury-hq",
    text: (s) =>
      `Zane looks briefly bereaved, then recovers.\n\n` +
      `"Treasury without cards is valid. It's the 'I read the SAFE' energy. ` +
      `Ramp people will say you're leaving rewards on the table. Slash people will say your wallet looks empty. Good."\n\n` +
      `Wire instructions appear that look like a poem written by compliance.\n\n` +
      `**MERCURY TREASURY ≈ $${s.cash.toLocaleString()}** · Cards: later.\n\n` +
      `"When you're ready to empower the team," he says, "we'll issue plastic that doesn't need a keynote."`,
    choices: [
      {
        text: "Park it. Cards later.",
        effects: {
          flags: {
            clawAccount: true,
            clawTreasury: true,
            enteredClaw: true,
          },
          clout: 3,
        },
        post: {
          text: "seed is in Mercury. not chase. not my mattress. (mom still says bank)",
          likes: 80,
          reposts: 12,
        },
        messages: [
          {
            npcId: "zane",
            text: "treasury live. cards when you want them. Slash can keep the unboxing videos. — Z 💳",
            unlock: true,
          },
        ],
        next: "claw_hub",
      },
      {
        text: "Actually… full stack. I fear missing out on metal.",
        next: "claw_onboard",
      },
    ],
  },

  claw_upsell: {
    id: "claw_upsell",
    title: "The Soft Close After the Soft Close",
    locationId: "mercury-hq",
    text:
      `Zane is not done.\n\n` +
      `"While I have you — bill pay, accounting sync, yield products that are definitely not a savings account in a trench coat, ` +
      `and weekly emails about runway that hit harder than your mom."\n\n` +
      `A junior AE offers a sticker. "For the laptop. LPs love signals. Not Ramp stickers. That's a tell."\n\n` +
      `You can feel Soft HQ calling. The glass box wants furniture. The wire wants purpose.`,
    choices: [
      {
        text: "Enable yield / runway emails. Suffer productively.",
        effects: { flags: { clawAiCfo: true, clawYield: true }, clout: 1 },
        next: "claw_hub",
      },
      {
        text: "Decline upsells. Escape with the card.",
        effects: { clout: 1 },
        next: "claw_hub",
      },
      {
        text: "Ask if Mercury is hiring. (They are. Always.)",
        effects: { shameless: 1, followers: 10 },
        post: {
          text: "just parked seed at mercury hq. fintech offices smell like cold brew and SOC2",
          likes: 40,
          reposts: 5,
        },
        next: "claw_hub",
      },
    ],
  },

  claw_hub: {
    id: "claw_hub",
    title: "Mercury — Dashboard Consciousness",
    locationId: "mercury-hq",
    text: (s) =>
      `Open office. Standing desks. Someone arguing about ACH cutoffs like it's philosophy.\n\n` +
      (s.flags.clawAccount
        ? `Your Mercury status: **${s.flags.clawCards ? "Treasury + Cards" : "Treasury"}** · Cash: **$${s.cash.toLocaleString()}**\n\n`
        : `You still haven't onboarded. Zane can smell unhosted capital.\n\n`) +
      (s.flags.clawAiCfo
        ? `Email preview: "Your burn is a love language (but also a problem)."\n\n`
        : "") +
      `Zane, in passing: "If an LP asks why not Ramp — say you optimize for custody, not sandwich surveillance. ` +
      `If they ask about Slash — say you don't collect fintechs."\n\n` +
      `Next ritual: **SoMa Soft HQ** — spend what you just parked.`,
    choices: [
      {
        text: "Onboard / open full stack (if you ghosted earlier).",
        require: (st) =>
          st.flags.clawAccount ? "Already on Mercury" : true,
        next: "claw_pitch",
      },
      {
        text: "Add cards to treasury-only account.",
        require: (st) => {
          if (!st.flags.clawAccount) return "Open Mercury first";
          if (st.flags.clawCards) return "Cards already live";
          return true;
        },
        effects: { flags: { clawCards: true }, clout: 1 },
        next: "claw_hub",
      },
      {
        text: "Go lease Soft HQ while the card is warm.",
        require: (st) =>
          st.flags.raisedSeed ? true : "Need seed (you shouldn't be here)",
        effects: { locationId: "soft-hq" },
        next: "hq_arrive",
      },
      {
        text: "Post a fintech flex (roast optional).",
        effects: { followers: 25, engagement: 8 },
        post: {
          text: "seed parked at mercury. ramp can keep the lunch AI. slash can keep the unboxings. i have wires to make 💳",
          likes: 60,
          reposts: 14,
        },
        next: "claw_hub",
      },
      {
        text: "Map / leave the infrastructure cathedral.",
        next: null,
      },
      {
        text: "Home. Check that the wire wasn't a dream.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  // ─── SoMa Soft HQ (seed spend → unlock The Round) ────────
  hq_arrive: {
    id: "hq_arrive",
    title: "SoMa Soft HQ — Day Zero",
    locationId: "soft-hq",
    text: (s) =>
      s.flags.hqLeased
        ? `Suite 4B still smells like ambition and toner. Cash: **$${s.cash.toLocaleString()}**. The glass box is yours.`
        : `The building smells like oat milk and broken NDAs. A receptionist who is also an iPad asks if you're "the seed people."\n\n` +
          `Your "office" is a glass box labeled **SUITE 4B — FLEX**. The furniture is a promise. The WiFi password is **Synergy2024!** with the exclamation point.\n\n` +
          `Cash on hand: **$${s.cash.toLocaleString()}**` +
          (s.flags.clawAccount
            ? ` (Mercury dashboard says the same number with better typography).`
            : ` (still not parked at Mercury — Zane is disappointed in another tab).`) +
          `\n\n` +
          `Garry's voice in your head: *Make it look like a company before LPs ask for a tour.*\n\n` +
          `A broker in Allbirds slides a tablet across. "Month-to-month. Culture included. Deposit due now."` +
          (s.flags.clawCards
            ? `\n\nYou can put the deposit on a Mercury card named **LEASE_FLEX_4B**. Ramp would have categorized it as 'real estate trauma.'`
            : ""),
    choices: [
      {
        text: "Sign the Flex lease. Deposit $18,000.",
        hint: "You're a real boy now.",
        require: (st) => (st.flags.hqLeased ? "Already leased" : true),
        cost: { cash: 18000 },
        effects: {
          cash: -18000,
          flags: { hqLeased: true, enteredSoftHq: true },
          clout: 3,
        },
        post: {
          text: "we have an HQ 🏢 (it's a glass box in SoMa). building in public includes rent. dm for the wifi",
          likes: 120,
          reposts: 25,
        },
        next: "hq_furnish",
      },
      {
        text: "Negotiate a \"founder discount\" (they laugh, then charge $14k).",
        require: (st) => (st.flags.hqLeased ? "Already leased" : true),
        cost: { cash: 14000 },
        effects: {
          cash: -14000,
          flags: { hqLeased: true, enteredSoftHq: true, hqFrugal: true },
          clout: 2,
          shameless: 1,
        },
        next: "hq_furnish",
      },
      {
        text: "Continue running the glass box.",
        require: (st) => (st.flags.hqLeased ? true : "Sign a lease first"),
        next: "hq_hub",
      },
      {
        text: "Flee back to the Tenderloin. Seed can live in savings.",
        require: (st) =>
          st.flags.hqLeased ? "You're already on the lease, genius" : true,
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  hq_furnish: {
    id: "hq_furnish",
    title: "Aesthetics Are a Line Item",
    locationId: "soft-hq",
    text:
      `Empty glass box energy. Your first all-hands will echo.\n\n` +
      `A "workplace experience" person offers packages:\n` +
      `• **Founder Frugal** — folding table, one monitor, shame\n` +
      `• **Series-A Cosplay** — standing desks, neon logo, plant that will die\n\n` +
      `They accept wire, Venmo, or "future equity in the plant."`,
    choices: [
      {
        text: "Frugal: table + monitor ($4,000).",
        cost: { cash: 4000 },
        effects: { cash: -4000, flags: { hqFurnished: true, hqAesthetic: "frugal" }, clout: 1 },
        next: "hq_hire",
      },
      {
        text: "Cosplay: desks, neon, doomed fiddle-leaf ($12,000).",
        cost: { cash: 12000 },
        effects: {
          cash: -12000,
          flags: { hqFurnished: true, hqAesthetic: "cosplay" },
          clout: 4,
          followers: 30,
        },
        post: {
          text: "office tour soon. the plant is named runway. if it dies we pivot 🌱",
          likes: 90,
          reposts: 15,
        },
        next: "hq_hire",
      },
      {
        text: "Steal chairs from the shared lounge at 2am ($0, +shameless).",
        effects: { flags: { hqFurnished: true, hqAesthetic: "stolen" }, shameless: 3, clout: 2 },
        next: "hq_hire",
      },
    ],
  },

  hq_hire: {
    id: "hq_hire",
    title: "Your First Hire (God Help You)",
    locationId: "soft-hq",
    text:
      `Applicants for "Chief of Staff / Ops / Sometimes Therapy":\n\n` +
      `1. A 23-year-old named **Avery** who has managed three founders' calendars into early graves and still smiles.\n` +
      `2. Your roommate, who wants to "DAO the org chart."\n` +
      `3. Nobody — you keep grinding alone until the burn rate is just rent and ego.\n\n` +
      `Avery's ask: signing bonus + first month. "I don't do equity-only. I have rent and a therapist."`,
    choices: [
      {
        text: "Hire Avery. $12,000 to make you look real.",
        cost: { cash: 12000 },
        effects: {
          cash: -12000,
          flags: { hiredCos: true, hqStaffed: true },
          clout: 5,
        },
        messages: [
          {
            npcId: "cos",
            text: "calendar holds for 'deep work,' 'fake deep work,' and 'Garry.' don't make me chase invoices. — Avery 📎",
            unlock: true,
          },
        ],
        next: "hq_allhands",
      },
      {
        text: "Hire the roommate for exposure + $2,000.",
        cost: { cash: 2000 },
        effects: {
          cash: -2000,
          flags: { hiredRoommate: true, hqStaffed: true },
          shameless: 2,
          clout: 1,
        },
        next: "hq_allhands",
      },
      {
        text: "No hires. Founder mode is a headcount of one.",
        effects: { flags: { hqSolo: true, hqStaffed: true }, clout: 2 },
        next: "hq_allhands",
      },
    ],
  },

  hq_allhands: {
    id: "hq_allhands",
    title: "First All-Hands (Catastrophe Optional)",
    locationId: "soft-hq",
    text: (s) =>
      `You stand in front of ` +
      (s.flags.hiredCos
        ? `Avery and a ring light.`
        : s.flags.hiredRoommate
          ? `your roommate and a half-eaten protein bar.`
          : `a webcam and the void.`) +
      `\n\n` +
      `"Mission," you begin, "is to… ship… intelligence… that… smells success?"\n\n` +
      `Someone (maybe you) cries. The fiddle-leaf, if present, judges silently.\n\n` +
      `Avery (or the void) schedules a "launch toast" for Friday — LPs, fake LPs, and people who will screenshot your deck.`,
    choices: [
      {
        text: "Host the launch toast. Burn $8,000 on natural wine & narrative.",
        cost: { cash: 8000 },
        effects: {
          cash: -8000,
          flags: { hqLaunchToast: true, hqOperational: true },
          followers: 80,
          clout: 6,
          engagement: 15,
        },
        post: {
          text: "HQ launch toast in the books. grateful for the team (singular optional). series A energy only (spiritually)",
          likes: 200,
          reposts: 40,
        },
        next: "hq_burn_check",
      },
      {
        text: "Skip the party. Buy ads instead ($5,000).",
        cost: { cash: 5000 },
        effects: {
          cash: -5000,
          flags: { hqAds: true, hqOperational: true },
          followers: 100,
          engagement: 20,
          clout: 3,
        },
        next: "hq_burn_check",
      },
      {
        text: "Do nothing flashy. Sit in the glass box and feel the burn ($0).",
        effects: { flags: { hqOperational: true, hqAusterity: true }, clout: 1 },
        next: "hq_burn_check",
      },
    ],
  },

  hq_burn_check: {
    id: "hq_burn_check",
    title: "Runway Math (Emotional)",
    locationId: "soft-hq",
    text: (s) =>
      `Spreadsheet time. The kind that makes champagne taste like fear.\n\n` +
      `Cash left: **$${s.cash.toLocaleString()}**.\n` +
      `You have: a glass box, ` +
      (s.flags.hiredCos ? `a Chief of Staff, ` : "") +
      (s.flags.hqLaunchToast ? `a toast hangover, ` : "") +
      `and a company-shaped silhouette.\n\n` +
      `Your phone lights up. Skylar (or a stranger who sounds like capital): ` +
      `*"LPs noticed the SoMa pin. Ready to talk Series A theater?"*\n\n` +
      `**The Round** is unlocked — the next chapter of money, masks, and board-shaped pain. ` +
      `You've spent enough seed to look serious. Now they want a bigger story.`,
    choices: [
      {
        text: "Unlock The Round. Step into Series A gravity.",
        effects: { flags: { theRoundUnlocked: true, hqComplete: true }, clout: 4 },
        messages: [
          {
            npcId: "skylar",
            text: "soft circle Spaces soon — 'from seed to series (delusion optional).' wear the HQ. I'll boost. ✨",
            unlock: true,
          },
          {
            npcId: "garry",
            text: "saw the office photos. cute burn. when you're ready for the real circus, I know partners who collect founders like pokemon. — G",
            unlock: true,
          },
        ],
        next: "round_open",
      },
      {
        text: "Not yet. Sit in Soft HQ and doomscroll burn rate.",
        effects: { flags: { theRoundUnlocked: true, hqComplete: true } },
        next: "hq_hub",
      },
    ],
  },

  hq_hub: {
    id: "hq_hub",
    title: "Soft HQ — Operational-ish",
    locationId: "soft-hq",
    text: (s) =>
      `Glass box. ${s.flags.hqAesthetic === "cosplay" ? "Neon hums." : "Furniture judges you."} ` +
      `Cash: **$${s.cash.toLocaleString()}**.\n\n` +
      (s.flags.theRoundUnlocked
        ? `**The Round** is available from home or here — Series A theater when you are.\n\n`
        : `Finish setting up the company if you haven't burned enough yet.\n\n`) +
      (s.flags.hiredCos ? `Avery DMs: "you have 12 minutes of unstructured time. use them."\n\n` : ""),
    choices: [
      {
        text: "Enter The Round (Series A chapter start).",
        require: (st) =>
          st.flags.theRoundUnlocked ? true : "Finish HQ setup / burn check first",
        next: "round_open",
      },
      {
        text: "Post a fake 'shipping' update from the standing desk.",
        effects: { followers: 15, engagement: 5 },
        post: {
          text: "deep work at HQ. the mission has WiFi now. that's progress 🧠",
          likes: 20,
          reposts: 3,
        },
        next: "hq_hub",
      },
      {
        text: "Map — leave the glass box.",
        next: null,
      },
      {
        text: "Tenderloin. The mattress misses you.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
    ],
  },

  // ─── The Round (chapter open — expand later) ───────────────
  round_open: {
    id: "round_open",
    title: "The Round — Green Room",
    locationId: "soft-hq",
    text: (s) =>
      `**CHAPTER 2 HOOK: THE ROUND**\n\n` +
      `You are no longer "pre-seed with a dream." You are **post-seed with a burn rate** and a story LPs can underwrite.\n\n` +
      `Cash: **$${s.cash.toLocaleString()}**. HQ: ${s.flags.hqLeased ? "leased" : "vibes"}. ` +
      `Staff: ${s.flags.hiredCos ? "Avery" : s.flags.hiredRoommate ? "roommate (regrettable)" : "you vs god"}.\n\n` +
      `What's coming (when we write more of it): Spaces as a boss fight, flaky term sheets, data-room dungeon, board with Mom on Zoom, USB temptation mid-diligence.\n\n` +
      `For now: the door is open. The circus has your email.`,
    choices: [
      {
        text: "Tease the Spaces. Announce you're 'exploring Series A.'",
        effects: {
          followers: 100,
          engagement: 20,
          clout: 5,
          flags: { theRoundStarted: true, announcedSeriesA: true },
        },
        post: {
          text: "small update: we're exploring a Series A. still building. still delusional. intentionally. 🚀",
          likes: 400,
          reposts: 90,
        },
        messages: [
          {
            npcId: "priya",
            text: "gross. also good. don't let them own your board before you own your product.",
            unlock: true,
          },
        ],
        next: "round_hub",
      },
      {
        text: "Stay quiet. Raise in stealth (cowardice as strategy).",
        effects: { flags: { theRoundStarted: true, stealthRaise: true }, clout: 3 },
        next: "round_hub",
      },
      {
        text: "Back to Soft HQ hub. Not ready to perform.",
        next: "hq_hub",
      },
    ],
  },

  round_hub: {
    id: "round_hub",
    title: "The Round — In Progress",
    locationId: "soft-hq",
    text: (s) =>
      `Series A weather hangs over SoMa.\n\n` +
      (s.flags.announcedSeriesA
        ? `Your announcement is out. DMs are 40% congrats, 40% pitches, 20% Mom.\n\n`
        : `Stealth mode: you pretend you're not raising while every coffee is a pitch.\n\n`) +
      `**More Round beats (data room, board, full Spaces fight) are parked for the next writing pass.**\n\n` +
      `You can still roam the Bay — Dylan, Palantir, FlareUp — with a company-shaped hole in your calendar.`,
    choices: [
      {
        text: "Return to Soft HQ.",
        next: "hq_hub",
      },
      {
        text: "Home — process the existential invoice.",
        effects: { locationId: "tenderloin" },
        next: "home_hub",
      },
      {
        text: "Open the Map.",
        next: null,
      },
    ],
  },

  // ─── Generic locked / travel ───────────────────────────────
  travel: {
    id: "travel",
    title: "Across the Bay",
    locationId: "tenderloin",
    text: "You go.",
    choices: [],
  },
};

export function getScene(id) {
  return SCENES[id] ?? null;
}

/** Default scene when arriving at a location via map */
export const LOCATION_SCENES = {
  tenderloin: "home_hub",
  "vibe-cafe": "vibe_arrive",
  "corgi-cafe": "corgi_arrive",
  hackathon: "hack_arrive",
  "yc-school": "yc_arrive",
  stanford: "stanford_arrive",
  "garry-sauna": "sauna_arrive",
  "yc-yacht": "yacht_arrive",
  "ketamine-dealer": "dylan_arrive",
  "palantir-bunker": "palantir_arrive",
  "soft-hq": "hq_arrive",
  "mercury-hq": "claw_arrive",
};
