/**
 * Canvas renderer — three-truck color assembly line
 */

import { CANVAS, PART_DEFS, TRUCK_BLUEPRINT, LINE, PAINTS } from "./config.js";
import {
  paintOf,
  drawChassis,
  drawPartLocal,
  drawSocketGhost,
  drawPartIcon,
} from "./shapes.js";

export function renderGame(ctx, game) {
  const { width, height } = CANVAS;

  ctx.fillStyle = "#0c1016";
  ctx.fillRect(0, 0, width, height);

  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // crane rail
  ctx.fillStyle = "#1a2030";
  ctx.fillRect(0, 36, width, 10);
  for (let x = 40; x < width; x += 70) {
    ctx.fillStyle = "#2a3344";
    ctx.fillRect(x, 28, 8, 26);
  }

  // floor
  const floorY = LINE.truckY + 72;
  ctx.fillStyle = "#141a22";
  ctx.fillRect(0, floorY, width, height - floorY);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, floorY, width, 12);
  ctx.clip();
  for (let x = -20; x < width; x += 28) {
    ctx.fillStyle = "#e8a317";
    ctx.fillRect(x, floorY, 14, 12);
    ctx.fillStyle = "#111";
    ctx.fillRect(x + 14, floorY, 14, 12);
  }
  ctx.restore();

  // HUD
  const prog = game.lineProgress();
  ctx.fillStyle = "#8b95a8";
  ctx.font = "12px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(
    `Level ${game.level}  ·  Misses ${game.misses}/${game.cfg.missLimit}  ·  Line ${prog.filled}/${prog.total} parts`,
    16,
    22
  );

  // paint legend for trucks on the line
  let lx = width - 16;
  for (let i = game.trucks.length - 1; i >= 0; i--) {
    const t = game.trucks[i];
    const p = paintOf(t.paintId);
    const label = p.name.toUpperCase();
    ctx.font = "bold 11px system-ui";
    const tw = ctx.measureText(label).width + 16;
    lx -= tw + 8;
    ctx.globalAlpha = t.driving ? 0.35 : 1;
    roundRect(ctx, lx, 8, tw, 20, 4);
    ctx.fillStyle = p.body;
    ctx.fill();
    ctx.fillStyle = p.label;
    ctx.textAlign = "center";
    ctx.fillText(label, lx + tw / 2, 22);
    ctx.globalAlpha = 1;
  }

  // bay separators
  const bayW = (width - LINE.paddingX * 2 - LINE.bayGap * 2) / 3;
  for (let i = 0; i < 2; i++) {
    const sx =
      LINE.paddingX + (i + 1) * bayW + i * LINE.bayGap + LINE.bayGap / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(sx, 56);
    ctx.lineTo(sx, floorY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // --- THREE TRUCKS ---
  for (const t of game.trucks) {
    drawTruckBay(ctx, game, t, width);
  }

  // Training guides only for part types still being taught this level
  const prev = game.previewSnap();
  if (
    game.current &&
    game.guidesForPart(game.current.type) &&
    prev &&
    (game.state === "playing" || game.state === "paused")
  ) {
    const ok = prev.inRange && prev.rotOk;
    ctx.strokeStyle = ok ? "rgba(0, 224, 176, 0.55)" : "rgba(255, 59, 74, 0.28)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(game.current.x, game.current.y);
    ctx.lineTo(prev.sock.x, prev.sock.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const s = prev.sock;
    ctx.strokeStyle = ok ? "#00e0b0" : "#ff3b4a";
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x - s.snapRX, s.y - s.snapRY, s.snapRX * 2, s.snapRY * 2);
    ctx.globalAlpha = 1;

    if (ok) {
      ctx.fillStyle = "rgba(0, 224, 176, 0.12)";
      ctx.fillRect(s.x - s.snapRX, s.y - s.snapRY, s.snapRX * 2, s.snapRY * 2);
    }
  }

  // falling part — clean silhouette only (color is on the part itself)
  if (game.current) {
    const c = game.current;
    ctx.strokeStyle = "#4a5568";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x, 46);
    ctx.lineTo(c.x, c.y - 28);
    ctx.stroke();
    ctx.fillStyle = "#8a93a3";
    ctx.fillRect(c.x - 8, c.y - 32, 16, 8);

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate((c.rot * Math.PI) / 180);
    drawPartLocal(ctx, c.type, c.paintId, 1);
    ctx.restore();
  }

  // particles / floaters
  for (const pt of game.particles) {
    const col = paintOf(pt.paintId);
    ctx.globalAlpha = Math.max(0, pt.life / 400);
    ctx.fillStyle = col.body;
    ctx.fillRect(pt.x, pt.y, 3, 3);
  }
  ctx.globalAlpha = 1;

  for (const f of game.floaters) {
    ctx.globalAlpha = Math.min(1, f.life / 400);
    ctx.fillStyle = f.color;
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  if (game.state === "levelup") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, height / 2 - 50, width, 100);
    ctx.fillStyle = "#00e0b0";
    ctx.font = "bold 28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${game.level} COMPLETE`, width / 2, height / 2);
    ctx.fillStyle = "#c5ccd6";
    ctx.font = "14px system-ui";
    ctx.fillText("Faster line · more sockets…", width / 2, height / 2 + 30);
  }

  // Same banner band as level-complete — simple 2s NEW PART flash on first drop
  if (game.announcement && game.state === "playing") {
    const a = game.announcement;
    const alpha = Math.min(1, a.life / 400); // soft fade on the way out
    ctx.globalAlpha = Math.max(0.35, alpha);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, height / 2 - 50, width, 100);
    ctx.fillStyle = "#f0b429";
    ctx.font = "bold 28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(a.text, width / 2, height / 2 + 8);
    ctx.globalAlpha = 1;
  }
}

function drawTruckBay(ctx, game, t, width) {
  // Drive forward (left) — cab faces left on the silhouette
  const driveX = t.driving ? -t.driving.t * (width + 180) : 0;

  // bay paint pad under truck
  const p = paintOf(t.paintId);
  const padW = 200;
  ctx.globalAlpha = t.driving ? 0.2 : 0.35;
  ctx.fillStyle = p.body;
  roundRect(ctx, t.x - padW / 2, t.y + 55, padW, 10, 4);
  ctx.fill();
  ctx.globalAlpha = 1;

  // paint name plaque
  if (!t.driving) {
    ctx.fillStyle = p.body;
    roundRect(ctx, t.x - 40, t.y + 72, 80, 18, 4);
    ctx.fill();
    ctx.fillStyle = p.label;
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(p.name.toUpperCase(), t.x, t.y + 84);
  }

  ctx.save();
  ctx.translate(t.x + driveX, t.y);
  if (t.driving) ctx.globalAlpha = 1 - t.driving.t * 0.45;

  drawChassis(ctx, t.paintId, t.scale);

  for (const s of TRUCK_BLUEPRINT.sockets) {
    if (!game.cfg.activeSockets.includes(s.id)) continue;

    ctx.save();
    ctx.translate(s.x * t.scale, s.y * t.scale);
    ctx.scale(t.scale, t.scale);

    if (t.filled[s.id]) {
      drawPartLocal(ctx, s.part, t.paintId, 1);
    } else if (!t.driving) {
      // Highlight ghosts that match the falling part
      let pulse = 0.45 + 0.45 * Math.sin(game.pulse + s.x * 0.05 + t.bayIndex);
      // Strong highlight only while this part type is still being taught
      if (
        game.guidesForPart(s.part) &&
        game.current &&
        game.current.paintId === t.paintId &&
        game.current.type === s.part
      ) {
        pulse = 0.85 + 0.15 * Math.sin(game.pulse * 3);
        ctx.strokeStyle = p.body;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      drawSocketGhost(ctx, s.part, t.paintId, pulse);
    }
    ctx.restore();

    if (!t.filled[s.id] && !t.driving) {
      ctx.fillStyle = p.body;
      ctx.globalAlpha = 0.7;
      ctx.font = "bold 9px system-ui";
      ctx.textAlign = "center";
      const labelY =
        s.y * t.scale +
        (s.part === "wheel" ? 32 : PART_DEFS[s.part].h * 0.5 * t.scale + 6);
      ctx.fillText(PART_DEFS[s.part].name.toUpperCase(), s.x * t.scale, labelY);
      ctx.globalAlpha = 1;
    }
  }

  if (t.landFlash > 0) {
    ctx.globalAlpha = (t.landFlash / 280) * 0.3;
    ctx.fillStyle = p.body;
    ctx.beginPath();
    ctx.arc(0, 0, 100 * t.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // progress pips
  if (!t.driving) {
    const n = game.cfg.activeSockets.length;
    const filled = game.cfg.activeSockets.filter((id) => t.filled[id]).length;
    const pipW = 8;
    const gap = 3;
    const totalW = n * pipW + (n - 1) * gap;
    let px = -totalW / 2;
    for (let i = 0; i < n; i++) {
      const id = game.cfg.activeSockets[i];
      ctx.fillStyle = t.filled[id] ? p.body : "rgba(0,0,0,0.45)";
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = 1;
      ctx.fillRect(px, 95, pipW, 6);
      ctx.strokeRect(px, 95, pipW, 6);
      px += pipW + gap;
    }
  }

  ctx.restore();
}

export function renderSide(nextCtx, game) {
  drawSidePanel(nextCtx, game.next);
}

function drawSidePanel(ctx, part) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0a0e14";
  ctx.fillRect(0, 0, w, h);
  if (!part) {
    ctx.fillStyle = "#3a4458";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("—", w / 2, h / 2);
    return;
  }
  const p = paintOf(part.paintId);
  ctx.fillStyle = p.body;
  ctx.fillRect(0, 0, w, 22);
  ctx.fillStyle = p.label;
  ctx.font = "bold 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(
    `${p.name.toUpperCase()} ${PART_DEFS[part.type].name.toUpperCase()}`,
    w / 2,
    15
  );
  drawPartIcon(ctx, part.type, part.paintId, w / 2, h / 2 + 10, 0.9);
}

export function syncHud(game, els) {
  els.score.textContent = String(game.score);
  els.level.textContent = String(game.level);
  els.built.textContent = String(game.trucksBuilt);
  els.goal.textContent = String(
    Math.max(0, game.cfg.trucksToClear - game.trucksThisLevel)
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
