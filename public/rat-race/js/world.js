import { MAP, CELL, PROP_META, CFG } from "./config.js";

export function cellToWorld(col, row) {
  const cols = MAP[0].length;
  const rows = MAP.length;
  return {
    x: (col - (cols - 1) / 2) * CELL,
    z: (row - (rows - 1) / 2) * CELL,
  };
}

export function worldToCell(x, z) {
  const cols = MAP[0].length;
  const rows = MAP.length;
  const col = Math.round(x / CELL + (cols - 1) / 2);
  const row = Math.round(z / CELL + (rows - 1) / 2);
  return { col, row };
}

function aabbFromCell(col, row, pad = 0) {
  const { x, z } = cellToWorld(col, row);
  const h = CELL * 0.5 - pad;
  return { minX: x - h, maxX: x + h, minZ: z - h, maxZ: z + h };
}

function mergeAabb(a, b) {
  return {
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minZ: Math.min(a.minZ, b.minZ),
    maxZ: Math.max(a.maxZ, b.maxZ),
  };
}

function clusterLetters(ch) {
  const rows = MAP.length;
  const cols = MAP[0].length;
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const out = [];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (MAP[r][c] !== ch || seen[r][c]) continue;
      const cells = [];
      const stack = [[c, r]];
      seen[r][c] = true;
      while (stack.length) {
        const [cc, rr] = stack.pop();
        cells.push([cc, rr]);
        for (const [dx, dy] of dirs) {
          const nc = cc + dx;
          const nr = rr + dy;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          if (seen[nr][nc] || MAP[nr][nc] !== ch) continue;
          seen[nr][nc] = true;
          stack.push([nc, nr]);
        }
      }
      out.push(cells);
    }
  }
  return out;
}

export function parseMap() {
  for (const row of MAP) {
    if (row.length !== MAP[0].length) {
      throw new Error(`Map row length ${row.length} != ${MAP[0].length}: ${row}`);
    }
  }

  const walls = [];
  const walkable = [];
  const rows = MAP.length;
  const cols = MAP[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = MAP[r][c];
      if (ch === "#") {
        walls.push({ ...aabbFromCell(c, r, 0), kind: "wall" });
      }
      const blocked = ch === "#" || "DTFBO".includes(ch);
      walkable.push({ c, r, ok: !blocked });
    }
  }

  const walkSet = new Set(
    walkable.filter((w) => w.ok).map((w) => `${w.c},${w.r}`)
  );

  const props = [];
  for (const [ch, meta] of Object.entries(PROP_META)) {
    for (const cells of clusterLetters(ch)) {
      let box = null;
      let sx = 0;
      let sz = 0;
      for (const [c, r] of cells) {
        const a = aabbFromCell(c, r, meta.type === "lamp" ? 0.35 : 0.06);
        box = box ? mergeAabb(box, a) : a;
        const p = cellToWorld(c, r);
        sx += p.x;
        sz += p.z;
      }
      const n = cells.length;
      props.push({
        ...meta,
        ...box,
        x: sx / n,
        z: sz / n,
        cells,
        solid: meta.type !== "lamp",
      });
    }
  }

  const xCells = clusterLetters("X").flat();
  if (!xCells.length) throw new Error("Map missing X dispenser");
  let xBox = null;
  let xx = 0;
  let xz = 0;
  for (const [c, r] of xCells) {
    const a = aabbFromCell(c, r, 0);
    xBox = xBox ? mergeAabb(xBox, a) : a;
    const p = cellToWorld(c, r);
    xx += p.x;
    xz += p.z;
  }
  const dispenser = {
    x: xx / xCells.length,
    z: xz / xCells.length,
    ...xBox,
    // Thin collision at the back (north) so rats can stand at the hopper.
    solid: {
      minX: xBox.minX + 0.15,
      maxX: xBox.maxX - 0.15,
      minZ: xBox.minZ,
      maxZ: xBox.minZ + CELL * 0.55,
    },
  };
  const northX = Math.min(...xCells.map(([, r]) => r));
  for (const [c, r] of xCells) {
    if (r === northX) walkSet.delete(`${c},${r}`);
  }

  const spawns = clusterLetters("S")
    .flat()
    .map(([c, r]) => cellToWorld(c, r));

  const solids = [
    ...walls,
    ...props.filter((p) => p.solid),
    { ...dispenser.solid, kind: "kiosk" },
  ];

  const hideables = props.filter((p) => p.hide);

  const halfW = (cols * CELL) / 2;
  const halfD = (rows * CELL) / 2;

  return {
    cols,
    rows,
    walls,
    props,
    solids,
    hideables,
    dispenser,
    spawns,
    walkSet,
    bounds: { minX: -halfW + CELL, maxX: halfW - CELL, minZ: -halfD + CELL, maxZ: halfD - CELL },
    size: { w: cols * CELL, d: rows * CELL },
  };
}

export function isWalkCell(world, col, row) {
  return world.walkSet.has(`${col},${row}`);
}

export function neighbors(world, col, row) {
  const out = [];
  const opts = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [dx, dy] of opts) {
    const nc = col + dx;
    const nr = row + dy;
    if (!isWalkCell(world, nc, nr)) continue;
    if (dx && dy) {
      if (!isWalkCell(world, col + dx, row) || !isWalkCell(world, col, row + dy)) continue;
    }
    out.push({ col: nc, row: nr, cost: dx && dy ? 1.41 : 1 });
  }
  return out;
}

export function astar(world, sx, sz, tx, tz) {
  const a = worldToCell(sx, sz);
  const b = worldToCell(tx, tz);
  if (!isWalkCell(world, a.col, a.row)) {
    const n = nearestWalk(world, a.col, a.row);
    if (!n) return [];
    a.col = n.col;
    a.row = n.row;
  }
  if (!isWalkCell(world, b.col, b.row)) {
    const n = nearestWalk(world, b.col, b.row);
    if (!n) return [];
    b.col = n.col;
    b.row = n.row;
  }
  const key = (c, r) => `${c},${r}`;
  const open = [{ c: a.col, r: a.row, g: 0, f: 0 }];
  const came = new Map();
  const gScore = new Map([[key(a.col, a.row), 0]]);
  const heur = (c, r) => Math.hypot(c - b.col, r - b.row);
  let guard = 0;
  while (open.length && guard++ < 900) {
    open.sort((p, q) => p.f - q.f);
    const cur = open.shift();
    if (cur.c === b.col && cur.r === b.row) {
      const path = [{ col: cur.c, row: cur.r }];
      let k = key(cur.c, cur.r);
      while (came.has(k)) {
        const prev = came.get(k);
        path.push(prev);
        k = key(prev.col, prev.row);
      }
      path.reverse();
      return path.map((p) => cellToWorld(p.col, p.row));
    }
    for (const n of neighbors(world, cur.c, cur.r)) {
      const nk = key(n.col, n.row);
      const g = (gScore.get(key(cur.c, cur.r)) ?? 1e9) + n.cost;
      if (g < (gScore.get(nk) ?? 1e9)) {
        came.set(nk, { col: cur.c, row: cur.r });
        gScore.set(nk, g);
        open.push({ c: n.col, r: n.row, g, f: g + heur(n.col, n.row) });
      }
    }
  }
  return [];
}

export function nearestWalk(world, col, row) {
  let best = null;
  let bestD = 1e9;
  for (const k of world.walkSet) {
    const [c, r] = k.split(",").map(Number);
    const d = Math.hypot(c - col, r - row);
    if (d < bestD) {
      bestD = d;
      best = { col: c, row: r };
    }
  }
  return best;
}

export function circleResolve(x, z, r, solids) {
  let px = x;
  let pz = z;
  for (let i = 0; i < 4; i++) {
    for (const s of solids) {
      const nx = Math.max(s.minX, Math.min(px, s.maxX));
      const nz = Math.max(s.minZ, Math.min(pz, s.maxZ));
      let dx = px - nx;
      let dz = pz - nz;
      let d = Math.hypot(dx, dz);
      if (d < 1e-6) {
        const left = px - s.minX;
        const right = s.maxX - px;
        const up = pz - s.minZ;
        const down = s.maxZ - pz;
        const m = Math.min(left, right, up, down);
        if (m === left) px = s.minX - r;
        else if (m === right) px = s.maxX + r;
        else if (m === up) pz = s.minZ - r;
        else pz = s.maxZ + r;
        continue;
      }
      if (d < r) {
        const push = (r - d) / d;
        px += dx * push;
        pz += dz * push;
      }
    }
  }
  return { x: px, z: pz };
}

export function segmentHitsAabb(x1, z1, x2, z2, box) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  let t0 = 0;
  let t1 = 1;
  const clip = (p, q) => {
    if (Math.abs(p) < 1e-8) return q >= 0;
    const t = q / p;
    if (p < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
    return true;
  };
  if (!clip(-dx, x1 - box.minX)) return false;
  if (!clip(dx, box.maxX - x1)) return false;
  if (!clip(-dz, z1 - box.minZ)) return false;
  if (!clip(dz, box.maxZ - z1)) return false;
  return true;
}

function pointInAabb(x, z, s) {
  return x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ;
}

export function losBlocked(world, x1, z1, x2, z2) {
  for (const s of world.solids) {
    if (pointInAabb(x1, z1, s) || pointInAabb(x2, z2, s)) continue;
    if (segmentHitsAabb(x1, z1, x2, z2, s)) return s;
  }
  return null;
}

export function isHiddenFrom(world, rat, watcher) {
  for (const h of world.hideables) {
    const near =
      rat.x > h.minX - CFG.hideDist &&
      rat.x < h.maxX + CFG.hideDist &&
      rat.z > h.minZ - CFG.hideDist &&
      rat.z < h.maxZ + CFG.hideDist;
    if (!near) continue;
    if (pointInAabb(watcher.x, watcher.z, h) || pointInAabb(rat.x, rat.z, h)) continue;
    if (segmentHitsAabb(watcher.x, watcher.z, rat.x, rat.z, h)) return true;
  }
  return false;
}

export function fatness(pellets) {
  return Math.min(1, pellets / CFG.fatPellets);
}

export function radiusFor(pellets) {
  const f = fatness(pellets);
  return CFG.skinnyR + (CFG.fatR - CFG.skinnyR) * (f * f * 0.35 + f * 0.65);
}

export function speedFor(base, fatBase, pellets) {
  const f = fatness(pellets);
  const t = f ** 1.15;
  return base + (fatBase - base) * t;
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function overlapsSolid(world, x, z, r = 0.2) {
  for (const s of world.solids) {
    const nx = Math.max(s.minX, Math.min(x, s.maxX));
    const nz = Math.max(s.minZ, Math.min(z, s.maxZ));
    if (Math.hypot(x - nx, z - nz) < r) return true;
  }
  return false;
}

export function nearestWalkablePos(world, x, z) {
  const c = worldToCell(x, z);
  let cell = isWalkCell(world, c.col, c.row) ? c : nearestWalk(world, c.col, c.row);
  if (!cell) return { x, z };
  const p = cellToWorld(cell.col, cell.row);
  return circleResolve(p.x, p.z, 0.22, world.solids);
}

export function placeInOpen(world, x, z, r = 0.22) {
  const tries = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [-2, 0], [0, 2], [0, -2]];
  for (const [dx, dz] of tries) {
    const px = x + dx * 0.55;
    const pz = z + dz * 0.55;
    const resolved = circleResolve(px, pz, r, world.solids);
    if (!overlapsSolid(world, resolved.x, resolved.z, r + 0.02)) {
      const cell = worldToCell(resolved.x, resolved.z);
      if (isWalkCell(world, cell.col, cell.row)) return resolved;
    }
  }
  return nearestWalkablePos(world, x, z);
}

export function randomWalkableNear(world, x, z, radius = 3) {
  const c = worldToCell(x, z);
  const opts = [];
  for (let dc = -radius; dc <= radius; dc++) {
    for (let dr = -radius; dr <= radius; dr++) {
      if (!dc && !dr) continue;
      if (isWalkCell(world, c.col + dc, c.row + dr)) opts.push({ col: c.col + dc, row: c.row + dr });
    }
  }
  if (!opts.length) return nearestWalkablePos(world, x, z);
  const pick = opts[(Math.random() * opts.length) | 0];
  return cellToWorld(pick.col, pick.row);
}

/** Screen-space facing bucket for 4-dir sprites. */
export function screenFace(ent, axes) {
  const sx = ent.facingX * axes.fx.x + ent.facingZ * axes.fx.z;
  const sy = ent.facingX * axes.fz.x + ent.facingZ * axes.fz.z;
  if (Math.abs(sx) >= Math.abs(sy)) return sx >= 0 ? "e" : "w";
  return sy >= 0 ? "n" : "s";
}

export function canSee(world, watcher, target, facing) {
  if (target.dead || target.invuln > 0) return false;
  if (losBlocked(world, watcher.x, watcher.z, target.x, target.z)) return false;
  const d = dist(watcher, target);
  if (d < CFG.catNear) return true;
  if (d > CFG.catSight) return false;
  const fx = facing?.x ?? 0;
  const fz = facing?.z ?? 1;
  const fl = Math.hypot(fx, fz) || 1;
  const dx = (target.x - watcher.x) / d;
  const dz = (target.z - watcher.z) / d;
  const dot = (fx / fl) * dx + (fz / fl) * dz;
  return dot >= CFG.catSightDot;
}
