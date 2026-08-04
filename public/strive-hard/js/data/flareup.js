/**
 * FlareUp — parody dating app for SF founders.
 * Profiles are comedy stereotypes. Match rules live on each card.
 */

export const FLAREUP_PROFILES = [
  {
    id: "kayla_gtm",
    name: "Kayla",
    age: 27,
    emoji: "🐶",
    job: "GTM @ Corgi",
    distance: "0.4 mi · SoMa (she's never here)",
    tagline: "synergies only ✨ no low-agency energy",
    bio:
      "GTM at Corgi 🐶 (yes, THAT Corgi). Previously 3 exits in my head.\n\n" +
      "Looking for: founder-mode only. Series A+ preferred; pre-seed if your narrative is post-Series-B. " +
      "Must have: distribution mindset, founder-market fit with MY lifestyle, and a calendar that respects my ICP (me).\n\n" +
      "Don't message if you:\n" +
      "• can't articulate your wedge in one breath\n" +
      "• still say \"users\" instead of \"pipeline\"\n" +
      "• own more than one hoodie\n" +
      "• haven't closed a loop this week\n\n" +
      "Love languages: closed-won deals, branded merch, being right in the #gtm channel.\n\n" +
      "If you're not optimizing for LTV, we're not optimizing for us 💅",
    badges: ["Corgi alum-vibes", "Unreachable", "Speaks in OKRs"],
    interests: ["PLG", "ABM", "cold outbound as a love language", "corgi merch drops"],
    // Always rejects — standards are a moat
    matchChance: 0,
    matchMessage:
      "Kayla left you on Read. Then muted. Then blocked your entire funnel.",
    noMatchMessage:
      "Kayla viewed your profile for 0.3s and marked you \"not ICP.\" A SDR will not follow up.",
    effectsOnLike: { engagement: 1, flags: { likedKayla: true } },
    effectsOnMatch: {},
  },
  {
    id: "jules",
    name: "Jules",
    age: 31,
    emoji: "🌙",
    job: "Community / \"vibes ops\"",
    distance: "1.2 mi · Mission",
    tagline: "living my truth · also looking for yours (softly)",
    bio:
      "Hi — Jules. She/they on LinkedIn, he/him in group chats, and \"babe\" if the energy is right. " +
      "Transitioning careers more aggressively than anything else this quarter.\n\n" +
      "I do community for a crypto-adjacent wellness DAO that is \"not crypto\" on the website. " +
      "Weekends: farmers market, breathwork, explaining my gender to Uber drivers who didn't ask.\n\n" +
      "Looking for someone secure enough not to need a FAQ. " +
      "If you need a PowerPoint on my vibe, we're already misaligned.\n\n" +
      "Green flags: emotional range, good skin, zero \"just curious\" openers.\n" +
      "Red flags: deadnaming energy, \"so what were you before,\" and people who only date their own Series.",
    badges: ["Mission soft-launch", "Pronouns: it's complicated", "Gentle chaos"],
    interests: ["somatics", "group therapy as date idea", "subtle flex tattoos"],
    matchChance: 0.55,
    matchMessage:
      "Jules matched ✨ \"ok your bio is mid but the ambition reads authentic. coffee that isn't a pitch?\"",
    noMatchMessage:
      "Jules swiped left with a blessing and a resource list you didn't ask for.",
    effectsOnLike: { flags: { likedJules: true } },
    effectsOnMatch: { clout: 1, followers: 8, flags: { matchedJules: true } },
    unlockThread: {
      npcId: "jules",
      text: "hey — matched on FlareUp. if this is another founder using dating as user research, say so now 🌙",
    },
  },
  {
    id: "marisol",
    name: "Marisol",
    age: 34,
    emoji: "👩‍👧",
    job: "Ops lead · single mom of 1 (actually 2 if you count my ex)",
    distance: "3.1 mi · Daly City-ish",
    tagline: "man up or swipe left. I'm serious.",
    bio:
      "Single mom. Full-time job. Part-time patience.\n\n" +
      "If your idea of \"busy\" is a hackathon, we're not the same. " +
      "I need someone who shows up — school pickup energy, not \"I'll async you later.\"\n\n" +
      "Looking for a partner, not a project. " +
      "If you still live with three roommates and call it \"runway,\" grow up first.\n\n" +
      "My kid comes first. Always. " +
      "If that scares you, good — self-select out.\n\n" +
      "Dealbreakers: flaking, crypto lectures at dinner, calling yourself \"daddy\" unprompted.\n" +
      "Bonus points: car that fits a car seat, job that isn't a whitepaper, spine.",
    badges: ["No games", "Man-up required", "Real life DLC"],
    interests: ["Target runs", "stable WiFi", "men who text back"],
    matchChance: 0.4,
    matchMessage:
      "Marisol matched. \"Don't waste my time. First date is coffee where there's parking.\"",
    noMatchMessage:
      "Marisol passed. Her notes app says: \"boy, not ready.\"",
    effectsOnLike: { flags: { likedMarisol: true } },
    effectsOnMatch: { clout: 2, flags: { matchedMarisol: true } },
    // Higher chance if player has some cash/clout (\"man up\")
    matchBonus: (state) => {
      let b = 0;
      if (state.cash >= 100) b += 0.15;
      if (state.clout >= 5) b += 0.15;
      if (state.flags.raisedSeed) b += 0.2;
      if (state.character?.gender === "male") b += 0.05;
      return b;
    },
    unlockThread: {
      npcId: "marisol",
      text: "you matched. cool. prove you're not another SF boy who disappears when someone needs a ride at 7am.",
    },
  },
  {
    id: "vanessa",
    name: "Vanessa",
    age: 39,
    emoji: "🍷",
    job: "\"Between roles\" · ex-FAANG-adjacent",
    distance: "2.0 mi · Pacific Heights (or a story about it)",
    tagline: "ready to settle down. I need a real man.",
    bio:
      "39. Finally done with situationships, \"soft launches,\" and guys who are \"figuring out their brand.\"\n\n" +
      "Past relationships (highlight reel):\n" +
      "• the DJ who lived in his van (\"freedom\")\n" +
      "• the poly polycule that was mostly one guy and a shared calendar\n" +
      "• the founder who ghosted after Demo Day (he raised; I got a sticker)\n" +
      "• three men named Chad (statistically significant)\n\n" +
      "I want partnership. A house plant that survives. Someone who doesn't need a thread to process commitment.\n\n" +
      "I NEED A REAL MAN. " +
      "Not a boy with a newsletter. Not a \"king\" who can't split the check. " +
      "If you're still \"building the vision,\" build it on your own time.\n\n" +
      "Romance language: consistency. Love language: showing up without a deck.",
    badges: ["Nearing 40", "Battle-tested", "No more Chads"],
    interests: ["wine that isn't a fundraise", "emotional availability", "equity that vests"],
    matchChance: 0.45,
    matchMessage:
      "Vanessa matched. \"Don't be cute. Be consistent. Dinner this week — you book it.\"",
    noMatchMessage:
      "Vanessa archived you under \"more of the same.\" Harsh. Fair.",
    effectsOnLike: { flags: { likedVanessa: true } },
    effectsOnMatch: { clout: 1, followers: 12, flags: { matchedVanessa: true } },
    matchBonus: (state) => {
      let b = 0;
      if (state.day >= 3) b += 0.1;
      if (state.followers >= 50) b += 0.1;
      if ((state.stats?.hustle || 0) >= 1 || state.clout >= 4) b += 0.1;
      return b;
    },
    unlockThread: {
      npcId: "vanessa",
      text: "FlareUp worked for once. I'm free Thursday. If you cancel I'll write a Medium post about modern men.",
    },
  },
];

export function getFlareProfile(id) {
  return FLAREUP_PROFILES.find((p) => p.id === id) ?? null;
}
