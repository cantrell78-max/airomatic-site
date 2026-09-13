import { VIEW_W, VIEW_H, FLOOR_H, HEAVEN, ABILITIES } from "./config.js";
import { waterLine, babelize } from "./sim.js";

export function createRenderer(canvas, assets) {
  const ctx = canvas.getContext("2d");
  const off = document.createElement("canvas");
  off.width = VIEW_W;
  off.height = VIEW_H;
  const octx = off.getContext("2d");

  function worldToScreen(state, x, y) {
    const sh = state.shake * 7;
    const sx = x + (Math.random() * 2 - 1) * sh + state.sway * (y * 0.12);
    const sy = VIEW_H - (y - state.camY);
    return { sx, sy };
  }

  function drawBg(c, state) {
    const cam = state.camY;
    const skyA = Math.min(1, 0.35 + cam / 900);
    c.drawImage(assets.sky, 0, 0, VIEW_W, VIEW_H);
    c.globalAlpha = Math.min(1, cam / 280);
    c.drawImage(assets.stars, 0, 0, VIEW_W, VIEW_H);
    c.globalAlpha = 1;
    const valleyY = VIEW_H - 200 + cam * 0.22;
    c.drawImage(assets.valley, 0, valleyY, VIEW_W, 220);
    c.fillStyle = `rgba(12, 4, 28, ${skyA * 0.25})`;
    c.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  function drawGodhead(c, state) {
    const h = state.floors.length;
    const a = Math.max(0, Math.min(1, (h - 8) / (HEAVEN - 6)));
    if (a <= 0.02 && state.mode !== "god" && state.mode !== "win") return;
    const pulse = 0.85 + Math.sin(state.t * 2.2) * 0.15;
    const size = 140 + a * 120 + (state.mode === "god" ? 40 : 0);
    c.save();
    c.globalAlpha = Math.min(0.95, a * pulse + (state.mode === "god" ? 0.25 : 0));
    c.drawImage(assets.godhead, VIEW_W * 0.5 - size / 2, 12 - a * 20, size, size);
    c.restore();
  }

  function floorImg(art) {
    return assets.floors[art] || assets.floors.a;
  }

  function drawFloorSprite(c, state, x, y, w, art, opts = {}) {
    const { sx, sy } = worldToScreen(state, x, y);
    const h = FLOOR_H + 14;
    const img = floorImg(art);
    c.save();
    if (opts.alpha != null) c.globalAlpha = opts.alpha;
    if (opts.rot) {
      c.translate(sx + w / 2, sy - h / 2);
      c.rotate(opts.rot);
      c.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      c.drawImage(img, sx - 6, sy - h, w + 12, h);
    }
    c.restore();
    return { sx, sy, h };
  }

  function drawFloors(c, state, rng) {
    for (const f of state.floors) {
      const y = f.visY ?? f.y;
      drawFloorSprite(c, state, f.x, y, f.w, f.art);
      const { sx, sy } = worldToScreen(state, f.x, y);
      if (f.burning > 0) {
        c.save();
        c.globalAlpha = Math.min(1, 0.45 + f.burning * 0.25);
        c.drawImage(assets.fire, sx + f.w * 0.15, sy - FLOOR_H - 28, f.w * 0.7, 40);
        c.restore();
      }
      if (f.glitched > 0.15) {
        c.save();
        c.globalAlpha = f.glitched * 0.45;
        c.fillStyle = "#ff2bd6";
        c.fillRect(sx + Math.sin(state.t * 40) * 6, sy - FLOOR_H, 8, FLOOR_H);
        c.fillStyle = "#3ef0ff";
        c.fillRect(sx + f.w - 10, sy - FLOOR_H, 6, FLOOR_H);
        c.restore();
      }
      const hp = Math.max(0, f.hp / f.maxHp);
      c.fillStyle = "rgba(0,0,0,0.45)";
      c.fillRect(sx + 8, sy - 7, f.w - 16, 4);
      c.fillStyle = hp > 0.45 ? "#5dff9a" : hp > 0.2 ? "#ffd24a" : "#ff3b6b";
      c.fillRect(sx + 8, sy - 7, (f.w - 16) * hp, 4);
      if (f.w > 70) {
        c.font = "700 10px 'IBM Plex Mono', monospace";
        c.fillStyle = "#fff8e8";
        c.textAlign = "center";
        const label = babelize(f.company.name.toUpperCase(), state.confusion, rng);
        c.fillText(label, sx + f.w / 2, sy - FLOOR_H + 14);
        c.font = "600 8px 'IBM Plex Mono', monospace";
        c.fillStyle = "#ffd24a";
        c.fillText(ABILITIES[f.company.ability]?.name || "", sx + f.w / 2, sy - FLOOR_H + 24);
      }
    }
  }

  function drawSlider(c, state, rng) {
    const s = state.slider;
    if (!s || !s.ready) return;
    c.save();
    c.globalAlpha = 0.95;
    const { sx, sy } = worldToScreen(state, s.x, (state.floors.length || 0) * FLOOR_H);
    c.shadowColor = "#ffd24a";
    c.shadowBlur = 18;
    drawFloorSprite(c, state, s.x, (state.floors.length || 0) * FLOOR_H, s.w, s.art, { alpha: 0.92 });
    c.shadowBlur = 0;
    c.font = "700 11px 'IBM Plex Mono', monospace";
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.fillText(babelize(s.company.name.toUpperCase(), state.confusion, rng), sx + s.w / 2, sy - FLOOR_H - 8);
    c.restore();
  }

  function drawBase(c, state) {
    const { sx, sy } = worldToScreen(state, VIEW_W * 0.5 - 190, 0);
    c.drawImage(assets.base, sx, sy - 78, 380, 110);
  }

  function drawFlood(c, state) {
    const h = waterLine(state);
    if (h <= 1) return;
    const { sy } = worldToScreen(state, 0, h);
    const top = sy;
    const bot = VIEW_H + 20;
    if (top > VIEW_H) return;
    c.save();
    c.fillStyle = "rgba(18, 150, 168, 0.55)";
    c.fillRect(0, top, VIEW_W, bot - top);
    const img = assets.water;
    const scroll = (state.t * 48) % img.width;
    c.globalAlpha = 0.85;
    for (let x = -scroll; x < VIEW_W; x += img.width) {
      c.drawImage(img, x, top - 22, img.width, 92);
    }
    c.restore();
  }

  function drawHazards(c, state) {
    for (const comet of state.comets) {
      const { sx, sy } = worldToScreen(state, comet.x, comet.y);
      c.save();
      c.translate(sx, sy);
      const ang = Math.atan2(-comet.vy, comet.vx) - Math.PI / 2;
      c.rotate(ang);
      c.drawImage(assets.comet, -22, -50, 44, 90);
      c.restore();
    }
    for (const b of state.bolts) {
      const { sx, sy } = worldToScreen(state, b.x, b.y);
      c.save();
      c.globalAlpha = Math.max(0, b.life * 2);
      c.drawImage(assets.lightning, sx - 40, sy - 160, 80, 220);
      c.restore();
    }
    for (const v of state.vortices) {
      const { sx, sy } = worldToScreen(state, v.x, v.y);
      c.save();
      c.translate(sx, sy);
      c.rotate(state.t * 3);
      c.globalAlpha = Math.max(0, v.life);
      const sz = v.r * 2.4;
      c.drawImage(assets.babel, -sz / 2, -sz / 2, sz, sz);
      c.restore();
    }
    for (const p of state.falling) {
      drawFloorSprite(c, state, p.x, p.y, p.w, p.art, { rot: p.rot, alpha: Math.max(0, p.life) });
    }
  }

  function drawAnnounce(c, state, rng) {
    let y = 86;
    for (const a of state.announce) {
      const life = Math.max(0, Math.min(1, a.t));
      if (life <= 0) continue;
      c.save();
      c.globalAlpha = life;
      c.font = "800 18px Orbitron, sans-serif";
      c.textAlign = "center";
      c.fillStyle = a.kind === "perfect" || a.kind === "god" ? "#ffd24a" : a.kind === "miss" ? "#ff6b8a" : "#f4e8ff";
      c.strokeStyle = "rgba(12,4,28,0.85)";
      c.lineWidth = 5;
      const text = babelize(a.text, state.confusion * 0.7, rng);
      c.strokeText(text, VIEW_W / 2, y);
      c.fillText(text, VIEW_W / 2, y);
      c.restore();
      y += 22;
    }
  }

  function drawScene(c, state, rng, particles) {
    drawBg(c, state);
    drawGodhead(c, state);
    drawBase(c, state);
    drawFloors(c, state, rng);
    drawSlider(c, state, rng);
    drawHazards(c, state);
    drawFlood(c, state);
    for (const p of particles) {
      c.save();
      c.globalAlpha = Math.max(0, p.life);
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    drawAnnounce(c, state, rng);
  }

  function render(state, rng, particles) {
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.clearRect(0, 0, VIEW_W, VIEW_H);
    drawScene(octx, state, rng, particles);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const conf = state.confusion;
    if (conf > 0.2) {
      const ox = (conf * 5) | 0;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(off, 0, 0);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = conf * 0.45;
      ctx.drawImage(off, ox, 0);
      ctx.drawImage(off, -ox, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.drawImage(off, 0, 0);
    }
  }

  return { render };
}
