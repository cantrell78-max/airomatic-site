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
];

export function getLocation(id) {
  return LOCATIONS.find((l) => l.id === id) ?? null;
}

export function isLocationUnlocked(loc, state) {
  if (state.day < loc.unlockDay) return false;
  if (loc.id === "yc-yacht") {
    // Invite, late chaos, or raised enough noise
    return (
      state.flags.yachtInvite ||
      state.flags.metGarry ||
      state.day >= 5 ||
      state.followers >= 150
    );
  }
  return true;
}
