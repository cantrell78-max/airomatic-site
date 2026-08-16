import { getCharacter } from "./data/characters.js";
import { buildInitialThreads } from "./data/messages.js";

const SAVE_KEY = "strive-hard-save-v1";

export function createNewState(characterId) {
  const character = getCharacter(characterId);
  if (!character) throw new Error("Unknown character");

  return {
    version: 1,
    character,
    day: 1,
    cash: 47,
    clout: 0,
    followers: 0,
    following: 12,
    engagement: 0, // 0–100-ish score
    locationId: "tenderloin",
    sceneId: "intro",
    energy: 5,
    flags: {},
    posts: [],
    threads: buildInitialThreads(character),
    visitedLocations: ["tenderloin"],
    unreadTexts: 2, // roommate + mom
    stats: { ...character.stats },
    flareup: {
      liked: [],
      passed: [],
      matches: [],
      // queue order = profile ids remaining to show; null = rebuild from all
      queue: null,
    },
    translatedScenes: {},
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Rehydrate character reference integrity
    if (data.character?.id) {
      const fresh = getCharacter(data.character.id);
      if (fresh) data.character = { ...fresh, ...data.character };
    }
    // Migrate older saves
    if (!data.flareup) {
      data.flareup = { liked: [], passed: [], matches: [], queue: null };
    }
    if (!data.visitedLocations) data.visitedLocations = ["tenderloin"];
    if (!data.threads) data.threads = buildInitialThreads(data.character);
    // Ensure core + arc NPC threads exist (incl. priya/skylar — older saves sometimes omitted)
    for (const id of [
      "roommate",
      "mom",
      "garry",
      "jordan",
      "skylar",
      "priya",
      "jules",
      "marisol",
      "vanessa",
      "kayla",
      "dylan",
      "karp",
      "cos",
      "zane",
      "thiel",
      "lex",
      "wei",
      "swarm",
      "prema",
    ]) {
      if (!data.threads[id]) {
        data.threads[id] = {
          npcId: id,
          unread: false,
          locked: true,
          messages: [],
          replyOptions: [],
        };
      }
    }
    // Normalize corrupt / partial threads (prevents blank Messages crash)
    for (const [id, t] of Object.entries(data.threads)) {
      if (!t || typeof t !== "object") {
        data.threads[id] = {
          npcId: id,
          unread: false,
          locked: true,
          messages: [],
          replyOptions: [],
        };
        continue;
      }
      if (!Array.isArray(t.messages)) t.messages = [];
      // Coerce any non-string message bodies (bad saves)
      t.messages = t.messages
        .filter((m) => m && (m.text != null || m.from))
        .map((m) => ({
          from: m.from === "player" ? "player" : "npc",
          text: typeof m.text === "string" ? m.text : String(m.text ?? ""),
        }));
      if (!Array.isArray(t.replyOptions)) t.replyOptions = [];
      if (!t.npcId) t.npcId = id;
      // Existing unlocked Priya with no replies (older saves): offer quick replies once
      if (
        id === "priya" &&
        !t.locked &&
        t.replyOptions.length === 0 &&
        !t.priyaRepliesMigrated
      ) {
        t.replyOptions = defaultRepliesFor("priya");
        t.priyaRepliesMigrated = true;
      }
    }
    if (!data.translatedScenes) data.translatedScenes = {};
    // Claw → Mercury location rename (flags keep claw* keys for save stability)
    if (data.locationId === "claw-hq") data.locationId = "mercury-hq";
    if (Array.isArray(data.visitedLocations)) {
      data.visitedLocations = data.visitedLocations.map((id) =>
        id === "claw-hq" ? "mercury-hq" : id
      );
    }
    return data;
  } catch {
    return null;
  }
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function formatFollowers(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.floor(n));
}

export function applyEffects(state, effects = {}) {
  const next = { ...state, flags: { ...state.flags } };

  if (effects.followers) next.followers = Math.max(0, next.followers + effects.followers);
  if (effects.cash != null && effects.cash !== 0) {
    // absolute add; choice cost handled separately often
    next.cash = next.cash + effects.cash;
  }
  if (effects.clout) next.clout = Math.max(0, next.clout + effects.clout);
  if (effects.engagement) {
    next.engagement = Math.min(100, Math.max(0, next.engagement + effects.engagement));
  }
  if (effects.day) next.day += effects.day;
  if (effects.energy) next.energy = Math.max(0, next.energy + effects.energy);
  if (effects.locationId) next.locationId = effects.locationId;
  if (effects.shameless && next.stats) {
    next.stats = { ...next.stats, shameless: (next.stats.shameless || 0) + effects.shameless };
  }
  if (effects.hustle && next.stats) {
    next.stats = { ...next.stats, hustle: (next.stats.hustle || 0) + effects.hustle };
  }
  if (effects.flags) {
    next.flags = { ...next.flags, ...effects.flags };
  }

  // Soft engagement → follower drip
  if (effects.engagement && effects.engagement > 0 && !effects.followers) {
    next.followers += Math.floor(effects.engagement / 2);
  }

  return next;
}

export function addPost(state, { text, likes = 0, reposts = 0 }) {
  const post = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text,
    likes,
    reposts,
    day: state.day,
    time: "now",
  };
  return {
    ...state,
    posts: [post, ...state.posts].slice(0, 50),
  };
}

/** Default one-shot replies when an NPC first unlocks with no options */
function defaultRepliesFor(npcId) {
  if (npcId === "priya") {
    return [
      {
        text: "You're on. Loser buys oat milk. (I'm not losing.)",
        effects: { clout: 1, followers: 5 },
        npcReply:
          "cute. screenshot this when I pass you. also don't steal my users 🚀",
      },
      {
        text: "Rivalry accepted. Flirting optional. Both probable.",
        effects: { clout: 2 },
        npcReply: "gross. also correct. see you at the next free Zoom cult.",
      },
      {
        text: "Focus on product. Race later.",
        effects: { clout: 1 },
        npcReply: "product? bold of you to assume either of us has one.",
      },
    ];
  }
  return [];
}

export function unlockThread(state, npcId, firstMessage) {
  const threads = { ...state.threads };
  const existing = threads[npcId] || {
    npcId,
    unread: true,
    messages: [],
    replyOptions: [],
  };
  const messages = [...(existing.messages || [])];
  if (firstMessage) {
    const text =
      typeof firstMessage === "string" ? firstMessage : String(firstMessage ?? "");
    messages.push({ from: "npc", text });
  }
  const hadReplies =
    Array.isArray(existing.replyOptions) && existing.replyOptions.length > 0;
  const wasLocked = existing.locked !== false && !messages.length;
  // Fresh unlock of Priya (etc.): attach quick replies so "texting" works
  let replyOptions = Array.isArray(existing.replyOptions)
    ? [...existing.replyOptions]
    : [];
  if (!hadReplies && existing.locked !== false) {
    const defaults = defaultRepliesFor(npcId);
    if (defaults.length) replyOptions = defaults;
  }
  threads[npcId] = {
    ...existing,
    npcId,
    locked: false,
    unread: true,
    messages,
    replyOptions,
  };
  const unreadTexts = Object.values(threads).filter((t) => !t.locked && t.unread).length;
  return { ...state, threads, unreadTexts };
}

export function appendNpcMessage(state, npcId, text) {
  const threads = { ...state.threads };
  const t = threads[npcId];
  if (!t) return unlockThread(state, npcId, text);
  threads[npcId] = {
    ...t,
    locked: false,
    unread: true,
    messages: [...t.messages, { from: "npc", text }],
  };
  const unreadTexts = Object.values(threads).filter((x) => !x.locked && x.unread).length;
  return { ...state, threads, unreadTexts };
}
