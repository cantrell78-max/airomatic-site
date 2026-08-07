/** Map locations — SF founder circuit */

export const LOCATIONS = [
  {
    id: "tenderloin",
    name: "Tenderloin Studio",
    short: "Home",
    emoji: "🏠",
    desc: "One room, three roommates, zero natural light. Your empire's HQ.",
    unlockDay: 1,
    energyCost: 0,
    tags: ["home", "safe"],
  },
  {
    id: "vibe-cafe",
    name: "Vibe Code Café",
    short: "Vibe Café",
    emoji: "☕",
    desc: "Oat milk lattes, mechanical keyboards, and people \"shipping\" Notion docs.",
    unlockDay: 1,
    energyCost: 1,
    tags: ["social", "work"],
  },
  {
    id: "corgi-cafe",
    name: "Corgi Café",
    short: "Corgi Café",
    emoji: "🐶",
    desc: "Official-adjacent hangout of the Corgi cult. Neon. Merch. Medical-grade branding.",
    unlockDay: 1,
    energyCost: 1,
    tags: ["social", "surreal", "corgi"],
  },
  {
    id: "hackathon",
    name: "All-Nighter Hackathon",
    short: "Hackathon",
    emoji: "⚡",
    desc: "48 hours, free Red Bull, judges who only care about demo polish.",
    unlockDay: 1,
    energyCost: 2,
    tags: ["build", "compete"],
  },
  {
    id: "yc-school",
    name: "Y Combinator Startup School",
    short: "YC School",
    emoji: "🏫",
    desc: "Free Zoom advice that costs your entire personality. Batch energy.",
    unlockDay: 2,
    energyCost: 1,
    tags: ["learn", "network"],
  },
  {
    id: "stanford",
    name: "Stanford University",
    short: "Stanford",
    emoji: "🌲",
    desc: "Palm trees, trust funds, and \"we're just exploring a few ideas.\"",
    unlockDay: 2,
    energyCost: 2,
    tags: ["campus", "talent"],
  },
  {
    id: "garry-sauna",
    name: "Garry Chan's Sauna",
    short: "Garry's Sauna",
    emoji: "🧖",
    desc: "Invitation-only. Towels optional. Term sheets, allegedly.",
    unlockDay: 3,
    energyCost: 2,
    tags: ["vc", "spicy"],
  },
  {
    id: "yc-yacht",
    name: "YC SUS Yacht Afterparty",
    short: "SUS Yacht",
    emoji: "🛥️",
    desc: "\"Founder mixer\" on a boat that lists slightly to the right. Dress code: irony.",
    unlockDay: 4,
    energyCost: 2,
    tags: ["party", "network", "spicy"],
  },
  {
    id: "ketamine-dealer",
    name: "Ketamine Dealer",
    short: "K Dealer",
    emoji: "🦊",
    desc: "Oakland. Plush toys. Mushroom bins. Furry onesie optional (for him, not optional).",
    unlockDay: 1,
    energyCost: 2,
    tags: ["oakland", "weird", "k"],
  },
  {
    id: "palantir-bunker",
    name: "Palantir HQ (Marin Bunker)",
    short: "Palantir",
    emoji: "👁️",
    desc: "Secret underground campus. Tunnels to Aspen silos. Alex Karp is not okay.",
    unlockDay: 1,
    energyCost: 3,
    tags: ["marin", "surveillance", "fever-dream"],
  },
  {
    id: "soft-hq",
    name: "SoMa Soft HQ",
    short: "Soft HQ",
    emoji: "🏢",
    desc: "Hot-desk cathedral. Where seed money goes to die stylishly. Unlocks after you raise.",
    unlockDay: 1,
    energyCost: 1,
    tags: ["soma", "office", "seed-spend"],
  },
  {
    id: "mercury-hq",
    name: "Mercury HQ",
    short: "Mercury",
    emoji: "💳",
    desc: "Where post-seed founders park the wire. Startup banking, partner banks under the hood.",
    unlockDay: 1,
    energyCost: 1,
    tags: ["soma", "fintech", "treasury"],
  },
];

export function getLocation(id) {
  return LOCATIONS.find((l) => l.id === id) ?? null;
}

/** Human-readable lock reason for Map UI (null if unlocked) */
export function locationLockReason(loc, state) {
  if (isLocationUnlocked(loc, state)) return null;
  if (loc.id === "yc-yacht") return "Invite only (or day 5 chaos)";
  if (loc.id === "ketamine-dealer") return "Meet Dylan on the yacht first";
  if (loc.id === "palantir-bunker") return "Requires alien contact (Mt. Shasta)";
  if (loc.id === "soft-hq") return "Raise a seed on the yacht first";
  if (loc.id === "mercury-hq") return "Raise a seed — then park it at Mercury";
  if (state.day < loc.unlockDay) return `Unlocks day ${loc.unlockDay}+`;
  return "Locked";
}

export function isLocationUnlocked(loc, state) {
  if (state.day < loc.unlockDay) return false;
  if (loc.id === "yc-yacht") {
    return (
      state.flags.yachtInvite ||
      state.flags.metGarry ||
      state.day >= 5 ||
      state.followers >= 150
    );
  }
  if (loc.id === "ketamine-dealer") {
    return !!state.flags.metDylan;
  }
  if (loc.id === "palantir-bunker") {
    return !!state.flags.alienContact;
  }
  if (loc.id === "soft-hq") {
    return !!state.flags.raisedSeed;
  }
  if (loc.id === "mercury-hq") {
    return !!state.flags.raisedSeed;
  }
  return true;
}
