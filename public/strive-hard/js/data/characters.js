/** Playable founders for Strive Hard */

export const CHARACTERS = [
  {
    id: "techbro",
    name: "Chad Flexington",
    age: 24,
    gender: "male",
    emoji: "🧢",
    handle: "chadbuilds",
    title: "Tech Bro Founder",
    blurb:
      "Dropped out of a state school, owns three Patagonias, says \"let's circle back\" unironically. Starting capital: dad's Amex and pure delusion.",
    traits: ["Grindset", "Allergic to equity", "Yacht-curious"],
    stats: { charisma: 7, code: 3, hustle: 8, shameless: 9 },
    bio: "ex-FAANG (food delivery app, 3 months) · building in public · DMs open for angels 😇",
  },
  {
    id: "cmo",
    name: "Mei Chen",
    age: 29,
    gender: "female",
    emoji: "💼",
    handle: "meimarkets",
    title: "Asian Woman CMO",
    blurb:
      "Former growth lead at a Series B that pivoted into a hoodie brand. Can turn a napkin sketch into a Series A deck. Will not be \"one of the guys.\"",
    traits: ["Narrative control", "Boardroom killer", "Side-eye main"],
    stats: { charisma: 9, code: 4, hustle: 8, shameless: 6 },
    bio: "CMO of vibes · brand is a moat · not your diversity hire",
  },
  {
    id: "csmajor",
    name: "Raj Patel",
    age: 20,
    gender: "male",
    emoji: "💻",
    handle: "rajships",
    title: "Indian CS Major",
    blurb:
      "Stanford-adjacent energy without the tuition receipt. Can ship an MVP overnight. Cannot tell if the VC is investing or flirting. (Usually both.)",
    traits: ["Ships fast", "Leetcode PTSD", "Auntie pressure"],
    stats: { charisma: 5, code: 9, hustle: 7, shameless: 4 },
    bio: "CS undergrad · full-stack · building AGI in a studio apartment (literally)",
  },
  {
    id: "mathgenius",
    name: "Wei Zhang",
    age: 18,
    gender: "male",
    emoji: "🧮",
    handle: "weiproves",
    title: "Chinese Math Genius",
    blurb:
      "IMO gold, legally can order a drink in zero states. Thinks product-market fit is a theorem. The sauna invites will confuse him deeply.",
    traits: ["Proves theorems", "Socially buffering", "Uncanny focus"],
    stats: { charisma: 3, code: 10, hustle: 6, shameless: 2 },
    bio: "18 · math olympiad · optimizing loss functions & life choices",
  },
];

export function getCharacter(id) {
  return CHARACTERS.find((c) => c.id === id) ?? null;
}
