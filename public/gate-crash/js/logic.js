/** Pure scoring, damage, and traffic-path helpers — no renderer. */

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function impactDamage(speed, maxHp, minSpeed = 5.5, oneShot = 24) {
  if (!(speed > 0) || speed < minSpeed) return 0;
  const t = clamp((speed - minSpeed) / (oneShot - minSpeed), 0, 1);
  return Math.min(maxHp, Math.round((0.22 + 0.78 * t) * maxHp));
}

export function teslaScore(combo, base = 750) {
  const c = Math.max(1, combo | 0);
  return Math.round(base * (1 + (c - 1) * 0.35));
}

export function sectionScore(kind) {
  if (kind === "tower") return 2500;
  if (kind === "brace") return 200;
  return 150;
}

export function speedBonus(seconds, par = 180, perSec = 70) {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.max(0, Math.round((par - seconds) * perSec));
}

export function computeGrade(score) {
  if (score >= 45000) return "S";
  if (score >= 32000) return "A";
  if (score >= 20000) return "B";
  if (score >= 11000) return "C";
  return "D";
}

export function totalScore({ teslaPts, sectionPts, seconds, par, perSec }) {
  return (teslaPts | 0) + (sectionPts | 0) + speedBonus(seconds, par, perSec);
}

/** Consecutive alive runs along an ordered boolean deck array. */
export function connectedRuns(alive) {
  const runs = [];
  let start = -1;
  for (let i = 0; i < alive.length; i++) {
    if (alive[i]) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      runs.push({ start, end: i - 1 });
      start = -1;
    }
  }
  if (start >= 0) runs.push({ start, end: alive.length - 1 });
  return runs;
}

export function sectionIndexAtZ(z, z0, segLen, count) {
  const i = Math.floor((z - z0) / segLen);
  if (i < 0 || i >= count) return -1;
  return i;
}

export function carCanDrive(alive, index) {
  return index >= 0 && index < alive.length && !!alive[index];
}

/**
 * Step a car along Z. If its deck cell is gone it starts falling.
 * Pure: returns a new car object.
 */
export function stepCar(car, dt, alive, z0, segLen, count) {
  if (car.dead) return car;
  if (car.falling) {
    return {
      ...car,
      y: car.y - 22 * dt,
      z: car.z + car.dir * car.speed * 0.35 * dt,
      fallT: (car.fallT || 0) + dt,
    };
  }
  const idx = sectionIndexAtZ(car.z, z0, segLen, count);
  if (!carCanDrive(alive, idx)) {
    return { ...car, falling: true, fallT: 0 };
  }
  const nextZ = car.z + car.dir * car.speed * dt;
  const nextIdx = sectionIndexAtZ(nextZ, z0, segLen, count);
  if (nextIdx !== idx && !carCanDrive(alive, nextIdx)) {
    return { ...car, falling: true, fallT: 0, z: car.z };
  }
  return { ...car, z: nextZ };
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00.0";
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

export function allDestroyed(flags) {
  return flags.length > 0 && flags.every((a) => !a);
}
