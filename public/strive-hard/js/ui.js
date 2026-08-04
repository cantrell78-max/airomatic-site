import { CHARACTERS } from "./data/characters.js";
import {
  LOCATIONS,
  isLocationUnlocked,
  getLocation,
  locationLockReason,
} from "./data/locations.js";
import {
  resolveText,
  choiceDisabled,
  npcName,
  npcEmoji,
  getFlareupCurrent,
} from "./game.js";
import { formatFollowers } from "./state.js";
import { getScene } from "./data/scenarios.js";
import { getFlareProfile } from "./data/flareup.js";

/** @typedef {import('./state.js').createNewState extends (...a:any)=>infer R ? R : any} GameState */

export function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add("active");
}

export function showToast(msg, kind = "") {
  const el = document.getElementById("toast");
  if (!el || !msg) return;
  el.textContent = msg;
  el.className = "toast" + (kind ? ` ${kind}` : "");
  el.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    el.hidden = true;
  }, 2800);
}

export function renderCharacterSelect(selectedId, onSelect) {
  const grid = document.getElementById("character-grid");
  grid.innerHTML = "";
  CHARACTERS.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "char-card" + (selectedId === c.id ? " selected" : "");
    btn.innerHTML = `
      <div class="char-emoji">${c.emoji}</div>
      <h3>${c.name}</h3>
      <span class="char-age">${c.age} · ${c.title}</span>
      <p class="char-blurb">${c.blurb}</p>
      <div class="char-traits">${c.traits.map((t) => `<span class="trait">${t}</span>`).join("")}</div>
    `;
    btn.addEventListener("click", () => onSelect(c.id));
    grid.appendChild(btn);
  });
}

export function updateStats(state) {
  document.getElementById("stat-day").textContent = String(state.day);
  document.getElementById("stat-cash").textContent = Number(state.cash).toLocaleString();
  document.getElementById("stat-clout").textContent = String(state.clout);
  document.getElementById("stat-followers").textContent = formatFollowers(state.followers);

  const c = state.character;
  const emojiEl = document.getElementById("char-chip-emoji");
  const nameEl = document.getElementById("char-chip-name");
  const chipEl = document.getElementById("char-chip");
  if (c && emojiEl && nameEl) {
    emojiEl.textContent = c.emoji || "?";
    nameEl.textContent = c.name || "—";
    if (chipEl) {
      chipEl.title = c.title ? `${c.name} · ${c.title}` : c.name;
    }
  }

  const loc = getLocation(state.locationId);
  document.getElementById("location-badge").textContent = loc
    ? `📍 ${loc.name}`
    : "📍 Somewhere in the Bay";
}

export function renderScene(state, onChoice) {
  const scene = getScene(state.sceneId);
  const storyBody = document.querySelector(".story-body");
  const sceneArt = document.getElementById("scene-art");
  const isCorgi = state.locationId === "corgi-cafe";
  if (storyBody) storyBody.classList.toggle("corgi-seizure", isCorgi);
  if (sceneArt) sceneArt.classList.toggle("corgi-seizure-bar", isCorgi);
  document.body.classList.toggle("at-corgi-cafe", isCorgi);

  if (!scene) {
    document.getElementById("scene-title").textContent = "404: Scene not found";
    document.getElementById("scene-text").textContent =
      "The narrative pivoted out from under you. Try the Map.";
    document.getElementById("choices").innerHTML = "";
    return;
  }

  document.getElementById("scene-title").textContent = resolveText(scene.title, state);
  document.getElementById("scene-text").textContent = resolveText(scene.text, state);

  const box = document.getElementById("choices");
  box.innerHTML = "";

  (scene.choices || []).forEach((choice, i) => {
    const disabledReason = choiceDisabled(state, choice);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.disabled = !!disabledReason;

    const label = resolveText(choice.text, state);
    const hint = choice.hint ? resolveText(choice.hint, state) : "";
    let cost = "";
    if (choice.cost?.cash) cost = `Costs $${choice.cost.cash}`;
    if (disabledReason) cost = disabledReason;

    btn.innerHTML = `
      <span class="choice-label">${escapeHtml(label)}</span>
      ${hint ? `<span class="choice-hint">${escapeHtml(hint)}</span>` : ""}
      ${cost ? `<span class="choice-cost">${escapeHtml(cost)}</span>` : ""}
    `;
    btn.addEventListener("click", () => onChoice(choice, i));
    box.appendChild(btn);
  });
}

export function openPhoneApp(appId) {
  document.querySelectorAll(".phone-screen").forEach((s) => s.classList.remove("active"));
  const target =
    appId === "home"
      ? document.getElementById("phone-home")
      : document.getElementById(`phone-${appId}`);
  if (target) target.classList.add("active");

  // reset text chat view when opening texts list
  if (appId === "texts") {
    document.getElementById("text-threads").hidden = false;
    document.getElementById("text-chat").hidden = true;
  }
}

export function renderPhoneHome(state) {
  const badgeTexts = document.getElementById("badge-texts");
  const n = state.unreadTexts || 0;
  if (n > 0) {
    badgeTexts.hidden = false;
    badgeTexts.textContent = String(n);
  } else {
    badgeTexts.hidden = true;
  }

  const badgeFlare = document.getElementById("badge-flareup");
  if (badgeFlare) {
    const matches = state.flareup?.matches?.length || 0;
    const liked = state.flareup?.liked?.length || 0;
    // Nudge players who haven't opened the app yet
    if (matches > 0) {
      badgeFlare.hidden = false;
      badgeFlare.textContent = String(matches);
    } else if (!liked) {
      badgeFlare.hidden = false;
      badgeFlare.textContent = "!";
    } else {
      badgeFlare.hidden = true;
    }
  }
}

export function renderFlareUp(state, { onLike, onPass, onReset }) {
  const deck = document.getElementById("flare-deck");
  const empty = document.getElementById("flare-empty");
  const matchesEl = document.getElementById("flare-matches");
  if (!deck) return;

  const { profile, remaining, matches } = getFlareupCurrent(state);

  if (matchesEl) {
    matchesEl.textContent =
      matches.length > 0
        ? `Matches: ${matches.map((id) => getFlareProfile(id)?.name || id).join(", ")}`
        : "Matches: none yet — standards or algorithm, hard to say";
  }

  if (!profile) {
    deck.hidden = true;
    if (empty) {
      empty.hidden = false;
      empty.innerHTML = `
        <p>No profiles left in the Bay (for now).</p>
        <p class="flare-empty-sub">You can refresh the deck — matched people stay matched.</p>
        <button type="button" class="btn btn-primary btn-block" id="btn-flare-reset">Refresh deck</button>
      `;
      const btn = document.getElementById("btn-flare-reset");
      if (btn) btn.onclick = () => onReset();
    }
    return;
  }

  if (empty) empty.hidden = true;
  deck.hidden = false;
  deck.innerHTML = `
    <article class="flare-card">
      <div class="flare-card-hero">
        <span class="flare-emoji">${profile.emoji}</span>
        <div class="flare-card-title">
          <strong>${escapeHtml(profile.name)}</strong><span class="flare-age">${profile.age}</span>
          <div class="flare-job">${escapeHtml(profile.job)}</div>
          <div class="flare-dist">${escapeHtml(profile.distance)}</div>
        </div>
      </div>
      <p class="flare-tagline">${escapeHtml(profile.tagline)}</p>
      <div class="flare-badges">
        ${(profile.badges || []).map((b) => `<span class="flare-badge">${escapeHtml(b)}</span>`).join("")}
      </div>
      <p class="flare-bio">${escapeHtml(profile.bio)}</p>
      <div class="flare-interests">
        ${(profile.interests || []).map((i) => `<span class="flare-interest">${escapeHtml(i)}</span>`).join("")}
      </div>
      <p class="flare-remaining">${remaining} left in stack</p>
    </article>
    <div class="flare-actions">
      <button type="button" class="flare-btn flare-pass" id="btn-flare-pass" title="Pass">✕</button>
      <button type="button" class="flare-btn flare-like" id="btn-flare-like" title="Like">♥</button>
    </div>
  `;
  document.getElementById("btn-flare-pass").onclick = () => onPass();
  document.getElementById("btn-flare-like").onclick = () => onLike();
}

export function renderXApp(state) {
  const c = state.character;
  document.getElementById("x-avatar").textContent = c.emoji;
  document.getElementById("x-name").textContent = c.name;
  document.getElementById("x-handle").textContent = `@${c.handle}`;
  document.getElementById("x-followers").textContent = formatFollowers(state.followers);
  document.getElementById("x-following").textContent = String(state.following);
  document.getElementById("x-engagement").textContent = `${Math.round(state.engagement)}%`;

  const feed = document.getElementById("x-feed");
  if (!state.posts.length) {
    feed.innerHTML = `<div class="x-empty">No posts yet.<br/>Your legacy is loading…</div>`;
    return;
  }
  feed.innerHTML = state.posts
    .map(
      (p) => `
    <article class="x-post">
      <div class="x-post-head">
        <strong>${escapeHtml(c.name)}</strong>
        <span>@${escapeHtml(c.handle)} · Day ${p.day}</span>
      </div>
      <div class="x-post-body">${escapeHtml(p.text)}</div>
      <div class="x-post-stats">
        <span>♥ ${p.likes}</span>
        <span>↻ ${p.reposts}</span>
      </div>
    </article>
  `
    )
    .join("");
}

export function renderMap(state, onTravel) {
  const list = document.getElementById("map-list");
  list.innerHTML = "";
  LOCATIONS.forEach((loc) => {
    const unlocked = isLocationUnlocked(loc, state);
    const lockReason = locationLockReason(loc, state);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "map-pin" + (state.locationId === loc.id ? " here" : "");
    btn.disabled = !unlocked;

    let meta = unlocked
      ? loc.energyCost
        ? `Transit ~$${loc.energyCost * 3}`
        : "Free"
      : lockReason || `Unlocks day ${loc.unlockDay}+`;
    if (state.locationId === loc.id) meta = "You are here";

    btn.innerHTML = `
      <span class="map-pin-name">${loc.emoji} ${escapeHtml(loc.name)}</span>
      <span class="map-pin-desc">${escapeHtml(loc.desc)}</span>
      <span class="map-pin-meta">${escapeHtml(meta)}</span>
    `;
    btn.addEventListener("click", () => onTravel(loc.id));
    list.appendChild(btn);
  });
}

export function renderTextThreads(state, onOpenThread) {
  const box = document.getElementById("text-threads");
  const entries = Object.values(state.threads || {}).filter((t) => !t.locked);

  if (!entries.length) {
    box.innerHTML = `<div class="texts-empty">No messages.<br/>Loneliness is a feature.</div>`;
    return;
  }

  // sort unread first, then by last message
  entries.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));

  box.innerHTML = "";
  entries.forEach((t) => {
    const last = t.messages[t.messages.length - 1];
    const row = document.createElement("button");
    row.type = "button";
    row.className = "thread-row" + (t.unread ? " unread" : "");
    row.innerHTML = `
      <span class="thread-avatar">${npcEmoji(t.npcId)}</span>
      <span class="thread-body">
        <span class="thread-name">${escapeHtml(npcName(t.npcId))}</span>
        <span class="thread-preview">${escapeHtml(last?.text || "…")}</span>
      </span>
      ${t.unread ? '<span class="thread-dot"></span>' : ""}
    `;
    row.addEventListener("click", () => onOpenThread(t.npcId));
    box.appendChild(row);
  });
}

export function renderTextChat(state, npcId, onReply) {
  const thread = state.threads[npcId];
  document.getElementById("text-threads").hidden = true;
  const chat = document.getElementById("text-chat");
  chat.hidden = false;
  document.getElementById("chat-name").textContent = npcName(npcId);

  const msgs = document.getElementById("chat-messages");
  msgs.innerHTML = (thread.messages || [])
    .map(
      (m) =>
        `<div class="bubble ${m.from === "player" ? "me" : "them"}">${escapeHtml(m.text)}</div>`
    )
    .join("");
  msgs.scrollTop = msgs.scrollHeight;

  const replies = document.getElementById("chat-replies");
  replies.innerHTML = "";
  (thread.replyOptions || []).forEach((opt) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "reply-btn";
    b.textContent = opt.text;
    b.addEventListener("click", () => onReply(npcId, opt));
    replies.appendChild(b);
  });
  if (!(thread.replyOptions || []).length) {
    replies.innerHTML = `<div class="texts-empty" style="padding:0.5rem">No quick replies — check back after story beats.</div>`;
  }
}

const SELFIE_PRESETS = [
  "gm from the grind. mattress liquidity still strong 💪",
  "just raised a vibe round (emotional, not financial)",
  "building in public means my failures have analytics",
  "hot take: sleep is a series B problem",
  "if you're not embarrassed by v1 you shipped too late. I'm mortified. perfect.",
  "Tenderloin sunrises hit different when rent is due",
  "who wants in on the waitlist? (the waitlist is a Google Form)",
];

export function renderSelfiePresets(onPick) {
  const box = document.getElementById("selfie-presets");
  box.innerHTML = "";
  SELFIE_PRESETS.forEach((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "preset-btn";
    b.textContent = p;
    b.addEventListener("click", () => onPick(p));
    box.appendChild(b);
  });
}

export function updatePhoneClock() {
  const el = document.getElementById("phone-time");
  if (!el) return;
  // Always 9:41 for Pear energy, with tiny live wink
  const d = new Date();
  if (d.getMinutes() === 41) {
    el.textContent = `${d.getHours() % 12 || 12}:41`;
  } else {
    el.textContent = "9:41";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
