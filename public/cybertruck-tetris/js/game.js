/**
 * Three-truck color assembly line.
 * Parts are paint + type; every spawn has ≥1 open home across the line.
 */

import {
  CANVAS,
  PART_DEFS,
  TRUCK_BLUEPRINT,
  LINE,
  levelConfig,
  bayCenters,
} from "./config.js";

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normRot(r) {
  let x = r % 360;
  if (x < 0) x += 360;
  return x;
}

function rotDelta(a, b) {
  let d = Math.abs(normRot(a) - normRot(b));
  if (d > 180) d = 360 - d;
  return d;
}

function makeTruck(paintId, activeSocketIds, bayIndex, x) {
  const filled = {};
  for (const id of activeSocketIds) filled[id] = false;
  return {
    bayIndex,
    paintId,
    filled,
    x,
    y: LINE.truckY,
    scale: LINE.truckScale,
    driving: null,
    landFlash: 0,
  };
}

function activeSocketsList(cfg) {
  return TRUCK_BLUEPRINT.sockets.filter((s) => cfg.activeSockets.includes(s.id));
}

/**
 * Every open need on the line: { truck, socket, paintId, type }
 * Spawning only picks from this list — no dead draws.
 */
function collectOpenNeeds(trucks, cfg) {
  const sockets = activeSocketsList(cfg);
  const needs = [];
  for (const truck of trucks) {
    if (truck.driving) continue;
    for (const s of sockets) {
      if (!truck.filled[s.id]) {
        needs.push({
          truck,
          socket: s,
          paintId: truck.paintId,
          type: s.part,
        });
      }
    }
  }
  return needs;
}

function partHasHome(part, trucks, cfg) {
  if (!part) return false;
  return collectOpenNeeds(trucks, cfg).some(
    (n) => n.paintId === part.paintId && n.type === part.type
  );
}

function makeFallingPart(need) {
  const rotOptions = [0, 90, 180, 270];
  let rot = randPick(rotOptions);
  if (need.type !== "wheel" && rot === 0 && Math.random() < 0.7) {
    rot = randPick([90, 180, 270]);
  }
  // Start roughly above a random bay so player must still steer
  return {
    type: need.type,
    paintId: need.paintId,
    x: CANVAS.width / 2 + (Math.random() - 0.5) * 160,
    y: 64,
    rot,
  };
}

export class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.level = 1;
    this.score = 0;
    this.trucksBuilt = 0;
    this.trucksThisLevel = 0;
    this.misses = 0;
    this.cfg = levelConfig(this.level);
    this.trucks = this._spawnLine();
    this.current = this._newPart();
    this.next = this._newPart();
    this.state = "playing";
    this.message = "";
    this.levelUpTimer = 0;
    this.particles = [];
    this.floaters = [];
    this.pulse = 0;
    this.softDropHeld = 0;
    /** Big on-screen flash: { text, life, maxLife } */
    this.announcement = null;
  }

  /**
   * Training guides: only for part types still being taught this level.
   * L1 all base parts · L2 canopy · L3 bumper · L4+ none
   */
  guidesForPart(partType) {
    const list = this.cfg.guidedParts || [];
    return list.includes(partType);
  }

  get showAnyGuides() {
    return (this.cfg.guidedParts || []).length > 0;
  }

  _spawnLine() {
    const centers = bayCenters(this.cfg.truckCount);
    // Distinct paints for the three bays
    const paints = shuffle(this.cfg.paintPool).slice(0, this.cfg.truckCount);
    // If pool has fewer than 3 (shouldn't), cycle
    while (paints.length < this.cfg.truckCount) {
      paints.push(this.cfg.paintPool[paints.length % this.cfg.paintPool.length]);
    }
    return paints.map((paintId, i) =>
      makeTruck(paintId, this.cfg.activeSockets, i, centers[i])
    );
  }

  _pickRefillPaint(exceptBay) {
    const used = new Set(
      this.trucks
        .filter((t, i) => i !== exceptBay && !t.driving)
        .map((t) => t.paintId)
    );
    const fresh = this.cfg.paintPool.filter((p) => !used.has(p));
    const pool = fresh.length ? fresh : this.cfg.paintPool;
    return randPick(pool);
  }

  _newPart() {
    const needs = collectOpenNeeds(this.trucks, this.cfg);
    if (!needs.length) return null;
    return makeFallingPart(randPick(needs));
  }

  _scrubOrphanParts() {
    if (this.next && !partHasHome(this.next, this.trucks, this.cfg)) {
      this.next = this._newPart();
    }
  }

  socketWorld(truck, socket) {
    const def = PART_DEFS[socket.part];
    const padX = (def.snapPadX || 0) * truck.scale;
    const padY = (def.snapPadY || 0) * truck.scale;
    return {
      x: truck.x + socket.x * truck.scale,
      y: truck.y + socket.y * truck.scale,
      rot: socket.rot,
      // Rectangular snap zone (wide battery pack needs more X than a circle allows)
      snapRX: socket.snapRX * truck.scale + padX,
      snapRY: socket.snapRY * truck.scale + padY,
      // For guide ring drawing — approx radius
      snapRadius: Math.max(socket.snapRX, socket.snapRY) * truck.scale,
      rotTolerance: socket.rotTolerance,
      id: socket.id,
      part: socket.part,
      paintId: truck.paintId,
      truck,
    };
  }

  togglePause() {
    if (this.state === "playing") {
      this.state = "paused";
      this.message = "Paused";
    } else if (this.state === "paused") {
      this.state = "playing";
      this.message = "";
    }
  }

  move(dir) {
    if (this.state !== "playing" || !this.current) return;
    this.current.x += dir * 18;
    this.current.x = Math.max(40, Math.min(CANVAS.width - 40, this.current.x));
  }

  rotate(dir = 1) {
    if (this.state !== "playing" || !this.current) return;
    this.current.rot = normRot(this.current.rot + dir * 90);
  }

  hardDrop() {
    if (this.state !== "playing" || !this.current) return;
    const target = this._bestSocketFor(this.current);
    if (target) {
      this.current.y = target.sock.y;
    } else {
      this.current.y = this._missY();
    }
    this._trySnapOrMiss(true);
  }

  softDrop() {
    if (this.state !== "playing" || !this.current) return;
    this.current.y += 12;
    this.score += 1;
    this._trySnapOrMiss(false);
  }

  _missY() {
    return LINE.truckY + 100 * LINE.truckScale;
  }

  update(dt) {
    this.pulse += dt * 0.004;
    this._updateFx(dt);
    if (this.announcement) {
      this.announcement.life -= dt;
      if (this.announcement.life <= 0) this.announcement = null;
    }

    if (this.state === "levelup") {
      this.levelUpTimer -= dt;
      if (this.levelUpTimer <= 0) this._nextLevel();
      return;
    }

    if (this.state !== "playing") return;

    // Advance drive-offs independently; refill when done
    for (let i = 0; i < this.trucks.length; i++) {
      const t = this.trucks[i];
      if (t.driving) {
        t.driving.t += dt / 900;
        if (t.driving.t >= 1) this._refillBay(i);
      }
      if (t.landFlash > 0) t.landFlash = Math.max(0, t.landFlash - dt);
    }

    if (this.current) {
      this.current.y += (this.cfg.fallSpeed * dt) / 1000;
      this._magnet(dt);
      this._trySnapOrMiss(false);
    } else if (collectOpenNeeds(this.trucks, this.cfg).length) {
      // Resume after all-driving edge case
      this.current = this._newPart();
      this.next = this.next || this._newPart();
    }
  }

  _magnet(dt) {
    const hit = this._bestSocketFor(this.current);
    if (!hit || !hit.rotOk) return;
    // Pull when roughly over the bay (generous approach zone)
    const near =
      Math.abs(this.current.x - hit.sock.x) < hit.sock.snapRX * 2.2 &&
      Math.abs(this.current.y - hit.sock.y) < hit.sock.snapRY * 3.5;
    if (!near) return;
    const strength = hit.inRange ? 0.55 : 0.28;
    const k = Math.min(0.45, strength * (dt / 16));
    this.current.x += (hit.sock.x - this.current.x) * k;
    this.current.y += (hit.sock.y - this.current.y) * k * 0.85;
  }

  _trySnapOrMiss(force) {
    if (!this.current) return;

    const snap = this._bestSocketFor(this.current);
    if (snap && snap.inRange && snap.rotOk) {
      this._attach(snap, this.current);
      this._spawnNext();
      return;
    }

    if (force || this.current.y >= this._missY()) {
      this._miss(this.current, snap);
      this._spawnNext();
    }
  }

  /**
   * Best open socket matching part TYPE + PAINT across all trucks.
   * Snap uses an axis-aligned box (not a circle) so wide battery packs land reliably.
   */
  _bestSocketFor(part) {
    if (!part) return null;
    const sockets = activeSocketsList(this.cfg);
    let best = null;
    let bestScore = Infinity;

    for (const truck of this.trucks) {
      if (truck.driving) continue;
      if (truck.paintId !== part.paintId) continue;

      for (const s of sockets) {
        if (s.part !== part.type) continue;
        if (truck.filled[s.id]) continue;

        const sock = this.socketWorld(truck, s);
        const dx = Math.abs(part.x - sock.x);
        const dy = Math.abs(part.y - sock.y);
        // Normalized distance inside the snap box (0 = perfect, 1 = on edge)
        const nx = dx / sock.snapRX;
        const ny = dy / sock.snapRY;
        const score = nx * nx + ny * ny;
        const rotOk =
          PART_DEFS[part.type].okRots.some(
            (r) => rotDelta(part.rot, r) <= sock.rotTolerance
          ) || rotDelta(part.rot, sock.rot) <= sock.rotTolerance;

        if (score < bestScore) {
          bestScore = score;
          best = {
            sock,
            dist: Math.hypot(dx, dy),
            rotOk,
            inRange: dx <= sock.snapRX && dy <= sock.snapRY,
            truck,
          };
        }
      }
    }
    return best;
  }

  _attach(snap, part) {
    const { sock, truck } = snap;
    truck.filled[sock.id] = true;
    truck.landFlash = 280;
    const pts = 100 * this.level;
    this.score += pts;
    this._float(`+${pts}`, sock.x, sock.y - 30, "#00e0b0");
    this._sparks(sock.x, sock.y, part.paintId);

    if (
      Math.abs(part.x - sock.x) < sock.snapRX * 0.35 &&
      Math.abs(part.y - sock.y) < sock.snapRY * 0.35
    ) {
      this.score += 40;
      this._float("PERFECT", sock.x, sock.y - 50, "#f0b429");
    }

    this._scrubOrphanParts();

    if (this._isComplete(truck)) this._completeTruck(truck);
  }

  _isComplete(truck) {
    return this.cfg.activeSockets.every((id) => truck.filled[id]);
  }

  _completeTruck(truck) {
    truck.driving = { t: 0 };
    this.trucksBuilt += 1;
    this.trucksThisLevel += 1;
    const bonus = 300 * this.level;
    this.score += bonus;
    this._float(`TRUCK +${bonus}`, truck.x, truck.y - 80, "#f0b429");
    this._scrubOrphanParts();

    if (this.trucksThisLevel >= this.cfg.trucksToClear) {
      this.state = "levelup";
      this.levelUpTimer = 1500;
      this.score += 500 * this.level;
      this.message = `Level ${this.level} clear`;
    }
  }

  _refillBay(index) {
    const centers = bayCenters(this.cfg.truckCount);
    const paintId = this._pickRefillPaint(index);
    this.trucks[index] = makeTruck(
      paintId,
      this.cfg.activeSockets,
      index,
      centers[index]
    );
    // Ensure bag is valid for new line state
    this._scrubOrphanParts();
    if (!this.current) this.current = this._newPart();
    if (!this.next) this.next = this._newPart();
  }

  _nextLevel() {
    this.level += 1;
    this.trucksThisLevel = 0;
    this.misses = Math.max(0, this.misses - 2);
    this.cfg = levelConfig(this.level);
    this.trucks = this._spawnLine();
    this.current = this._newPart();
    this.next = this._newPart();
    this.state = "playing";
    this.message = "";
    this._float(`LEVEL ${this.level}`, CANVAS.width / 2, 200, "#00e0b0");
  }

  _spawnNext() {
    const needs = collectOpenNeeds(this.trucks, this.cfg);
    if (!needs.length) {
      // All trucks driving or complete — wait for refill
      this.current = null;
      if (this.next && !partHasHome(this.next, this.trucks, this.cfg)) {
        this.next = null;
      }
      return;
    }

    this.current = this.next;
    if (!this.current || !partHasHome(this.current, this.trucks, this.cfg)) {
      this.current = this._newPart();
    }
    if (this.current) {
      this.current.x = CANVAS.width / 2 + (Math.random() - 0.5) * 120;
      this.current.y = 64;
    }
    this.next = this._newPart();
  }

  _miss(part, snap) {
    this.misses += 1;
    this.score = Math.max(0, this.score - 15);
    this._float("MISS", part.x, part.y - 16, "#ff3b4a");
    this._sparks(part.x, part.y, part.paintId, 6);

    if (!snap) {
      this._float("wrong truck / no socket", part.x, part.y + 14, "#f0b429");
    } else if (!snap.rotOk) {
      this._float("wrong rotation", part.x, part.y + 14, "#f0b429");
    } else {
      this._float("not aligned", part.x, part.y + 14, "#f0b429");
    }

    if (this.misses >= this.cfg.missLimit) {
      this.state = "gameover";
      this.message = `Too many misses (${this.misses}).`;
    }
  }

  _updateFx(dt) {
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt * 0.05;
      p.y += p.vy * dt * 0.05;
      p.vy += 0.015 * dt;
      return p.life > 0;
    });
    this.floaters = this.floaters.filter((f) => {
      f.life -= dt;
      f.y -= 0.035 * dt;
      return f.life > 0;
    });
  }

  _float(text, x, y, color) {
    this.floaters.push({ text, x, y, color, life: 900 });
  }

  _sparks(x, y, paintId, n = 14) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 4 - 1,
        life: 350 + Math.random() * 300,
        paintId,
      });
    }
  }

  previewSnap() {
    return this._bestSocketFor(this.current);
  }

  /** Progress helpers for HUD */
  lineProgress() {
    let filled = 0;
    let total = 0;
    for (const t of this.trucks) {
      if (t.driving) continue;
      for (const id of this.cfg.activeSockets) {
        total += 1;
        if (t.filled[id]) filled += 1;
      }
    }
    return { filled, total };
  }
}
