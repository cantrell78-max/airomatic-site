import { GROUND_Y, WORLD_W, DANCE_ARENA } from "./config.js";
import { wrap, wrapDelta, inArena } from "./world.js";

export function spawnEntities(level) {
  const list = [];
  for (const s of level.spawns) {
    if (s.type === "punk") {
      list.push({
        type: "punk",
        x: s.x,
        y: s.y,
        vx: 55,
        vy: 0,
        w: 36,
        h: 70,
        facing: 1,
        hp: 1,
        t: Math.random() * 10,
        turn: 2 + Math.random() * 3,
        dead: false,
        flatten: 1,
      });
    } else if (s.type === "bottle") {
      list.push({
        type: "bottle",
        x: s.x,
        y: s.y,
        vx: 20 * (Math.random() > 0.5 ? 1 : -1),
        vy: 0,
        w: 28,
        h: 48,
        baseY: s.y,
        t: Math.random() * 6,
        hp: 1,
        dead: false,
      });
    } else if (s.type === "orb") {
      list.push({
        type: "orb",
        x: s.x,
        y: s.y,
        w: 28,
        h: 28,
        kind: s.kind,
        t: Math.random() * 4,
        taken: false,
      });
    }
  }
  list.push({
    type: "bigFairy",
    x: (DANCE_ARENA[0] + DANCE_ARENA[1]) / 2,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    w: 48,
    h: 78,
    facing: -1,
    t: 0,
    steps: 0,
    need: 8,
    active: false,
    done: false,
    hop: 0,
  });
  list.push({
    type: "dwarf",
    x: (DANCE_ARENA[0] + DANCE_ARENA[1]) / 2 + 80,
    y: GROUND_Y,
    vx: 40,
    vy: 0,
    w: 44,
    h: 58,
    t: 0,
    hitT: 0,
    active: false,
    mid: true,
  });
  return list;
}

export function updateEntities(ents, player, dt, kicks, onScore, audio, fx, trip) {
  const pops = [];
  for (const e of ents) {
    e.t += dt;
    if (e.type === "punk" && !e.dead) {
      e.x = wrap(e.x + e.vx * dt);
      e.turn -= dt;
      if (e.x < 40 || e.x > WORLD_W - 40) {
        e.vx *= -1;
        e.x = wrap(e.x + e.vx * dt);
      } else if (e.turn <= 0) {
        e.vx *= -1;
        e.turn = 2.2 + Math.random() * 3.5;
      }
      e.facing = e.vx >= 0 ? 1 : -1;
      if (hitAny(e, kicks)) {
        e.dead = true;
        e.flatten = 0.2;
        const pts = 50 + (player.danceLeft > 0 ? 30 : 0);
        onScore(pts, e.x, e.y - 40);
        audio.crush();
        fx.shake = Math.max(fx.shake, 8);
        pops.push({ x: e.x, y: e.y, kind: "crush" });
      } else if (player.invuln <= 0 && overlapActors(player, e)) {
        const dir = wrapDelta(player.x, e.x) >= 0 ? 1 : -1;
        pops.push({ hit: true, dir });
      }
    } else if (e.type === "punk" && e.dead) {
      e.flatten += (0.08 - e.flatten) * dt * 4;
    } else if (e.type === "bottle" && !e.dead) {
      e.x = wrap(e.x + e.vx * dt);
      e.y = e.baseY + Math.sin(e.t * 2.1) * 18;
      if (hitAny(e, kicks)) {
        e.dead = true;
        onScore(35, e.x, e.y);
        audio.crush();
        pops.push({ x: e.x, y: e.y, kind: "glass" });
      } else if (player.invuln <= 0 && overlapActors(player, e)) {
        const dir = wrapDelta(player.x, e.x) >= 0 ? 1 : -1;
        pops.push({ hit: true, dir });
      }
    } else if (e.type === "orb" && !e.taken) {
      e.y += Math.sin(e.t * 2.4) * 8 * dt;
      const dx = wrapDelta(e.x, player.x);
      if (Math.abs(dx) < 36 && Math.abs(e.y - (player.y - player.h * 0.45)) < 46) {
        e.taken = true;
        onScore(100, e.x, e.y);
        audio.collect(e.kind);
        pops.push({ orb: e.kind, x: e.x, y: e.y });
      }
    } else if (e.type === "bigFairy") {
      if (e.done) {
        e.x = wrap(e.x + Math.sin(e.t) * 20 * dt);
        e.hop = Math.sin(e.t * 6) * 10;
      } else if (e.active) {
        const dx = wrapDelta(player.x, e.x);
        e.facing = dx >= 0 ? 1 : -1;
        e.vx = Math.sign(dx) * 70;
        e.x = wrap(e.x + e.vx * dt);
        e.hop = Math.abs(Math.sin(e.t * 5)) * 16;
        if (hitAny(e, kicks) && e.hopT == null) {
          e.steps += 1;
          e.hopT = 0.4;
          onScore(120, e.x, e.y - 80);
          audio.dance(e.steps);
          fx.shake = Math.max(fx.shake, 6);
          pops.push({ step: e.steps, x: e.x, y: e.y - 90 });
          if (e.steps >= e.need) {
            e.done = true;
            e.active = false;
            audio.cheer();
            onScore(1000, e.x, e.y - 110);
            pops.push({ danceWin: true, x: e.x, y: e.y });
          }
        }
        if (e.hopT != null) {
          e.hopT -= dt;
          if (e.hopT <= 0) e.hopT = null;
        }
      }
    } else if (e.type === "dwarf") {
      if (e.active) {
        e.x = wrap(e.x + e.vx * dt);
        if (e.x < DANCE_ARENA[0] || e.x > DANCE_ARENA[1]) e.vx *= -1;
        e.hop = Math.abs(Math.sin(e.t * 8)) * 22;
        if (e.hitT > 0) e.hitT -= dt;
        if (hitAny(e, kicks) && e.hitT <= 0) {
          e.hitT = 0.35;
          onScore(40, e.x, e.y - 50);
          audio.dance(2);
          e.vx *= -1;
        }
        if (overlapActors(player, { ...e, y: e.y - (e.hop || 0) })) {
          player.vx += wrapDelta(player.x, e.x) >= 0 ? 160 : -160;
        }
      } else {
        e.hop = Math.sin(e.t * 3) * 6;
      }
    }
  }

  const big = ents.find((e) => e.type === "bigFairy");
  const dwarf = ents.find((e) => e.type === "dwarf");
  if (big && !big.done && !big.active && inArena(player.x)) {
    big.active = true;
    if (dwarf) dwarf.active = true;
    pops.push({ danceStart: true });
  }

  void trip;
  return pops;
}

function overlapActors(a, b) {
  const dx = Math.abs(wrapDelta(a.x, b.x));
  const ay1 = a.y - a.h,
    ay2 = a.y;
  const by1 = b.y - b.h,
    by2 = b.y;
  return dx < (a.w + b.w) * 0.52 && ay1 < by2 && ay2 > by1;
}

function hitAny(e, kicks) {
  const eb = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
  for (const k of kicks) {
    const dx = Math.abs(wrapDelta(k.x + k.w / 2, e.x));
    if (dx < k.w / 2 + e.w / 2 && k.y < eb.y + eb.h && k.y + k.h > eb.y) return true;
  }
  return false;
}
