/**
 * Text-message NPCs and thread templates.
 * Threads can be unlocked by flags or scene effects.
 */

export const NPCS = {
  garry: {
    id: "garry",
    name: "Garry Chan",
    emoji: "🧖",
    role: "Gay VC (alleged)",
    gender: "male",
    spicy: true,
  },
  jordan: {
    id: "jordan",
    name: "Jordan \"Dealflow\"",
    emoji: "🍸",
    role: "Associate who DMs at 1am",
    gender: "male",
    spicy: true,
  },
  skylar: {
    id: "skylar",
    name: "Skylar",
    emoji: "✨",
    role: "Influencer / maybe cofounder",
    gender: "female",
    spicy: false,
  },
  priya: {
    id: "priya",
    name: "Priya",
    emoji: "🚀",
    role: "YC batch rival / flirty competitor",
    gender: "female",
    spicy: false,
  },
  mom: {
    id: "mom",
    name: "Mom",
    emoji: "📞",
    role: "Reality check",
    gender: "female",
    spicy: false,
  },
  roommate: {
    id: "roommate",
    name: "Roommate (owes rent)",
    emoji: "🧦",
    role: "Human liability",
    gender: "unknown",
    spicy: false,
  },
  jules: {
    id: "jules",
    name: "Jules",
    emoji: "🌙",
    role: "FlareUp match · vibes ops",
    gender: "fluid",
    spicy: false,
  },
  marisol: {
    id: "marisol",
    name: "Marisol",
    emoji: "👩‍👧",
    role: "FlareUp match · single mom",
    gender: "female",
    spicy: false,
  },
  vanessa: {
    id: "vanessa",
    name: "Vanessa",
    emoji: "🍷",
    role: "FlareUp match · ready to settle",
    gender: "female",
    spicy: false,
  },
  kayla: {
    id: "kayla",
    name: "Kayla (Corgi GTM)",
    emoji: "🐶",
    role: "Unreachable FlareUp crush",
    gender: "female",
    spicy: false,
  },
  dylan: {
    id: "dylan",
    name: "Dylan (K)",
    emoji: "🦊",
    role: "Oakland ketamine / mushroom guy",
    gender: "male",
    spicy: false,
  },
  karp: {
    id: "karp",
    name: "Alex Karp",
    emoji: "👁️",
    role: "Paranoid bunker CEO (alleged)",
    gender: "male",
    spicy: false,
  },
  cos: {
    id: "cos",
    name: "Avery (Chief of Staff)",
    emoji: "📎",
    role: "23, already dead inside, runs your calendar",
    gender: "unknown",
    spicy: false,
  },
  zane: {
    id: "zane",
    name: "Zane (Mercury)",
    emoji: "💳",
    role: "Startup banking AE",
    gender: "male",
    spicy: false,
  },
  thiel: {
    id: "thiel",
    name: "Peter Thiel",
    emoji: "♟️",
    role: "Series A gravity · heard about your bunker performance",
    gender: "male",
    spicy: true,
  },
};

/**
 * Opening / unlockable thread seeds.
 * each message: { from: 'npc'|'player', text, replies?: [{ text, effects?, next? }] }
 */
export function buildInitialThreads(character) {
  const threads = {
    roommate: {
      npcId: "roommate",
      unread: true,
      messages: [
        {
          from: "npc",
          text: "yo the landlord left a note that was mostly emojis of fire. also I ate your last protein bar. building a DAO for chores btw",
        },
      ],
      replyOptions: [
        {
          text: "Pay half my rent in \"exposure\" and we call it even.",
          effects: { clout: 1 },
          npcReply: "bro that's actually how we got the last couch",
        },
        {
          text: "Touch my protein bar again and I pivot to landlord tech.",
          effects: { shameless: 0 },
          npcReply: "hostile work environment 😭 I'll Venmo you $3 when the chain confirms",
        },
        {
          text: "Can you keep it down? I'm recording a founder monologue.",
          effects: { followers: 5 },
          npcReply: "I left a review: 2 stars, mic quality mid, ambition high",
        },
      ],
    },
    mom: {
      npcId: "mom",
      unread: true,
      messages: [
        {
          from: "npc",
          text:
            character.id === "csmajor" || character.id === "mathgenius"
              ? "Beta, your cousin just got a job at Google. Real job. With benefits. Not \"followers.\""
              : "Honey, are you eating? Your LinkedIn still says \"building something big\" which sounds like unemployed.",
        },
      ],
      replyOptions: [
        {
          text: "I'm pre-seed, Mom. That's basically employed.",
          effects: { clout: 1 },
          npcReply: "I Googled pre-seed. It means broke with a logo.",
        },
        {
          text: "When I IPO I'll buy you a house. A modest one. In Ohio.",
          effects: { hustle: 0 },
          npcReply: "I'll keep the guest room ready. And a resume template.",
        },
        {
          text: "Love you. Can't talk — fundraising.",
          effects: {},
          npcReply: "Fundraising from whom? The roommate who ate your food?",
        },
      ],
    },
  };

  // Male characters get early Garry heat
  if (character.gender === "male") {
    threads.garry = {
      npcId: "garry",
      unread: false,
      locked: true,
      messages: [],
      replyOptions: [],
    };
  }

  threads.skylar = {
    npcId: "skylar",
    unread: false,
    locked: true,
    messages: [],
    replyOptions: [],
  };

  threads.priya = {
    npcId: "priya",
    unread: false,
    locked: true,
    messages: [],
    replyOptions: [],
  };

  threads.jordan = {
    npcId: "jordan",
    unread: false,
    locked: true,
    messages: [],
    replyOptions: [],
  };

  // FlareUp matches + later arcs unlock these
  for (const id of ["jules", "marisol", "vanessa", "kayla", "dylan", "karp", "cos", "zane", "thiel"]) {
    threads[id] = {
      npcId: id,
      unread: false,
      locked: true,
      messages: [],
      replyOptions: [],
    };
  }

  return threads;
}

/** Flavor texts Garry might send depending on character */
export function garryPickupLines(character) {
  const base = [
    "saw your X. raw. unfiltered. like a term sheet before legal ruins it 🔥",
    "quick q: ever done pair programming… without the computers?",
    "my yacht has a whiteboard. and champagne. and terrible WiFi so we'd HAVE to focus on each other",
  ];
  if (character.id === "mathgenius") {
    return [
      ...base,
      "your IMO proof was elegant. want to optimize something… lower-dimensional? 😏",
      "come to the sauna. heat helps NP-hard problems. also helps shirts come off.",
    ];
  }
  if (character.id === "csmajor") {
    return [
      ...base,
      "your GitHub is clean. your apartment? we'll workshop that. over drinks.",
      "let's put our heads together on some coding problems. on my yacht. towel provided (optional).",
    ];
  }
  // tech bro
  return [
    ...base,
    "king. that Patagonia is doing numbers. want a warm intro… and a hotter sauna?",
    "let's go put our heads together on some coding problems on my yacht? 🛥️ I bring the cap table, you bring the vibes",
  ];
}

export function skylarOpeners(character) {
  return [
    "ok your last selfie was mid but the hustle caption slapped. collab?",
    "I'm at Vibe Café. if you buy me a cortado I'll pretend your deck is Series A ready",
    character.gender === "female"
      ? "founder sisters need to stick together. also I need a +1 for a weird yacht thing"
      : "are you the one with 0 followers and infinite confidence? that's hot. dangerous. mostly hot.",
  ];
}
