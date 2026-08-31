import { WORLD_W, GROUND_Y, CEILING_Y, TRIP_ZONE, DANCE_ARENA } from "./config.js";

export function wrap(x, w = WORLD_W) {
  x %= w;
  if (x < 0) x += w;
  return x;
}

export function wrapDelta(a, b, w = WORLD_W) {
  let d = wrap(a, w) - wrap(b, w);
  if (d > w / 2) d -= w;
  if (d < -w / 2) d += w;
  return d;
}

export function inTrip(x) {
  const t = wrap(x);
  return t >= TRIP_ZONE[0] && t < TRIP_ZONE[1];
}

export function inArena(x) {
  const t = wrap(x);
  return t >= DANCE_ARENA[0] && t < DANCE_ARENA[1];
}

function plat(x, y, w, h, kind = "ledge") {
  return { x, y, w, h, kind };
}

export function buildLevel() {
  const platforms = [plat(0, GROUND_Y, WORLD_W, 120, "ground")];
  const props = [];
  const spawns = [];

  const lamps = [180, 620, 1080, 1540, 1980, 2460, 2920, 5480, 6020, 6580, 6980];
  for (const x of lamps) props.push({ type: "lamp", x, y: GROUND_Y });

  const fences = [340, 880, 1700, 2280, 2680, 5660, 6400];
  for (const x of fences) props.push({ type: "fence", x, y: GROUND_Y });

  const windows = [740, 1320, 2100, 5780, 6720];
  for (const x of windows) props.push({ type: "window", x, y: GROUND_Y - 150, street: true });

  const tripWindows = [3340, 3780, 4120, 4560, 4980];
  for (const x of tripWindows) props.push({ type: "window", x, y: GROUND_Y - 168, trip: true });

  const shrooms = [
    [3220, 70],
    [3480, 110],
    [3680, 86],
    [3920, 124],
    [4180, 78],
    [4380, 118],
    [4620, 92],
    [4860, 130],
    [5100, 84],
  ];
  for (const [x, lift] of shrooms) {
    const capY = GROUND_Y - lift;
    props.push({ type: "mushroom", x, y: GROUND_Y });
    platforms.push(plat(x - 38, capY - 18, 84, 18, "shroom"));
  }

  const ledges = [
    [460, 392, 150],
    [920, 368, 120],
    [1400, 384, 160],
    [1860, 360, 110],
    [2360, 376, 140],
    [2740, 350, 100],
    [5600, 388, 150],
    [6080, 364, 120],
    [6620, 380, 140],
  ];
  for (const [x, y, w] of ledges) platforms.push(plat(x, y, w, 22, "ledge"));

  const punks = [520, 960, 1280, 1760, 2140, 2580, 2860, 5540, 5920, 6360, 6780, 7060];
  for (const x of punks) spawns.push({ type: "punk", x, y: GROUND_Y });

  const bottles = [
    [700, 300],
    [1180, 240],
    [1620, 280],
    [2040, 220],
    [2500, 260],
    [3300, 210],
    [3560, 250],
    [4010, 190],
    [4440, 230],
    [4920, 200],
    [5840, 270],
    [6500, 230],
  ];
  for (const [x, y] of bottles) spawns.push({ type: "bottle", x, y });

  const orbs = [
    [820, 300, "clone"],
    [1480, 250, "stretch"],
    [2220, 290, "grav"],
    [3380, 200, "clone"],
    [3860, 180, "stretch"],
    [4300, 210, "grav"],
    [4740, 170, "clone"],
    [6180, 280, "stretch"],
    [6900, 260, "grav"],
  ];
  for (const [x, y, kind] of orbs) spawns.push({ type: "orb", x, y, kind });

  props.push({ type: "dwarfMid", x: 4000, y: GROUND_Y - 40 });

  return { platforms, props, spawns, ceiling: plat(-200, 0, WORLD_W + 400, CEILING_Y, "ceiling") };
}

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function actorBox(e) {
  return { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
}

export function moveAndCollide(ent, dt, platforms, gravSign) {
  ent.x = wrap(ent.x + ent.vx * dt);
  let grounded = false;
  const box = () => actorBox(ent);

  if (gravSign >= 0) {
    for (const p of platforms) {
      const b = box();
      const overlapX = b.x + b.w > p.x && b.x < p.x + p.w;
      if (!overlapX) continue;
      const feet = ent.y;
      const next = ent.y + ent.vy * dt;
      if (ent.vy >= 0 && feet <= p.y + 8 && next >= p.y) {
        ent.y = p.y;
        ent.vy = 0;
        grounded = true;
      }
    }
    if (!grounded) ent.y += ent.vy * dt;
  } else {
    for (const p of platforms) {
      const b = box();
      const overlapX = b.x + b.w > p.x && b.x < p.x + p.w;
      if (!overlapX) continue;
      const head = ent.y - ent.h;
      const nextHead = head + ent.vy * dt;
      const platBottom = p.y + p.h;
      if (ent.vy <= 0 && head >= platBottom - 8 && nextHead <= platBottom) {
        ent.y = platBottom + ent.h;
        ent.vy = 0;
        grounded = true;
      }
    }
    if (!grounded) ent.y += ent.vy * dt;
  }
  ent.y = Math.max(30, Math.min(GROUND_Y + 80, ent.y));
  return grounded;
}
