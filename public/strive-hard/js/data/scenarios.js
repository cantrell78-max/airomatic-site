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
      `Your **weapon is the iHype** (yes, that's a Pear product). Open the **Map** to roam the Bay. Check **Texts** when love, lust, or limited partners slide in. Post **Selfies** when the vibes demand content.\n\n` +
      `Start small. Vibe Code Café. A hackathon. Eventually: Startup School, Stanford, a certain VC's sauna, and a yacht that is absolutely not a metaphor.\n\n` +
      `You have $47 and a face for… something.`,
    choices: [
      {
        text: "Hit Vibe Code Café — caffeine is a strategy.",
        effects: { locationId: "vibe-cafe" },
        next: "vibe_arrive",
      },
      {
        text: "Walk into a hackathon like you own the WiFi.",
        effects: { locationId: "hackathon" },
        next: "hack_arrive",
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
    text: (s) =>
      `Back in the box you call an apartment. Day ${s.day}. ` +
      `@${s.character.handle} sits at ${s.followers} followers.\n\n` +
      `The roommate is doing yoga on a stolen yoga mat while on a \"strategy call.\"\n\n` +
      `What now? (Use the Map on your phone, or pick a move.)`,
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
        messages: [
          // Day-gated unlocks handled in effects via game engine hooks
        ],
        effects: { flags: { dayRolled: true } },
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
      `Champagne, founders, two people who definitely work in \"crypto adjacent wellness.\" A DJ plays a remix of a song about compound interest.\n\n` +
      (s.flags.metGarry
        ? `Garry waves from the upper deck, linen shirt unbuttoned to a legally interesting degree.\n\n`
        : `You don't know anyone. Perfect. Blank account energy, yacht edition.\n\n`) +
      `Priya is here too, somehow. She mouths: *don't do anything I wouldn't livestream.*`,
    choices: [
      {
        text: "Work the room. Collect handles like Pokémon.",
        effects: { followers: 80, clout: 5, engagement: 15 },
        post: {
          text: "on a yacht called Diligence. nobody is diligent. everybody is raising. send help or wire transfers.",
          likes: 200,
          reposts: 45,
        },
        next: "yacht_peak",
      },
      {
        text: "Find Garry. Talk terms before the champagne talks first.",
        require: (st) => st.flags.metGarry || st.flags.yachtInvite || st.flags.metJordan,
        effects: { clout: 4 },
        next: "yacht_garry",
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
          flags: { raisedSeed: true, endingTrack: "money" },
        },
        post: {
          text: "small announcement: we raised a seed 🌱 more soon. grateful for believers (and boats).",
          likes: 500,
          reposts: 120,
        },
        next: "yacht_peak",
      },
      {
        text: "\"Mentorship sounds expensive. Show me the SAFE.\"",
        effects: {
          cash: 75000,
          clout: 10,
          flags: { raisedSeed: true, endingTrack: "careful" },
        },
        post: {
          text: "negotiated on a yacht. still standing. still solvent. SAFE signed with eyes open 👀",
          likes: 300,
          reposts: 60,
        },
        next: "yacht_peak",
      },
      {
        text: "Decline the money. Keep the story.",
        effects: { clout: 5, followers: 100, flags: { endingTrack: "story" } },
        post: {
          text: "turned down a check on a yacht. either peak integrity or peak stupidity. thread soon.",
          likes: 400,
          reposts: 90,
        },
        next: "yacht_peak",
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
      (s.flags.raisedSeed
        ? `You have money in the bank that isn't roommate IOUs. The game is changing.\n\n`
        : `You're still mostly broke, but the room knows your face. Sometimes that's the real raise.\n\n`) +
      `This is only the beginning of Strive Hard. The Tenderloin mattress still exists. So does the blank-page fear. But the blank X account? Dead and buried under a pile of likes.`,
    choices: [
      {
        text: "Post the victory (or beautiful failure) selfie.",
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
        effects: { clout: 2, day: 1 },
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
        ? `You raised. The internet noticed. Garry definitely noticed.\n\n`
        : `You didn't take every check — or every bait. The timeline still knows your name.\n\n`) +
      `More scenarios (Series A chaos, board drama, influencer wars, the IPO that isn't) can be written next — and you said you'd help. Good.\n\n` +
      `For now: keep posting, keep roaming, keep surviving the texts.`,
    choices: [
      {
        text: "Continue free roam — the Bay isn't done with you.",
        next: "home_hub",
      },
      {
        text: "Sleep. Dream of liquidity events.",
        effects: { day: 1 },
        next: "new_day",
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
  hackathon: "hack_arrive",
  "yc-school": "yc_arrive",
  stanford: "stanford_arrive",
  "garry-sauna": "sauna_arrive",
  "yc-yacht": "yacht_arrive",
};
