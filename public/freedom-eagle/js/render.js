import { VIEW_W, VIEW_H, ROOF_Y, TOWERS } from "./config.js";
import { muzzle } from "./sim.js";

export function createRenderer(canvas, assets) {
  const ctx = canvas.getContext("2d");

  const eagles = [
    { x: 120, y: 70, s: 0.55, v: 22, f: 0 },
    { x: 640, y: 48, s: 0.42, v: -16, f: 3 },
    { x: 400, y: 96, s: 0.35, v: 12, f: 5 },
  ];

  function frame(arr, t, fps) {
    const i = Math.floor(t * fps) % arr.length;
    return arr[i];
  }

  function drawTower(img, spec, roofFrac) {
    const destW = spec.w * 0.74;
    const destH = img.height * (destW / img.width);
    const x = spec.x + (spec.w - destW) * 0.5;
    const y = spec.roofY - destH * roofFrac;
    ctx.drawImage(img, x, y, destW, destH);
  }

  function bubble(text, x, y) {
    ctx.save();
    ctx.font = '700 18px Oswald, Impact, sans-serif';
    const w = Math.min(280, ctx.measureText(text).width + 28);
    const h = 36;
    const bx = x - w / 2;
    const by = y - 78;
    ctx.beginPath();
    const r = 10;
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + w - r, by);
    ctx.quadraticCurveTo(bx + w, by, bx + w, by + r);
    ctx.lineTo(bx + w, by + h - r);
    ctx.quadraticCurveTo(bx + w, by + h, bx + w - r, by + h);
    ctx.lineTo(bx + w / 2 + 10, by + h);
    ctx.lineTo(bx + w / 2, by + h + 12);
    ctx.lineTo(bx + w / 2 - 10, by + h);
    ctx.lineTo(bx + r, by + h);
    ctx.quadraticCurveTo(bx, by + h, bx, by + h - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
    ctx.fillStyle = "#fffdf5";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0b1a4a";
    ctx.stroke();
    ctx.fillStyle = "#0b1a4a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, by + h / 2);
    ctx.restore();
  }

  function draw(state, time) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const sx = state.mode === "play" ? (Math.random() * 2 - 1) * state.shake : 0;
    const sy = state.mode === "play" ? (Math.random() * 2 - 1) * state.shake : 0;
    ctx.save();
    ctx.translate(sx, sy);

    ctx.drawImage(assets.sky, 0, 0, VIEW_W, VIEW_H);

    const par = ((state.player?.x || 240) - 480) * 0.04;
    const mw = assets.manhattan.width;
    const mh = assets.manhattan.height;
    ctx.drawImage(assets.manhattan, 0, mh * 0.28, mw, mh * 0.72, -50 - par, 198, VIEW_W + 100, 360);
    ctx.drawImage(assets.liberty, 4 - par * 0.5, 175, 118, 250);

    for (const e of eagles) {
      e.x += e.v * 0.016;
      if (e.x > VIEW_W + 80) e.x = -80;
      if (e.x < -80) e.x = VIEW_W + 80;
      const img = frame(assets.eagle, time * 0.9 + e.f, 10);
      ctx.save();
      ctx.translate(e.x, e.y);
      if (e.v < 0) ctx.scale(-1, 1);
      const w = 110 * e.s;
      ctx.drawImage(img, -w / 2, -w * 0.4, w, w * 0.82);
      ctx.restore();
    }

    const flagImg = frame(assets.flag, time, 8);
    ctx.drawImage(flagImg, 70, 18, 150, 90);
    ctx.drawImage(flagImg, 740, 28, 130, 80);

    const n = state.towers[0];
    const s = state.towers[1];
    drawTower(n.hp < n.max * 0.55 ? assets.towerNorthDmg : assets.towerNorth, TOWERS[0], 0.3);
    drawTower(s.hp < s.max * 0.55 ? assets.towerSouthDmg : assets.towerSouth, TOWERS[1], 0.07);

    ctx.save();
    ctx.strokeStyle = "#8a93a0";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(400, ROOF_Y + 6);
    ctx.lineTo(560, ROOF_Y + 6);
    ctx.stroke();
    ctx.strokeStyle = "#c9d0d8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, ROOF_Y + 2);
    ctx.lineTo(560, ROOF_Y + 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(11, 26, 74, 0.35)";
    ctx.fillRect(70, ROOF_Y + 4, 360, 8);
    ctx.fillRect(530, ROOF_Y + 4, 360, 8);

    for (const pl of state.planes) {
      ctx.save();
      ctx.translate(pl.x + pl.w / 2, pl.y + pl.h / 2);
      if (pl.facing < 0) ctx.scale(-1, 1);
      const ang = Math.atan2(pl.vy, Math.abs(pl.vx));
      ctx.rotate(ang * 0.45);
      ctx.drawImage(assets.plane, -pl.w / 2, -pl.h / 2, pl.w, pl.h);
      ctx.restore();
      if (pl.hp < pl.max) {
        const bw = pl.w * 0.7;
        ctx.fillStyle = "#0b1a4a";
        ctx.fillRect(pl.x + 16, pl.y - 8, bw, 5);
        ctx.fillStyle = "#e30613";
        ctx.fillRect(pl.x + 16, pl.y - 8, bw * (pl.hp / pl.max), 5);
      }
    }

    const p = state.player;
    if (p) {
      const shoot = p.shooting && assets.heroShoot.length;
      const himg = shoot ? frame(assets.heroShoot, p.animT, 14) : assets.heroIdle;
      const pw = 152;
      const ph = 202;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.facing, 1);
      ctx.drawImage(himg, -pw / 2 + 8, -ph + 16, pw, ph);
      ctx.restore();

      if (p.shooting) {
        const m = muzzle(p);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const grd = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, 26);
        grd.addColorStop(0, "#fff");
        grd.addColorStop(0.3, "#ffd24a");
        grd.addColorStop(1, "rgba(227,6,19,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (const b of state.bullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx));
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = b.color;
      ctx.fillRect(-16, -2, 32, 4);
      ctx.fillStyle = "#fff";
      ctx.fillRect(-8, -1, 16, 2);
      ctx.restore();
    }

    for (const f of state.fx) {
      if (f.kind === "firework") {
        const i = Math.min(assets.firework.length - 1, Math.floor((f.t / f.life) * assets.firework.length));
        const img = assets.firework[i];
        const sc = 0.7 + f.t * 1.4;
        const w = 180 * sc;
        ctx.drawImage(img, f.x - w / 2, f.y - w / 2, w, w);
      } else if (f.kind === "impact") {
        ctx.save();
        ctx.globalAlpha = 1 - f.t / f.life;
        ctx.fillStyle = "#ff9a1f";
        ctx.beginPath();
        ctx.arc(f.x, f.y, 20 + f.t * 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (f.kind === "spark") {
        ctx.fillStyle = f.color || "#fff";
        ctx.globalAlpha = 1 - f.t / f.life;
        ctx.fillRect(f.x - 3, f.y - 3, 6, 6);
        ctx.globalAlpha = 1;
      }
    }

    if (state.say && p) bubble(state.say, p.x, p.y - 40);

    if (state.banner) {
      ctx.save();
      ctx.font = "900 42px Oswald, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffd24a";
      ctx.strokeStyle = "#0b1a4a";
      ctx.lineWidth = 8;
      ctx.strokeText(state.banner, VIEW_W / 2, 120);
      ctx.fillText(state.banner, VIEW_W / 2, 120);
      ctx.restore();
    }

    ctx.restore();
  }

  return { draw };
}
