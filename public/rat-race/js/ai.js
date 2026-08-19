import { CFG } from "./config.js";
import {
  astar,
  dist,
  canSee,
  isHiddenFrom,
  fatness,
  nearestWalkablePos,
  randomWalkableNear,
  overlapsSolid,
} from "./world.js";

function steerTo(entity, target, speed, dt) {
  const dx = target.x - entity.x;
  const dz = target.z - entity.z;
  const d = Math.hypot(dx, dz) || 1;
  entity.vx = (dx / d) * speed;
  entity.vz = (dz / d) * speed;
  entity.facingX = dx / d;
  entity.facingZ = dz / d;
  entity.x += entity.vx * dt;
  entity.z += entity.vz * dt;
  return d;
}

function followPath(entity, path, speed, dt, arrive = 0.45) {
  if (!path || path.length === 0) {
    entity.vx = 0;
    entity.vz = 0;
    return true;
  }
  while (path.length > 1 && dist(entity, path[0]) < 0.4) path.shift();
  const d = steerTo(entity, path[0], speed, dt);
  if (d < arrive && path.length === 1) {
    path.shift();
    entity.vx = 0;
    entity.vz = 0;
    return true;
  }
  return false;
}

function hideSpot(world, rat, cat, rats) {
  let best = null;
  let bestScore = -1e9;
  for (const h of world.hideables) {
    const cx = (h.minX + h.maxX) / 2;
    const cz = (h.minZ + h.maxZ) / 2;
    const awayX = cx - cat.x;
    const awayZ = cz - cat.z;
    const al = Math.hypot(awayX, awayZ) || 1;
    for (const distOut of [1.35, 1.8, 2.2]) {
      const raw = { x: cx + (awayX / al) * distOut, z: cz + (awayZ / al) * distOut };
      const pos = nearestWalkablePos(world, raw.x, raw.z);
      if (overlapsSolid(world, pos.x, pos.z, rat.r + 0.05)) continue;
      let crowd = 0;
      for (const other of rats) {
        if (other === rat) continue;
        if (dist(other, pos) < 1.1) crowd += 1;
      }
      const toCat = Math.hypot(pos.x - cat.x, pos.z - cat.z);
      const toMe = dist(rat, pos);
      const score = toCat * 1.3 - toMe - crowd * 4;
      if (score > bestScore) {
        bestScore = score;
        best = pos;
      }
    }
  }
  return best;
}

function unstick(rat, world) {
  const n = randomWalkableNear(world, rat.x, rat.z, 2);
  rat.x = n.x;
  rat.z = n.z;
  rat.path = null;
  rat.repath = 0;
  rat.stuckT = 0;
}

export function updateRival(rat, world, cat, rats, drops, remaining, dt) {
  if (rat.stun > 0) {
    rat.vx = 0;
    rat.vz = 0;
    return { feeding: false };
  }

  const moved = Math.hypot(rat.x - (rat.px ?? rat.x), rat.z - (rat.pz ?? rat.z));
  rat.px = rat.x;
  rat.pz = rat.z;
  if (moved < 0.025) rat.stuckT = (rat.stuckT || 0) + dt;
  else rat.stuckT = 0;
  if (rat.stuckT > 0.85) unstick(rat, world);

  const dCat = dist(rat, cat);
  const dX = dist(rat, world.dispenser);
  const hidden = isHiddenFrom(world, rat, cat);
  const seen = canSee(world, cat, rat, { x: cat.facingX, z: cat.facingZ });
  const fat = fatness(rat.pellets);
  const speed = rat.speed;

  const nearestDrop = drops.reduce((best, p) => {
    const d = dist(rat, p);
    if (!best || d < best.d) return { p, d };
    return best;
  }, null);

  let want = "seek";
  if (remaining <= 0 && nearestDrop) want = "loot";
  else if (seen && dCat < 8.5) want = "flee";
  else if (dCat < 4.2 && !hidden) want = "flee";
  else if (rat.personality === "cautious" && dCat < 7.2 && !hidden) want = "flee";
  else if (hidden && dCat < 5.5) want = "hold";
  else if (rat.personality === "loot" && nearestDrop && nearestDrop.d < 8 && dCat > 3.0) want = "loot";
  else if (nearestDrop && nearestDrop.d < 2.2) want = "loot";
  else if (remaining > 0 && dX < CFG.feedRadius + 0.15 && dCat > (rat.personality === "greedy" ? 3.1 : 4.4)) {
    want = "feed";
  } else want = "seek";

  if (want === "hold") {
    rat.holdT = (rat.holdT || 0) + dt;
    if (rat.holdT > 1.15) want = remaining > 0 ? "seek" : nearestDrop ? "loot" : "seek";
  } else {
    rat.holdT = 0;
  }

  rat.aiWant = want;
  rat.hidden = hidden;

  if (want === "hold") {
    rat.vx = 0;
    rat.vz = 0;
    rat.path = null;
    return { feeding: false };
  }

  if (want === "feed") {
    rat.vx = 0;
    rat.vz = 0;
    rat.path = null;
    return { feeding: true };
  }

  rat.repath -= dt;
  const goal =
    want === "flee"
      ? hideSpot(world, rat, cat, rats)
      : want === "loot" && nearestDrop
        ? nearestDrop.p
        : { x: world.dispenser.x, z: world.dispenser.z + 1.15 };

  if (!goal) {
    rat.vx = 0;
    rat.vz = 0;
    return { feeding: false };
  }

  if (rat.repath <= 0 || !rat.path || rat.path.length === 0) {
    rat.path = astar(world, rat.x, rat.z, goal.x, goal.z);
    if (!rat.path.length) {
      const n = randomWalkableNear(world, rat.x, rat.z, 3);
      rat.path = astar(world, rat.x, rat.z, n.x, n.z);
    }
    rat.repath = want === "flee" ? 0.22 : 0.4 + Math.random() * 0.15;
  }

  const hurry = want === "flee" ? 1.08 : want === "loot" ? 1.05 : 0.92 - fat * 0.08;
  followPath(rat, rat.path, speed * hurry, dt);
  return { feeding: false };
}

function catWaypoints(world) {
  const d = world.dispenser;
  return [
    { x: d.x, z: d.z + 3.2 },
    { x: d.x + 6.2, z: d.z + 1.2 },
    { x: 8.4, z: 0.6 },
    { x: 8.4, z: 5.2 },
    { x: 0, z: 5.6 },
    { x: -8.2, z: 5.2 },
    { x: -8.4, z: 0.4 },
    { x: d.x - 6.2, z: d.z + 1.2 },
  ].map((p) => nearestWalkablePos(world, p.x, p.z));
}

export function updateCat(cat, world, rats, noise, dt) {
  if (cat.celebrate > 0) {
    cat.celebrate -= dt;
    cat.vx = 0;
    cat.vz = 0;
    return;
  }

  const moved = Math.hypot(cat.x - (cat.px ?? cat.x), cat.z - (cat.pz ?? cat.z));
  cat.px = cat.x;
  cat.pz = cat.z;
  if (moved < 0.02) cat.stuckT = (cat.stuckT || 0) + dt;
  else cat.stuckT = 0;
  if (cat.stuckT > 1.1) {
    const n = randomWalkableNear(world, cat.x, cat.z, 2);
    cat.x = n.x;
    cat.z = n.z;
    cat.path = null;
    cat.stuckT = 0;
  }

  const facing = { x: cat.facingX, z: cat.facingZ };
  let prey = null;
  let preyD = 1e9;
  for (const r of rats) {
    if (!canSee(world, cat, r, facing)) continue;
    const d = dist(cat, r);
    const score = d - fatness(r.pellets) * 1.8;
    if (score < preyD) {
      preyD = score;
      prey = r;
    }
  }

  if (prey) {
    if (cat.state !== "chase" || cat.preyId !== prey.id) {
      cat.justSpotted = prey.id;
    }
    cat.state = "chase";
    cat.preyId = prey.id;
    cat.lastSeen = { x: prey.x, z: prey.z };
    cat.repath -= dt;
    if (cat.repath <= 0 || !cat.path) {
      cat.path = astar(world, cat.x, cat.z, prey.x, prey.z);
      cat.repath = 0.18;
    }
    followPath(cat, cat.path, CFG.catChase, dt, 0.35);
    if (dist(cat, prey) < 3.2 && !isHiddenFrom(world, prey, cat)) {
      steerTo(cat, prey, CFG.catChase, dt);
    }
    return;
  }

  if (cat.state === "chase" && cat.lastSeen) {
    cat.state = "investigate";
    cat.path = astar(world, cat.x, cat.z, cat.lastSeen.x, cat.lastSeen.z);
    cat.repath = 0.3;
  }

  if (noise > 1.25 && cat.state !== "chase") {
    cat.state = "investigate";
    const t = nearestWalkablePos(world, world.dispenser.x, world.dispenser.z + 1.4);
    cat.repath -= dt;
    if (cat.repath <= 0 || !cat.path) {
      cat.path = astar(world, cat.x, cat.z, t.x, t.z);
      cat.repath = 0.32;
    }
    followPath(cat, cat.path, CFG.catSpeed * 1.12, dt);
    return;
  }

  cat.state = "patrol";
  if (!cat.waypoints) cat.waypoints = catWaypoints(world);
  if (cat.wp == null) cat.wp = 0;
  const dest = cat.waypoints[cat.wp % cat.waypoints.length];
  cat.repath -= dt;
  if (cat.repath <= 0 || !cat.path) {
    cat.path = astar(world, cat.x, cat.z, dest.x, dest.z);
    cat.repath = 0.7;
  }
  const arrived = followPath(cat, cat.path, CFG.catSpeed, dt, 0.55);
  if (arrived) {
    cat.wp = (cat.wp + 1) % cat.waypoints.length;
    cat.path = null;
  }
}
