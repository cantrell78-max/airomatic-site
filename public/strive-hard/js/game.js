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
import { FLAREUP_PROFILES, getFlareProfile } from "./data/flareup.js";

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
    next.sceneId = hubSceneFor(next.locationId);
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

function hubSceneFor(locationId) {
  const hubs = {
    tenderloin: "home_hub",
    "vibe-cafe": "vibe_hub",
    "corgi-cafe": "corgi_hub",
    "yc-school": "yc_hub",
    stanford: "stanford_hub",
    "garry-sauna": "sauna_hub",
    "ketamine-dealer": "dylan_hub",
    "palantir-bunker": "palantir_hub",
    "soft-hq": "hq_hub",
    "mercury-hq": "claw_hub",
  };
  return hubs[locationId] || LOCATION_SCENES[locationId] || "home_hub";
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
  if (locationId === "ketamine-dealer" && !state.flags.metDylan) {
    return { state, error: "Unknown address. Meet the fox on the yacht first." };
  }
  if (locationId === "palantir-bunker" && !state.flags.alienContact) {
    return {
      state,
      error: "No clearance. The lattice hasn't called your number yet (Mt. Shasta).",
    };
  }
  if (locationId === "soft-hq" && !state.flags.raisedSeed) {
    return {
      state,
      error: "No lease without a seed. Take (or negotiate) the yacht check first.",
    };
  }
  if (locationId === "mercury-hq" && !state.flags.raisedSeed) {
    return {
      state,
      error: "Mercury only onboards post-seed (in this game). Raise first, then park the wire.",
    };
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
  const visited = state.visitedLocations.includes(locationId);
  if (visited && locationId === "tenderloin") {
    next.sceneId = "home_hub";
  } else if (visited && locationId === "vibe-cafe" && state.flags.hasMVP) {
    next.sceneId = "vibe_hub";
  } else if (visited && locationId === "corgi-cafe" && state.flags.survivedCorgiCafe) {
    next.sceneId = "corgi_hub";
  } else if (visited && locationId === "ketamine-dealer" && state.flags.visitedDylan) {
    next.sceneId = "dylan_hub";
  } else if (visited && locationId === "palantir-bunker" && state.flags.enteredPalantir) {
    next.sceneId = "palantir_hub";
  } else if (visited && locationId === "soft-hq" && state.flags.hqLeased) {
    next.sceneId = state.flags.hqComplete ? "hq_hub" : "hq_furnish";
    if (state.flags.hqFurnished && !state.flags.hqStaffed) next.sceneId = "hq_hire";
    if (state.flags.hqStaffed && !state.flags.hqOperational) next.sceneId = "hq_allhands";
    if (state.flags.hqOperational && !state.flags.hqComplete) next.sceneId = "hq_burn_check";
  } else if (visited && locationId === "mercury-hq" && state.flags.enteredClaw) {
    next.sceneId = state.flags.clawAccount ? "claw_hub" : "claw_pitch";
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

/** Ensure flareup state shape */
function ensureFlareup(state) {
  if (state.flareup) return state;
  return {
    ...state,
    flareup: { liked: [], passed: [], matches: [], queue: null },
  };
}

function buildFlareQueue(flare) {
  const done = new Set([...(flare.liked || []), ...(flare.passed || [])]);
  if (flare.queue && flare.queue.length) {
    return flare.queue.filter((id) => !done.has(id));
  }
  return FLAREUP_PROFILES.map((p) => p.id).filter((id) => !done.has(id));
}

/**
 * Next profile to show on FlareUp (read-only view helper).
 */
export function getFlareupCurrent(state) {
  const s = ensureFlareup(state);
  const queue = buildFlareQueue(s.flareup);
  const currentId = queue[0] || null;
  return {
    profile: currentId ? getFlareProfile(currentId) : null,
    remaining: queue.length,
    matches: s.flareup.matches || [],
  };
}

/**
 * Like or pass on current FlareUp profile.
 * action: 'like' | 'pass'
 */
export function flareupSwipe(state, action) {
  let s = ensureFlareup(state);
  const queue = buildFlareQueue(s.flareup);
  const profile = queue[0] ? getFlareProfile(queue[0]) : null;
  if (!profile) {
    return { state: s, error: "No more profiles. The Bay is finite. Refresh tomorrow (or never)." };
  }

  let flare = {
    ...s.flareup,
    liked: [...(s.flareup.liked || [])],
    passed: [...(s.flareup.passed || [])],
    matches: [...(s.flareup.matches || [])],
    queue: queue.slice(1),
  };

  let next = { ...s, flareup: flare, flags: { ...s.flags } };
  let toast = "";
  let matched = false;

  if (action === "pass") {
    flare.passed.push(profile.id);
    next.flareup = flare;
    toast = `Passed on ${profile.name}. The algorithm notes your taste.`;
  } else {
    flare.liked.push(profile.id);
    if (profile.effectsOnLike) {
      next = applyEffects(next, profile.effectsOnLike);
    }
    let chance = profile.matchChance ?? 0.3;
    if (typeof profile.matchBonus === "function") {
      chance += profile.matchBonus(next);
    }
    chance = Math.max(0, Math.min(1, chance));
    matched = Math.random() < chance;

    // Kayla never matches from the app (story only)
    if (profile.id === "kayla_gtm") matched = false;

    if (matched) {
      flare.matches.push(profile.id);
      if (profile.effectsOnMatch) {
        next = applyEffects(next, profile.effectsOnMatch);
      }
      if (profile.unlockThread) {
        next = unlockThread(next, profile.unlockThread.npcId, profile.unlockThread.text);
      }
      toast = profile.matchMessage || `It's a match with ${profile.name}!`;
    } else {
      toast = profile.noMatchMessage || `${profile.name} is not feeling the funnel.`;
      if (profile.id === "kayla_gtm" && !next.flags.kaylaRejectedText) {
        next = applyEffects(next, { flags: { kaylaRejectedText: true } });
        next = unlockThread(
          next,
          "kayla",
          "saw you liked me on FlareUp. cute. my calendar is closed-won through Q4. try again after you have distribution 🐶"
        );
        toast += " · New text from Kayla (it's a no)";
      }
    }
    next.flareup = flare;
  }

  saveState(next);
  return { state: next, toast, matched, profile };
}

/** Reset FlareUp deck (show profiles again after all swiped) */
export function flareupResetDeck(state) {
  let s = ensureFlareup(state);
  const matches = s.flareup.matches || [];
  // Keep matches/likes history but rebuild queue from non-matched so you can re-like? 
  // Better: only reshuffle people you passed; matched stay done; liked non-match can reappear
  const liked = s.flareup.liked || [];
  const matchedSet = new Set(matches);
  const queue = FLAREUP_PROFILES.map((p) => p.id).filter((id) => !matchedSet.has(id));
  const next = {
    ...s,
    flareup: {
      ...s.flareup,
      // clear passes so they reappear; keep likes that matched
      passed: [],
      liked: liked.filter((id) => matchedSet.has(id)),
      queue,
    },
  };
  saveState(next);
  return { state: next, toast: "Deck refreshed. Hope is a renewable resource." };
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
