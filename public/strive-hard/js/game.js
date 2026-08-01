import { getScene, LOCATION_SCENES } from "./data/scenarios.js";
import { getLocation, isLocationUnlocked } from "./data/locations.js";
import {
  applyEffects,
  addPost,
  unlockThread,
  appendNpcMessage,
  saveState,
} from "./state.js";
import { NPCS } from "./data/messages.js";

/**
 * Resolve scene text (string or function)
 */
export function resolveText(text, state) {
  if (typeof text === "function") return text(state);
  return text ?? "";
}

/**
 * Apply a choice and return { state, toast?, autoOpenPhone? }
 */
export function applyChoice(state, choice) {
  let next = { ...state };
  const toasts = [];

  // Costs
  if (choice.cost?.cash) {
    if (next.cash < choice.cost.cash) {
      return { state, error: `Need $${choice.cost.cash}. You have $${next.cash}.` };
    }
  }

  if (choice.effects) {
    const before = { followers: next.followers, cash: next.cash, clout: next.clout };
    next = applyEffects(next, choice.effects);
    const dF = next.followers - before.followers;
    const dC = next.cash - before.cash;
    const dCl = next.clout - before.clout;
    const bits = [];
    if (dF) bits.push(`${dF > 0 ? "+" : ""}${dF} followers`);
    if (dC) bits.push(`${dC > 0 ? "+" : ""}$${dC}`);
    if (dCl) bits.push(`${dCl > 0 ? "+" : ""}${dCl} clout`);
    if (bits.length) toasts.push(bits.join(" · "));
  }

  if (choice.post) {
    next = addPost(next, choice.post);
    // Posts also bump followers slightly if not already
    if (!choice.effects?.followers && choice.post.likes) {
      const boost = Math.floor(choice.post.likes / 3);
      next = applyEffects(next, { followers: boost });
    }
  }

  if (choice.messages?.length) {
    for (const m of choice.messages) {
      const msgText = typeof m.text === "function" ? m.text(next) : m.text;
      if (m.unlock || !next.threads[m.npcId] || next.threads[m.npcId].locked) {
        next = unlockThread(next, m.npcId, msgText);
      } else {
        next = appendNpcMessage(next, m.npcId, msgText);
      }
    }
    toasts.push("New text message");
  }

  // Day-based message hooks
  next = runDayHooks(next);

  if (choice.next === null) {
    // Free roam — stay on a hub scene for current location
    const hub = LOCATION_SCENES[next.locationId] || "home_hub";
    // Prefer hub variants
    const hubId =
      next.locationId === "tenderloin"
        ? "home_hub"
        : next.locationId === "vibe-cafe"
          ? "vibe_hub"
          : next.locationId === "yc-school"
            ? "yc_hub"
            : next.locationId === "stanford"
              ? "stanford_hub"
              : next.locationId === "garry-sauna"
                ? "sauna_hub"
                : hub;
    next.sceneId = hubId;
  } else if (choice.next) {
    next.sceneId = choice.next;
    const scene = getScene(choice.next);
    if (scene?.locationId) next.locationId = scene.locationId;
  }

  if (choice.effects?.locationId) {
    next.locationId = choice.effects.locationId;
  }

  saveState(next);

  // Signal UI: free-roam choices (next: null) or explicit openApp open the phone app
  const openApp = choice.openApp || (choice.next === null ? "map" : null);
  return { state: next, toast: toasts.join(" · ") || null, openApp };
}

function runDayHooks(state) {
  let next = state;
  // Unlock garry tease text on day 3+
  if (next.day >= 3 && next.character.gender === "male" && !next.flags.garryColdOpen) {
    next = {
      ...next,
      flags: { ...next.flags, garryColdOpen: true, metGarryTease: true },
    };
    next = unlockThread(
      next,
      "garry",
      "jordan mentioned a chaotic founder with zero followers and infinite confidence. that's either a write-off or a 100x. sauna this week? 🧖"
    );
  }
  if (next.day >= 2 && !next.flags.skylarColdOpen && next.followers >= 20) {
    next = { ...next, flags: { ...next.flags, skylarColdOpen: true } };
    next = unlockThread(
      next,
      "skylar",
      "algorithm washed your face onto my feed. mid lighting, decent ambition. coffee?"
    );
  }
  return next;
}

/**
 * Travel via map
 */
export function travelTo(state, locationId) {
  const loc = getLocation(locationId);
  if (!loc) return { state, error: "Unknown location" };
  if (!isLocationUnlocked(loc, state)) {
    return { state, error: "Not unlocked yet — keep grinding days & story flags." };
  }
  if (locationId === "yc-yacht" && !state.flags.yachtInvite && state.day < 5) {
    return {
      state,
      error: "Yacht is invite-only. Survive a sauna, GSB mixer, or wait until day 5 chaos.",
    };
  }
  if (locationId === "garry-sauna" && state.day < 3) {
    return { state, error: "Garry's people haven't texted yet." };
  }

  let next = { ...state, locationId };
  if (!next.visitedLocations.includes(locationId)) {
    next.visitedLocations = [...next.visitedLocations, locationId];
  }

  // Energy / cash flavor
  if (loc.energyCost > 0) {
    next = applyEffects(next, { cash: -Math.min(next.cash, loc.energyCost * 3) });
  }

  const sceneId = LOCATION_SCENES[locationId] || "home_hub";
  // If already visited location hubs, use hub for home/cafe etc. first visit = arrive
  const visited = state.visitedLocations.includes(locationId);
  if (visited && locationId === "tenderloin") {
    next.sceneId = "home_hub";
  } else if (visited && locationId === "vibe-cafe" && state.flags.hasMVP) {
    next.sceneId = "vibe_hub";
  } else {
    next.sceneId = sceneId;
  }

  // Special: yacht needs invite or late game
  if (locationId === "yc-yacht") {
    next.sceneId = "yacht_arrive";
  }
  if (locationId === "garry-sauna") {
    next.sceneId = "sauna_arrive";
  }

  const scene = getScene(next.sceneId);
  if (scene) next.locationId = scene.locationId || locationId;

  saveState(next);
  return {
    state: next,
    toast: `Arrived: ${loc.name}`,
  };
}

export function postSelfie(state, caption) {
  const text = (caption || "").trim();
  if (!text) return { state, error: "Caption required. Even silence needs a take." };

  const likes = 5 + Math.floor(Math.random() * 20) + Math.floor(state.clout / 2);
  const reposts = Math.floor(likes / 5);
  const followerGain = 3 + Math.floor(likes / 4) + Math.floor(state.engagement / 10);

  let next = addPost(state, { text, likes, reposts });
  next = applyEffects(next, {
    followers: followerGain,
    engagement: 2 + Math.floor(Math.random() * 5),
    clout: 1,
  });
  saveState(next);
  return {
    state: next,
    toast: `Posted · +${followerGain} followers · ${likes} likes`,
  };
}

export function sendTextReply(state, npcId, option) {
  let next = { ...state, threads: { ...state.threads } };
  const thread = { ...next.threads[npcId] };
  if (!thread) return { state, error: "No thread" };

  thread.messages = [
    ...thread.messages,
    { from: "player", text: option.text },
  ];
  if (option.npcReply) {
    thread.messages.push({ from: "npc", text: option.npcReply });
  }
  thread.replyOptions = []; // one-shot for simple threads
  thread.unread = false;
  next.threads[npcId] = thread;

  if (option.effects) {
    next = applyEffects(next, option.effects);
  }

  next.unreadTexts = Object.values(next.threads).filter((t) => !t.locked && t.unread).length;
  saveState(next);
  return { state: next, toast: option.effects?.followers ? "Clout via text" : "Message sent" };
}

export function markThreadRead(state, npcId) {
  const threads = { ...state.threads };
  if (!threads[npcId]) return state;
  threads[npcId] = { ...threads[npcId], unread: false };
  const unreadTexts = Object.values(threads).filter((t) => !t.locked && t.unread).length;
  const next = { ...state, threads, unreadTexts };
  saveState(next);
  return next;
}

export function getActiveScene(state) {
  return getScene(state.sceneId);
}

export function choiceDisabled(state, choice) {
  if (choice.cost?.cash && state.cash < choice.cost.cash) {
    return `Need $${choice.cost.cash}`;
  }
  if (choice.require) {
    const r = choice.require(state);
    if (r === false) return "Not available yet";
    if (typeof r === "string") return r;
  }
  return null;
}

export function npcName(npcId) {
  return NPCS[npcId]?.name || npcId;
}

export function npcEmoji(npcId) {
  return NPCS[npcId]?.emoji || "💬";
}
