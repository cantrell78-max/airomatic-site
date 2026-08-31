import { VIEW_W, VIEW_H, GROUND_Y } from "./config.js";

export function createFx() {
  return {
    shake: 0,
    freeze: 0,
    rain: Array.from({ length: 90 }, () => ({
      x: Math.random() * VIEW_W,
      y: Math.random() * VIEW_H,
      z: 0.6 + Math.random() * 1.4,
    })),
    bits: [],
    floats: [],
    smoke: Array.from({ length: 18 }, () => ({
      x: Math.random() * 960,
      y: 80 + Math.random() * 200,
      t: Math.random() * 10,
      s: 20 + Math.random() * 40,
    })),
  };
}

export function spawnBits(fx, x, y, kind, camX) {
  const n = kind === "glass" ? 14 : kind === "orb" ? 12 : 10;
  for (let i = 0; i < n; i++) {
    fx.bits.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 280,
      vy: -120 - Math.random() * 280,
      life: 0.4 + Math.random() * 0.5,
      c: kind === "glass" ? "#c9a227" : kind === "orb" ? "#c45cff" : "#e0b43a",
      s: 2 + Math.random() * 4,
    });
  }
  void camX;
}

export function spawnFloat(fx, x, y, text) {
  fx.floats.push({ x, y, text, life: 0.9 });
}

export function updateFx(fx, dt, camX) {
  if (fx.shake > 0) fx.shake = Math.max(0, fx.shake - dt * 48);
  if (fx.freeze > 0) fx.freeze = Math.max(0, fx.freeze - dt);

  for (const r of fx.rain) {
    r.y += (420 + r.z * 280) * dt;
    r.x -= 90 * dt;
    if (r.y > VIEW_H) {
      r.y = -10;
      r.x = Math.random() * VIEW_W;
    }
    if (r.x < -20) r.x += VIEW_W + 40;
  }
  for (const s of fx.smoke) s.t += dt;

  for (let i = fx.bits.length - 1; i >= 0; i--) {
    const b = fx.bits[i];
    b.life -= dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vy += 900 * dt;
    if (b.life <= 0) fx.bits.splice(i, 1);
  }
  for (let i = fx.floats.length - 1; i >= 0; i--) {
    const f = fx.floats[i];
    f.life -= dt;
    f.y -= 40 * dt;
    if (f.life <= 0) fx.floats.splice(i, 1);
  }
  void camX;
  void GROUND_Y;
}

export function drawRain(ctx, fx, trip) {
  ctx.save();
  ctx.strokeStyle = trip ? "rgba(210,160,255,0.28)" : "rgba(200,214,230,0.22)";
  ctx.lineWidth = 1;
  for (const r of fx.rain) {
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 4 * r.z, r.y + 12 * r.z);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawBits(ctx, fx, toScreen) {
  for (const b of fx.bits) {
    ctx.globalAlpha = Math.max(0, b.life * 2);
    ctx.fillStyle = b.c;
    ctx.fillRect(toScreen(b.x) - b.s / 2, b.y - b.s / 2, b.s, b.s);
  }
  ctx.globalAlpha = 1;
  for (const f of fx.floats) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = "#f0d060";
    ctx.font = "700 16px Oswald, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.text, toScreen(f.x), f.y);
  }
  ctx.globalAlpha = 1;
}
