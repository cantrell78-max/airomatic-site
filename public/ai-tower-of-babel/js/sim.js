import {
  VIEW_W,
  PAD,
  START_W,
  FLOOR_H,
  MIN_OVERLAP,
  PERFECT_EPS,
  HEAVEN,
  MISS_PUNISH,
  PLACE_LINES,
  WRATH_COPY,
  difficulty,
  baseRect,
} from "./config.js";
import { pickCompany } from "./companies.js";

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createState(rng = Math.random) {
  return {
    mode: "title",
    rng,
    t: 0,
    score: 0,
    combo: 0,
    perfects: 0,
    placed: 0,
    missesInARow: 0,
    heightBest: 0,
    floors: [],
    slider: null,
    comets: [],
    bolts: [],
    vortices: [],
    falling: [],
    flood: { h: 0, target: 0, hold: 0, active: false },
    confusion: 0,
    shake: 0,
    sway: 0,
    camY: 0,
    wrathT: 4.2,
    announce: [],
    events: [],
    godT: 0,
    touchedGod: false,
    cooldown: 0,
    nextId: 1,
    used: new Set(),
    lineI: 0,
  };
}

export function resetRun(state) {
  const rng = state.rng;
  const best = state.heightBest;
  Object.assign(state, createState(rng));
  state.heightBest = best;
  state.mode = "play";
  state.wrathT = 4.4;
  nextSlider(state);
  emit(state, "start");
}

export function emit(state, kind, extra) {
  state.events.push({ kind, extra, t: state.t });
}

export function takeEvents(state) {
  const e = state.events;
  state.events = [];
  return e;
}

export function announce(state, text, kind = "info") {
  state.announce.unshift({ text, kind, t: 1.85 });
  if (state.announce.length > 4) state.announce.length = 4;
}

export function countAbility(state, id) {
  let n = 0;
  for (const f of state.floors) if (f.company.ability === id) n++;
  return n;
}

export function hasAbilityNear(state, idx, id) {
  for (let i = idx - 1; i <= idx + 1; i++) {
    const f = state.floors[i];
    if (f && f.company.ability === id) return true;
  }
  return false;
}

export function nextSlider(state) {
  const company = pickCompany(state.rng, state.used);
  state.used.add(company.name);
  if (state.used.size > 36) {
    const first = state.used.values().next().value;
    state.used.delete(first);
  }
  const top = state.floors[state.floors.length - 1];
  const w = Math.max(MIN_OVERLAP + 4, top ? top.w : START_W);
  const dir = state.rng() < 0.5 ? 1 : -1;
  const speed = difficulty(state.floors.length).sliderSpeed;
  state.slider = {
    x: dir > 0 ? PAD : VIEW_W - PAD - w,
    w,
    vx: dir * speed,
    company,
    art: company.art,
    ready: true,
  };
}

function overlapRange(a, b) {
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.w, b.x + b.w);
  return { left, right, overlap: right - left };
}

export function dropSlider(state) {
  const s = state.slider;
  if (!s || !s.ready || state.mode === "title") return { kind: "idle" };
  if (state.mode !== "play" && state.mode !== "god") return { kind: "idle" };
  s.ready = false;
  const prev = state.floors.length ? state.floors[state.floors.length - 1] : baseRect();
  const { left, overlap } = overlapRange(s, prev);
  if (overlap < MIN_OVERLAP) {
    state.missesInARow++;
    state.combo = 0;
    pushFalling(state, {
      x: s.x,
      y: (state.floors.length ? prev.y : 0) + FLOOR_H + 10,
      w: s.w,
      art: s.art,
      company: s.company,
    });
    announce(state, `${s.company.name.toUpperCase()} MISSED THE ROUND`, "miss");
    emit(state, "miss", s.company);
    if (state.missesInARow >= MISS_PUNISH && state.floors.length) {
      const top = state.floors[state.floors.length - 1];
      top.hp -= 28;
    }
    state.cooldown = 0.32;
    return { kind: "miss" };
  }
  const dx = Math.abs(s.x - prev.x);
  const perfect = dx <= PERFECT_EPS;
  let x = left;
  let w = overlap;
  if (perfect) {
    w = Math.min(START_W, Math.max(w, prev.w + 8));
    x = prev.x + (prev.w - w) / 2;
    state.combo++;
    state.perfects++;
    state.score += 420 + state.combo * 90;
    announce(state, state.combo > 1 ? `ALIGNED ×${state.combo}` : "ALIGNED", "perfect");
    emit(state, "perfect");
  } else {
    state.combo = 0;
    emit(state, "place");
  }
  const floor = {
    id: state.nextId++,
    x,
    w,
    y: state.floors.length * FLOOR_H,
    visY: (state.floors.length ? state.floors[state.floors.length - 1].visY : 0) + FLOOR_H + 26,
    hp: s.company.hp,
    maxHp: s.company.hp,
    company: s.company,
    art: s.art,
    burning: 0,
    glitched: 0,
  };
  state.floors.push(floor);
  state.placed++;
  state.missesInARow = 0;
  state.score += 100 + state.floors.length * 14;
  applyPlaceAbility(state, floor);
  if (state.floors.length > state.heightBest) state.heightBest = state.floors.length;
  const line = PLACE_LINES[state.lineI++ % PLACE_LINES.length];
  announce(state, `${s.company.name.toUpperCase()}  ·  ${line}`, "place");
  if (!state.touchedGod && state.floors.length >= HEAVEN) {
    state.mode = "god";
    state.touchedGod = true;
    state.godT = 10;
    announce(state, "YOU ARE GOD", "god");
    emit(state, "god");
  }
  state.cooldown = 0.18;
  return { kind: perfect ? "perfect" : "place", floor };
}

export function applyPlaceAbility(state, floor) {
  const a = floor.company.ability;
  if (a === "FUND") {
    for (const f of state.floors) f.hp = Math.min(f.maxHp, f.hp + 20);
  }
  if (a === "REPAIR" && state.floors.length >= 2) {
    const prev = state.floors[state.floors.length - 2];
    const nextW = Math.min(prev.w, floor.w + 16);
    const cx = floor.x + floor.w / 2;
    floor.w = nextW;
    floor.x = cx - nextW / 2;
    const { left, overlap } = overlapRange(floor, prev);
    if (overlap >= MIN_OVERLAP) {
      floor.x = left;
      floor.w = overlap;
    }
  }
  if (a === "CHAOS") {
    if (state.rng() < 0.5) {
      state.score += 480;
      announce(state, "QUANTUM UPSIDE", "perfect");
    } else {
      state.confusion = Math.min(1, state.confusion + 0.28);
      floor.glitched = Math.min(1, floor.glitched + 0.5);
      announce(state, "QUANTUM DRAWDOWN", "babel");
    }
  }
  if (a === "ARK" && state.flood.active) {
    state.flood.target *= 0.62;
    state.flood.hold = Math.min(state.flood.hold, 1.4);
  }
  if (a === "GLOW") {
    state.score += 90 * state.floors.length;
  }
}

function pushFalling(state, spec) {
  state.falling.push({
    x: spec.x,
    y: spec.y,
    w: spec.w,
    vy: 30,
    vr: (state.rng() - 0.5) * 7,
    rot: 0,
    art: spec.art,
    company: spec.company,
    life: 2.1,
  });
}

export function restack(state) {
  const src = state.floors.slice();
  const stacked = [];
  for (const f of src) {
    const prev = stacked.length ? stacked[stacked.length - 1] : baseRect();
    const { left, overlap } = overlapRange(f, prev);
    if (overlap < MIN_OVERLAP) {
      pushFalling(state, { x: f.x, y: f.y, w: f.w, art: f.art, company: f.company });
      continue;
    }
    f.x = left;
    f.w = overlap;
    f.y = stacked.length * FLOOR_H;
    stacked.push(f);
  }
  state.floors = stacked;
}

export function cullDead(state) {
  const live = [];
  let lost = false;
  for (const f of state.floors) {
    if (f.hp <= 0) {
      lost = true;
      pushFalling(state, { x: f.x, y: f.y, w: f.w, art: f.art, company: f.company });
      emit(state, "floorDead", f.company);
    } else live.push(f);
  }
  if (lost) {
    state.floors = live;
    restack(state);
    state.shake = Math.max(state.shake, 0.55);
  }
}

export function pickWrath(state) {
  const n = state.floors.length;
  const pool = ["lightning"];
  if (n >= 3) pool.push("comet");
  if (n >= 6) pool.push("flood");
  if (n >= 9) pool.push("babel");
  if (n >= 12) pool.push("quake");
  if (n >= 15) pool.push("comet", "lightning");
  if (state.mode === "god") pool.push("comet", "comet", "flood", "quake", "lightning");
  return pool[(state.rng() * pool.length) | 0];
}

export function spawnComet(state) {
  const d = difficulty(state.floors.length);
  const target = state.floors.length ? state.floors[(state.rng() * state.floors.length) | 0] : null;
  const tx = target ? target.x + target.w * 0.5 : VIEW_W * 0.5;
  const x = 70 + state.rng() * (VIEW_W - 140);
  const y = state.camY + 620 + state.rng() * 90;
  state.comets.push({
    x,
    y,
    vx: (tx - x) * 0.22,
    vy: -d.cometVy,
    r: 16,
  });
}

export function spawnLightning(state) {
  const n = state.floors.length;
  const d = difficulty(n);
  if (!n) {
    state.bolts.push({ x: VIEW_W * 0.5, y: 90, life: 0.42, absorbed: false });
    return { absorbed: false };
  }
  const idx = Math.max(0, n - 1 - ((state.rng() * Math.min(3, n)) | 0));
  const f = state.floors[idx];
  const absorbed = hasAbilityNear(state, idx, "GROUND");
  state.bolts.push({
    x: f.x + f.w / 2,
    y: f.y + FLOOR_H * 2.2,
    life: 0.48,
    absorbed,
  });
  if (absorbed) {
    f.glitched = Math.min(1, f.glitched + 0.18);
    state.confusion = Math.max(0, state.confusion - 0.14);
    emit(state, "absorb");
  } else {
    f.hp -= d.dmg;
    f.glitched = Math.min(1, f.glitched + 0.75);
    f.burning = Math.max(f.burning, 0.35);
    emit(state, "lightning");
  }
  return { absorbed, floor: f };
}

export function fireWrath(state, kind) {
  if (kind === "comet") {
    const n = state.mode === "god" ? 3 : state.floors.length >= 16 ? 2 : 1;
    for (let i = 0; i < n; i++) spawnComet(state);
    announce(state, WRATH_COPY.comet, "comet");
    emit(state, "wrath", kind);
  } else if (kind === "lightning") {
    spawnLightning(state);
    announce(state, WRATH_COPY.lightning, "lightning");
    emit(state, "wrath", kind);
  } else if (kind === "flood") {
    const d = difficulty(state.floors.length);
    state.flood.active = true;
    state.flood.target = Math.min(d.floodMax, FLOOR_H * (0.9 + state.floors.length * 0.11));
    state.flood.hold = 3.1;
    announce(state, WRATH_COPY.flood, "flood");
    emit(state, "wrath", kind);
  } else if (kind === "babel") {
    state.confusion = Math.min(1, state.confusion + 0.4);
    const top = state.floors[state.floors.length - 1];
    if (top) {
      state.vortices.push({
        x: top.x + top.w / 2,
        y: top.y + FLOOR_H,
        life: 1.7,
        r: 46,
      });
      top.glitched = Math.min(1, top.glitched + 0.55);
    }
    if (state.slider && state.rng() < 0.65) state.slider.vx *= -1;
    announce(state, WRATH_COPY.babel, "babel");
    emit(state, "wrath", kind);
  } else if (kind === "quake") {
    state.shake = 1;
    state.sway = (state.rng() * 2 - 1) * 0.4;
    for (const f of state.floors) {
      f.hp -= 9;
      f.x += (state.rng() * 2 - 1) * 12;
    }
    restack(state);
    announce(state, WRATH_COPY.quake, "quake");
    emit(state, "wrath", kind);
  }
}

function updateFlood(state, dt) {
  const fl = state.flood;
  if (!fl.active && fl.h <= 0) return;
  if (fl.active) {
    fl.h += (fl.target - fl.h) * Math.min(1, 2.4 * dt);
    fl.hold -= dt;
    if (fl.hold <= 0) fl.target = 0;
    if (fl.target === 0 && fl.h < 3) {
      fl.h = 0;
      fl.active = false;
    }
  }
  const ark = countAbility(state, "ARK");
  const water = fl.h * (ark ? 0.52 : 1);
  for (const f of state.floors) {
    if (f.y + FLOOR_H * 0.32 < water && f.company.ability !== "ARK") {
      f.hp -= 16 * dt;
    }
  }
}

function updateComets(state, dt) {
  const d = difficulty(state.floors.length);
  const next = [];
  for (const c of state.comets) {
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    let dead = false;
    for (const f of state.floors) {
      if (f.company.ability !== "DEFENSE") continue;
      const dx = c.x - (f.x + f.w / 2);
      const dy = c.y - (f.y + FLOOR_H);
      if (dx * dx + dy * dy < 88 * 88) {
        dead = true;
        state.score += 240;
        emit(state, "intercept");
        break;
      }
    }
    if (dead) continue;
    if (c.y < -40) continue;
    for (const f of state.floors) {
      if (c.x > f.x - 8 && c.x < f.x + f.w + 8 && c.y < f.y + FLOOR_H && c.y > f.y - 10) {
        f.hp -= d.dmg * 1.15;
        f.burning = Math.max(f.burning, 2.1);
        emit(state, "cometHit");
        dead = true;
        break;
      }
    }
    if (!dead) next.push(c);
  }
  state.comets = next;
}

function updateFloors(state, dt) {
  for (let i = 0; i < state.floors.length; i++) {
    const f = state.floors[i];
    if (f.burning > 0) {
      f.hp -= difficulty(state.floors.length).burn * dt;
      f.burning -= dt;
      if (f.burning > 0.4 && i + 1 < state.floors.length && state.rng() < 0.08 * dt) {
        state.floors[i + 1].burning = Math.max(state.floors[i + 1].burning, 0.9);
      }
    }
    f.glitched = Math.max(0, f.glitched - 0.12 * dt);
    if (f.visY === undefined) f.visY = f.y;
    f.visY += (f.y - f.visY) * Math.min(1, 9 * dt);
  }
}

export function update(state, input, dt) {
  if (state.mode !== "play" && state.mode !== "god") return;
  const capped = Math.min(0.05, dt);
  state.t += capped;

  const voice = countAbility(state, "VOICE");
  const bind = countAbility(state, "BIND");
  state.confusion = Math.max(0, state.confusion - (0.08 + bind * 0.12) * capped);
  state.shake = Math.max(0, state.shake - 1.8 * capped);
  state.sway += (0 - state.sway) * Math.min(1, 1.4 * capped);

  if (state.slider && state.slider.ready) {
    const s = state.slider;
    if (input.left) s.vx = -Math.abs(s.vx);
    if (input.right) s.vx = Math.abs(s.vx);
    if (state.confusion > 0.55 && state.rng() < 1.1 * capped) s.vx *= -1;
    if (state.confusion > 0.72) s.x += (state.rng() * 2 - 1) * 55 * capped;
    s.x += s.vx * capped;
    if (s.x <= PAD) {
      s.x = PAD;
      s.vx = Math.abs(s.vx);
    }
    if (s.x + s.w >= VIEW_W - PAD) {
      s.x = VIEW_W - PAD - s.w;
      s.vx = -Math.abs(s.vx);
    }
    if (input.drop) dropSlider(state);
  }

  if (!state.slider?.ready) {
    state.cooldown -= capped;
    if (state.cooldown <= 0) nextSlider(state);
  }

  const d = difficulty(state.floors.length);
  const wrathScale = 1 + voice * 0.1;
  state.wrathT -= capped;
  if (state.wrathT <= 0 && state.floors.length >= 1) {
    fireWrath(state, pickWrath(state));
    state.wrathT = d.wrathEvery * wrathScale * (0.75 + state.rng() * 0.5);
    if (state.mode === "god") state.wrathT *= 0.55;
  }

  updateFlood(state, capped);
  updateComets(state, capped);
  updateFloors(state, capped);

  for (const b of state.bolts) b.life -= capped;
  state.bolts = state.bolts.filter((b) => b.life > 0);
  for (const v of state.vortices) v.life -= capped;
  state.vortices = state.vortices.filter((v) => v.life > 0);
  for (const p of state.falling) {
    p.vy -= 780 * capped;
    p.y += p.vy * capped;
    p.rot += p.vr * capped;
    p.life -= capped;
  }
  state.falling = state.falling.filter((p) => p.life > 0 && p.y > -80);

  cullDead(state);

  const top = state.floors.length * FLOOR_H + 90;
  const desired = Math.max(0, top - 540 * 0.58);
  state.camY += (desired - state.camY) * Math.min(1, 3.4 * capped);

  if (state.mode === "god") {
    state.godT -= capped;
    if (state.godT <= 0 && state.floors.length > 0) {
      state.mode = "win";
      emit(state, "win");
    }
  }

  if (state.placed > 0 && state.floors.length === 0) {
    if (state.touchedGod) {
      state.mode = "win";
      emit(state, "win");
    } else {
      state.mode = "dead";
      emit(state, "dead");
    }
  }
}

export function babelize(text, confusion, rng) {
  if (!text || confusion < 0.38) return text;
  if (confusion > 0.82) return text.split("").reverse().join("");
  const glyphs = "#%∆∞/|Ξ";
  let out = "";
  for (const ch of text) {
    if (ch === " ") {
      out += " ";
      continue;
    }
    out += rng() < confusion * 0.45 ? glyphs[(rng() * glyphs.length) | 0] : ch;
  }
  return out;
}

export function waterLine(state) {
  const ark = countAbility(state, "ARK");
  return state.flood.h * (ark ? 0.52 : 1);
}
