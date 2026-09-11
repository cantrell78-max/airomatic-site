import {
  VIEW_W,
  VIEW_H,
  ROOF_Y,
  GRAVITY,
  JUMP_V,
  JUMP_CUT,
  MAX_VX,
  ACCEL,
  AIR_ACCEL,
  FRICTION,
  AIR_DRAG,
  COYOTE,
  JUMP_BUF,
  PLAYER_W,
  PLAYER_H,
  FIRE_RATE,
  BULLET_SPEED,
  BULLET_LIFE,
  TOWER_MAX,
  TOWER_HIT,
  PLATFORMS,
  TOWERS,
  LINES,
} from "./config.js";

export { PLATFORMS, TOWERS, LINES };

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function difficulty(t) {
  const spawn = Math.max(0.28, 2.2 - t * 0.038);
  const speed = 80 + t * 7.2;
  const hp = Math.min(12, 3 + Math.floor(t / 16));
  const maxPlanes = Math.min(18, 2 + Math.floor(t / 10));
  const wave = 1 + Math.floor(t / 18);
  return { spawn, speed, hp, maxPlanes, wave };
}

export function createPlayer() {
  return {
    x: 240,
    y: ROOF_Y,
    vx: 0,
    vy: 0,
    w: PLAYER_W,
    h: PLAYER_H,
    facing: 1,
    grounded: true,
    coyote: 0,
    jumpBuf: 0,
    fireCd: 0,
    shooting: false,
    animT: 0,
    aimX: 700,
    aimY: 140,
  };
}

export function createTowers() {
  return TOWERS.map((t) => ({ ...t, hp: TOWER_MAX, max: TOWER_MAX }));
}

export function createState(rng = Math.random) {
  return {
    mode: "title",
    time: 0,
    score: 0,
    combo: 0,
    comboT: 0,
    best: 0,
    spawnT: 0.6,
    player: createPlayer(),
    towers: createTowers(),
    planes: [],
    bullets: [],
    fx: [],
    say: null,
    sayT: 0,
    shake: 0,
    freeze: 0,
    banner: "",
    bannerT: 0,
    waveShown: 0,
    rng,
    id: 1,
  };
}

export function resetRun(state) {
  state.mode = "play";
  state.time = 0;
  state.score = 0;
  state.combo = 0;
  state.comboT = 0;
  state.spawnT = 0.4;
  state.player = createPlayer();
  state.towers = createTowers();
  state.planes = [];
  state.bullets = [];
  state.fx = [];
  state.say = null;
  state.sayT = 0;
  state.shake = 0;
  state.freeze = 0;
  state.banner = "DEFEND THE TOWERS";
  state.bannerT = 2.2;
  state.waveShown = 1;
  spawnPlane(state);
  spawnPlane(state);
}

function platformAt(x, y) {
  let best = null;
  for (const p of PLATFORMS) {
    if (x >= p.x && x <= p.x + p.w) {
      if (y >= p.y - 18 && y <= p.y + 28) {
        if (!best || Math.abs(y - p.y) < Math.abs(y - best.y)) best = p;
      }
    }
  }
  return best;
}

export function muzzle(p) {
  const ang = Math.atan2(p.aimY - (p.y - 34), p.aimX - (p.x + p.facing * 18));
  return {
    x: p.x + p.facing * 28 + Math.cos(ang) * 42,
    y: p.y - 36 + Math.sin(ang) * 10,
    ang,
  };
}

export function spawnPlane(state) {
  const d = difficulty(state.time);
  const fromLeft = state.rng() < 0.5;
  const target = state.towers[state.rng() < 0.5 ? 0 : 1];
  const y = 36 + state.rng() * 150;
  const x = fromLeft ? -140 : VIEW_W + 140;
  const tx = target.hitX + target.hitW * (0.3 + state.rng() * 0.4);
  const ty = target.hitY + 40 + state.rng() * 90;
  const dx = tx - x;
  const dy = ty - y;
  const len = Math.hypot(dx, dy) || 1;
  const speed = d.speed * (0.85 + state.rng() * 0.3);
  state.planes.push({
    id: state.id++,
    x,
    y,
    w: 156,
    h: 56,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    hp: d.hp,
    max: d.hp,
    facing: fromLeft ? 1 : -1,
    target: target.id,
    bob: state.rng() * Math.PI * 2,
  });
}

export function spawnBullet(state) {
  const p = state.player;
  const m = muzzle(p);
  const colors = ["#e30613", "#f4f7ff", "#3b82f6"];
  for (let i = 0; i < 3; i++) {
    const spread = (i - 1) * 0.045;
    const ang = m.ang + spread;
    state.bullets.push({
      x: m.x,
      y: m.y + (i - 1) * 3,
      vx: Math.cos(ang) * BULLET_SPEED,
      vy: Math.sin(ang) * BULLET_SPEED,
      life: BULLET_LIFE,
      color: colors[i],
      w: 18,
      h: 4,
    });
  }
}

export function killPlane(state, plane, patriotic) {
  const idx = state.planes.indexOf(plane);
  if (idx >= 0) state.planes.splice(idx, 1);
  if (patriotic) {
    state.combo = state.comboT > 0 ? state.combo + 1 : 1;
    state.comboT = 1.8;
    const got = 100 * Math.min(10, state.combo);
    state.score += got;
    if (state.score > state.best) state.best = state.score;
    state.fx.push({
      kind: "firework",
      x: plane.x + plane.w * 0.5,
      y: plane.y + plane.h * 0.5,
      t: 0,
      life: 0.72,
    });
    state.say = LINES[(state.rng() * LINES.length) | 0];
    state.sayT = 1.35;
    state.shake = Math.max(state.shake, 7 + Math.min(8, state.combo));
    return got;
  }
  state.fx.push({
    kind: "impact",
    x: plane.x + plane.w * 0.5,
    y: plane.y + plane.h * 0.5,
    t: 0,
    life: 0.45,
  });
  state.shake = Math.max(state.shake, 14);
  return 0;
}

export function planeHitsTower(plane, tower) {
  return aabb(
    { x: plane.x + 16, y: plane.y + 8, w: plane.w - 32, h: plane.h - 14 },
    { x: tower.hitX, y: tower.hitY, w: tower.hitW, h: tower.hitH }
  );
}

export function updatePlayer(p, input, dt) {
  const axis = input.axis();
  p.aimX = input.aimX;
  p.aimY = input.aimY;
  p.facing = p.aimX >= p.x ? 1 : -1;
  p.shooting = !!input.fire;
  p.fireCd = Math.max(0, p.fireCd - dt);
  p.animT += dt;

  const accel = p.grounded ? ACCEL : AIR_ACCEL;
  if (axis) p.vx += axis * accel * dt;
  else p.vx *= p.grounded ? FRICTION : AIR_DRAG;
  if (p.vx > MAX_VX) p.vx = MAX_VX;
  if (p.vx < -MAX_VX) p.vx = -MAX_VX;

  if (input.jumpPressed) p.jumpBuf = JUMP_BUF;
  else p.jumpBuf = Math.max(0, p.jumpBuf - dt);
  if (p.grounded) p.coyote = COYOTE;
  else p.coyote = Math.max(0, p.coyote - dt);
  if (p.jumpBuf > 0 && p.coyote > 0) {
    p.vy = JUMP_V;
    p.grounded = false;
    p.jumpBuf = 0;
    p.coyote = 0;
  }
  if (!input.jumpHeld && p.vy < 0) p.vy *= JUMP_CUT;

  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  const plat = platformAt(p.x, p.y);
  if (p.vy >= 0 && plat && p.y >= plat.y) {
    p.y = plat.y;
    p.vy = 0;
    p.grounded = true;
  } else {
    p.grounded = false;
  }

  if (p.x < 70) p.x = 70;
  if (p.x > VIEW_W - 70) p.x = VIEW_W - 70;
  if (p.y > VIEW_H + 80) {
    p.x = 240;
    p.y = ROOF_Y;
    p.vx = 0;
    p.vy = 0;
  }
}

export function update(state, input, dt) {
  if (state.mode !== "play") return { events: [] };
  const events = [];
  if (state.freeze > 0) {
    state.freeze -= dt;
    return { events };
  }
  const step = Math.min(0.033, dt);
  state.time += step;
  state.comboT = Math.max(0, state.comboT - step);
  if (state.comboT <= 0) state.combo = 0;
  state.sayT = Math.max(0, state.sayT - step);
  if (state.sayT <= 0) state.say = null;
  state.bannerT = Math.max(0, state.bannerT - step);
  if (state.bannerT <= 0) state.banner = "";
  state.shake = Math.max(0, state.shake - step * 28);

  const d = difficulty(state.time);
  if (d.wave !== state.waveShown) {
    state.waveShown = d.wave;
    state.banner = `WAVE ${d.wave}`;
    state.bannerT = 1.6;
    events.push({ type: "wave", wave: d.wave });
  }

  updatePlayer(state.player, input, step);

  if (state.player.shooting && state.player.fireCd <= 0) {
    spawnBullet(state);
    state.player.fireCd = FIRE_RATE;
    events.push({ type: "shoot" });
  }

  state.spawnT -= step;
  if (state.spawnT <= 0 && state.planes.length < d.maxPlanes) {
    spawnPlane(state);
    state.spawnT = d.spawn * (0.7 + state.rng() * 0.5);
    events.push({ type: "spawn" });
  }

  for (const b of state.bullets) {
    b.x += b.vx * step;
    b.y += b.vy * step;
    b.life -= step;
  }
  state.bullets = state.bullets.filter(
    (b) => b.life > 0 && b.x > -40 && b.x < VIEW_W + 40 && b.y > -40 && b.y < VIEW_H + 40
  );

  for (const pl of state.planes) {
    pl.bob += step * 6;
    pl.x += pl.vx * step;
    pl.y += pl.vy * step + Math.sin(pl.bob) * 8 * step;
  }

  for (const b of [...state.bullets]) {
    const box = { x: b.x - 8, y: b.y - 4, w: 22, h: 8 };
    for (const pl of [...state.planes]) {
      if (aabb(box, pl)) {
        pl.hp -= 1;
        b.life = 0;
        state.fx.push({ kind: "spark", x: b.x, y: b.y, t: 0, life: 0.12, color: b.color });
        if (pl.hp <= 0) {
          const got = killPlane(state, pl, true);
          events.push({ type: "kill", score: got, x: pl.x, y: pl.y });
        }
        break;
      }
    }
  }
  state.bullets = state.bullets.filter((b) => b.life > 0);

  for (const pl of [...state.planes]) {
    const tower = state.towers.find((t) => t.id === pl.target) || state.towers[0];
    if (planeHitsTower(pl, tower)) {
      tower.hp = Math.max(0, tower.hp - TOWER_HIT);
      killPlane(state, pl, false);
      events.push({ type: "impact", tower: tower.id, hp: tower.hp });
      if (tower.hp <= 0) {
        state.mode = "dead";
        events.push({ type: "dead", tower: tower.id });
      }
    }
  }

  for (const f of state.fx) f.t += step;
  state.fx = state.fx.filter((f) => f.t < f.life);

  return { events };
}
