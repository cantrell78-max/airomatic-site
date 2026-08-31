import { VIEW_W, VIEW_H, WORLD_W, GROUND_Y, CEILING_Y, TRIP_ZONE } from "./config.js";
import { feetY } from "./player.js";
import { wrap, wrapDelta, inTrip } from "./world.js";
import { drawRain, drawBits } from "./particles.js";

export function createRenderer(canvas, assets) {
  const ctx = canvas.getContext("2d");
  let cobblePat = null;
  let brickPat = null;
  let wetPat = null;

  function patterns() {
    if (!cobblePat) {
      cobblePat = ctx.createPattern(assets.cobble, "repeat");
      brickPat = ctx.createPattern(assets.brick, "repeat");
      wetPat = ctx.createPattern(assets.wet, "repeat");
    }
  }

  function toScreen(wx, camX) {
    let s = wrapDelta(wx, camX);
    return s;
  }

  function drawSpr(img, sx, y, dw, dh, face = 1, squash = 1, flipY = false) {
    if (!img) return;
    const sq = Math.abs(squash) || 1;
    ctx.save();
    ctx.translate(sx, y);
    ctx.scale(face < 0 ? -1 : 1, 1);
    const top = flipY ? 0 : -dh * sq;
    ctx.drawImage(img, -dw / 2, top, dw, dh * sq);
    ctx.restore();
  }

  function fairyFrame(p, assets) {
    if (p.anim === "walk") return assets.fairy.walk[(p.walkT | 0) % assets.fairy.walk.length];
    if (p.anim === "jump") return assets.fairy.jump;
    if (p.anim === "stomp") return assets.fairy.stomp;
    if (p.anim === "dance") return assets.fairy.dance;
    return assets.fairy.idle;
  }

  function draw(state) {
    patterns();
    const { player, ents, level, cam, fx, trip, banner, score } = state;
    const camX = cam.x;
    const dpr = canvas.width / VIEW_W;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);

    const stretch = trip.stretch > 0 ? 1.38 + Math.sin(state.time * 3) * 0.06 : 1;
    const shx = (Math.random() - 0.5) * fx.shake;
    const shy = (Math.random() - 0.5) * fx.shake * 0.6;

    ctx.save();
    ctx.translate(shx, VIEW_H / 2 + shy);
    ctx.scale(1, stretch);
    ctx.translate(0, -VIEW_H / 2);

    const tripAmt = inTrip(player.x) ? 1 : 0.15 * (trip.stretch > 0 || trip.grav > 0 || trip.clone > 0 ? 1 : 0);

    // sky
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, tripAmt > 0.5 ? "#140018" : "#1a0c08");
    g.addColorStop(0.55, tripAmt > 0.5 ? "#2a0838" : "#3a1a12");
    g.addColorStop(1, "#0a0608");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // far street painting
    const bg = assets.street;
    const bw = bg.width;
    const bh = (VIEW_H * 0.72) | 0;
    const parallax = wrap(camX * 0.22, bw);
    ctx.globalAlpha = 0.55;
    ctx.drawImage(bg, -parallax, 0, bw, bh);
    ctx.drawImage(bg, -parallax + bw, 0, bw, bh);
    ctx.globalAlpha = 1;

    // brick wall
    ctx.save();
    const brickOff = wrap(camX * 0.55, 256);
    ctx.translate(-brickOff, 70);
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = brickPat;
    ctx.fillRect(0, 0, VIEW_W + 512, GROUND_Y - 70);
    ctx.restore();

    if (tripAmt > 0.4) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      const tw = assets.tripWall;
      const toff = wrap(camX * 0.4, tw.width);
      ctx.drawImage(tw, -toff, 40, tw.width, GROUND_Y - 20);
      ctx.drawImage(tw, -toff + tw.width, 40, tw.width, GROUND_Y - 20);
      ctx.restore();
    }

    // sodium wash
    const wash = ctx.createRadialGradient(VIEW_W * 0.5, 40, 10, VIEW_W * 0.5, 180, 520);
    wash.addColorStop(0, tripAmt > 0.5 ? "rgba(160,40,200,0.16)" : "rgba(255,140,30,0.14)");
    wash.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const drawProp = (p) => {
      const sx = toScreen(p.x, camX);
      if (sx < -280 || sx > VIEW_W + 280) return;
      if (p.type === "lamp") {
        const h = 210;
        drawSpr(assets.lamp, sx, GROUND_Y + 6, 78, h, 1, 1);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const lg = ctx.createRadialGradient(sx, GROUND_Y - 170, 4, sx, GROUND_Y - 150, 90);
        lg.addColorStop(0, "rgba(255,170,50,0.45)");
        lg.addColorStop(1, "rgba(255,120,20,0)");
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(sx, GROUND_Y - 160, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === "fence") {
        drawSpr(assets.fence, sx, GROUND_Y + 4, 220, 110, 1, 1);
      } else if (p.type === "window") {
        drawSpr(assets.window, sx, p.y + 140, 92, 140, 1, 1);
      } else if (p.type === "mushroom") {
        drawSpr(assets.mushroom, sx, GROUND_Y + 4, 96, 110, 1, 1);
      }
    };

    for (const p of level.props) {
      if (p.type === "window" && p.trip) continue;
      if (p.type === "mushroom") continue;
      if (p.type === "dwarfMid") continue;
      drawProp(p);
    }

    // ledges
    ctx.fillStyle = wetPat;
    for (const pl of level.platforms) {
      if (pl.kind === "ground" || pl.kind === "ceiling" || pl.kind === "shroom") continue;
      const sx = toScreen(pl.x, camX);
      if (sx > VIEW_W + 40 || sx + pl.w < -40) continue;
      ctx.fillRect(sx, pl.y, pl.w, pl.h);
      ctx.strokeStyle = "rgba(224,180,58,0.35)";
      ctx.strokeRect(sx, pl.y, pl.w, pl.h);
    }

    for (const p of level.props) {
      if (p.type === "mushroom" || (p.type === "window" && p.trip)) drawProp(p);
    }

    // mid dwarf
    const dwarf = ents.find((e) => e.type === "dwarf");
    if (dwarf && !dwarf.active) {
      const sx = toScreen(4000, camX);
      if (sx > -80 && sx < VIEW_W + 80) {
        const frame = (state.time * 4) & 1 ? assets.dwarf : assets.dwarfB;
        ctx.globalAlpha = 0.72;
        drawSpr(frame, sx, GROUND_Y - 30 + Math.sin(state.time * 3) * 8, 70, 70, 1, 1);
        ctx.globalAlpha = 1;
      }
    }

    // ground cobbles
    ctx.save();
    const coff = wrap(camX, 256);
    ctx.translate(-coff, GROUND_Y);
    ctx.fillStyle = cobblePat;
    ctx.fillRect(0, 0, VIEW_W + 512, VIEW_H - GROUND_Y + 80);
    ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, GROUND_Y + 48, VIEW_W, 80);

    // entities
    for (const e of ents) {
      const sx = toScreen(e.x, camX);
      if (sx < -120 || sx > VIEW_W + 120) continue;
      if (e.type === "punk" && e.flatten > 0.05) {
        ctx.globalAlpha = e.dead ? 0.7 : 1;
        drawSpr(assets.punk, sx, e.y, 78, 118 * e.flatten, e.facing, 1);
        ctx.globalAlpha = 1;
      } else if (e.type === "bottle" && !e.dead) {
        ctx.save();
        ctx.translate(sx, e.y);
        ctx.rotate(Math.sin(e.t * 2) * 0.2);
        ctx.drawImage(assets.bottle, -22, -58, 44, 72);
        ctx.restore();
      } else if (e.type === "orb" && !e.taken) {
        ctx.save();
        ctx.translate(sx, e.y - 14);
        ctx.rotate(e.t * 2);
        const pulse = 26 + Math.sin(e.t * 6) * 3;
        ctx.drawImage(assets.orb, -pulse / 2, -pulse / 2, pulse, pulse);
        ctx.restore();
        ctx.fillStyle = e.kind === "grav" ? "#7cff9a" : e.kind === "stretch" ? "#c45cff" : "#ffd24a";
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(sx, e.y - 14, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (e.type === "bigFairy" && (e.active || e.done)) {
        drawSpr(assets.bigFairy, sx, e.y - (e.hop || 0), 120, 156, e.facing, 1);
      } else if (e.type === "dwarf" && e.active) {
        const frame = (e.t * 8) & 1 ? assets.dwarf : assets.dwarfB;
        drawSpr(frame, sx, e.y - (e.hop || 0), 96, 96, e.vx >= 0 ? 1 : -1, 1);
      }
    }

    // clones
    if (player.clones > 0) {
      for (let i = 1; i <= player.clones; i++) {
        const tr = player.trail[player.trail.length - 1 - i * 8];
        if (!tr) continue;
        const sx = toScreen(tr.x, camX);
        ctx.globalAlpha = 0.45 - i * 0.1;
        const fake = { ...player, x: tr.x, y: tr.y, facing: tr.facing, anim: tr.anim, walkT: tr.walkT };
        drawSpr(fairyFrame(fake, assets), sx, tr.y, 86, 112, tr.facing, 1);
      }
      ctx.globalAlpha = 1;
    }

    if (player.hurtFlash > 0 && (state.time * 20) & 1) ctx.globalAlpha = 0.35;
    if (trip.grav > 0) {
      ctx.save();
      const cOff = wrap(camX, 256);
      ctx.translate(-cOff, 0);
      ctx.fillStyle = cobblePat;
      ctx.fillRect(0, 0, VIEW_W + 512, CEILING_Y);
      ctx.restore();
    }

    const hover =
      player.grounded && player.anim === "idle" && player.gravSign > 0
        ? Math.sin(state.time * 7) * 3
        : 0;
    drawSpr(
      fairyFrame(player, assets),
      toScreen(player.x, camX),
      feetY(player) - hover,
      86,
      112,
      player.facing,
      player.squash,
      player.gravSign < 0
    );
    ctx.globalAlpha = 1;

    if (player.landedStomp || player.kickT > 0.12 && player.grounded) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(255,200,80,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(toScreen(player.x, camX), player.y, 40 + (0.18 - player.kickT) * 80, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    drawBits(ctx, fx, (wx) => toScreen(wx, camX));
    drawRain(ctx, fx, tripAmt > 0.4);

    // film grain
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(Math.random() * VIEW_W, Math.random() * VIEW_H, 2, 2);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    if (banner) {
      ctx.fillStyle = "rgba(10,6,8,0.55)";
      ctx.fillRect(0, 200, VIEW_W, 70);
      ctx.fillStyle = "#e0b43a";
      ctx.font = "700 28px 'New Rocker', serif";
      ctx.textAlign = "center";
      ctx.fillText(banner, VIEW_W / 2, 244);
    }

    if (player.danceLeft > 0) {
      ctx.fillStyle = "#f0d060";
      ctx.font = "700 22px Oswald, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BOOT COMBO", VIEW_W / 2, 90);
    }

    void score;
    void TRIP_ZONE;
    void WORLD_W;
  }

  return { draw, toScreen };
}
