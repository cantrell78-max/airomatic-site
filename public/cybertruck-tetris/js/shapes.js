/**
 * Vector shapes for chassis, parts, and ghosts.
 */

import { PART_DEFS, PAINTS } from "./config.js";

export function paintOf(id) {
  return PAINTS[id] || PAINTS.stainless;
}

/** Chassis frame only — always visible as the build base */
export function drawChassis(ctx, paint, scale = 1) {
  const p = paintOf(paint);
  ctx.save();
  ctx.scale(scale, scale);

  // undercarriage rail
  ctx.fillStyle = "#1a1e26";
  ctx.fillRect(-105, 18, 210, 10);

  // main body outline (angular cybertruck side profile — hollow)
  ctx.beginPath();
  ctx.moveTo(-100, 16);
  ctx.lineTo(-100, 0);
  ctx.lineTo(-55, -28);
  ctx.lineTo(20, -28);
  ctx.lineTo(95, -10);
  ctx.lineTo(100, 16);
  ctx.closePath();
  ctx.fillStyle = "rgba(20, 24, 32, 0.85)";
  ctx.strokeStyle = p.body;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  // paint accent stripe on chassis
  ctx.strokeStyle = p.body;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-90, 10);
  ctx.lineTo(90, 10);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // axle marks
  ctx.fillStyle = p.dark;
  ctx.beginPath();
  ctx.arc(-58, 38, 6, 0, Math.PI * 2);
  ctx.arc(55, 38, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Full truck when complete / driving */
export function drawAssembledTruck(ctx, paint, attachments, scale = 1) {
  const p = paintOf(paint);
  ctx.save();
  ctx.scale(scale, scale);

  // body filled
  ctx.beginPath();
  ctx.moveTo(-100, 16);
  ctx.lineTo(-100, 0);
  ctx.lineTo(-55, -28);
  ctx.lineTo(20, -28);
  ctx.lineTo(95, -10);
  ctx.lineTo(100, 16);
  ctx.closePath();
  ctx.fillStyle = p.body;
  ctx.strokeStyle = p.stroke;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = p.glow;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // glass
  ctx.beginPath();
  ctx.moveTo(-70, -2);
  ctx.lineTo(-48, -24);
  ctx.lineTo(-10, -24);
  ctx.lineTo(-18, -2);
  ctx.closePath();
  ctx.fillStyle = p.glass;
  ctx.fill();

  // draw attached parts on top if provided (for partial builds we draw parts separately)
  if (attachments) {
    for (const a of attachments) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate((a.rot * Math.PI) / 180);
      drawPartLocal(ctx, a.part, p, 1);
      ctx.restore();
    }
  } else {
    // default complete look
    drawPartLocal(ctx, "wheel", p, 1);
    // wheels positioned
  }

  ctx.restore();
}

/** Draw a part in local space (center origin), current transform includes rot */
export function drawPartLocal(ctx, partId, paint, alpha = 1) {
  const p = typeof paint === "string" ? paintOf(paint) : paint;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = p.glow;
  ctx.shadowBlur = 10;

  if (partId === "cab") {
    ctx.beginPath();
    ctx.moveTo(-36, 20);
    ctx.lineTo(-36, 0);
    ctx.lineTo(-12, -22);
    ctx.lineTo(28, -22);
    ctx.lineTo(36, 20);
    ctx.closePath();
    fillStroke(ctx, p);
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.lineTo(-6, -16);
    ctx.lineTo(12, -16);
    ctx.lineTo(6, 2);
    ctx.closePath();
    ctx.fillStyle = p.glass;
    ctx.fill();
  } else if (partId === "battery" || partId === "bed") {
    // Structural battery pack (long angular pack)
    ctx.beginPath();
    ctx.moveTo(-44, 14);
    ctx.lineTo(-44, -16);
    ctx.lineTo(44, -16);
    ctx.lineTo(44, 14);
    ctx.closePath();
    fillStroke(ctx, p);
    ctx.shadowBlur = 0;
    // cell division lines (three cells)
    ctx.strokeStyle = p.dark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, -16);
    ctx.lineTo(-14, 14);
    ctx.moveTo(14, -16);
    ctx.lineTo(14, 14);
    ctx.stroke();
    // lightning bolt in each cell
    ctx.fillStyle = p.dark;
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚡", -29, 0);
    ctx.fillText("⚡", 0, 0);
    ctx.fillText("⚡", 29, 0);
    ctx.textBaseline = "alphabetic";
  } else if (partId === "canopy") {
    ctx.beginPath();
    ctx.moveTo(-28, 10);
    ctx.lineTo(-20, -12);
    ctx.lineTo(20, -12);
    ctx.lineTo(28, 10);
    ctx.closePath();
    fillStroke(ctx, p);
    ctx.shadowBlur = 0;
    ctx.fillStyle = p.glass;
    ctx.fillRect(-16, -8, 32, 12);
  } else if (partId === "wheel") {
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#12141a";
    ctx.fill();
    ctx.strokeStyle = p.body;
    ctx.lineWidth = 4;
    ctx.stroke();
    // hub
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = p.body;
    ctx.fill();
    // spoke mark so rotation is visible
    ctx.strokeStyle = p.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -14);
    ctx.stroke();
  } else if (partId === "bumper") {
    ctx.beginPath();
    ctx.moveTo(-32, 6);
    ctx.lineTo(-28, -8);
    ctx.lineTo(28, -8);
    ctx.lineTo(32, 6);
    ctx.closePath();
    fillStroke(ctx, p);
  }

  ctx.restore();
}

function fillStroke(ctx, p) {
  ctx.fillStyle = p.body;
  ctx.strokeStyle = p.stroke;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();
}

/** Ghost outline of a socket waiting for a part */
export function drawSocketGhost(ctx, partId, paint, pulse = 0) {
  const p = paintOf(paint);
  ctx.save();
  const a = 0.25 + pulse * 0.2;
  ctx.globalAlpha = a;
  ctx.strokeStyle = p.body;
  ctx.fillStyle = p.body;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);

  const def = PART_DEFS[partId];
  if (partId === "wheel") {
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const w = def.w * 0.9;
    const h = def.h * 0.9;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
  }
  ctx.setLineDash([]);
  ctx.restore();
}

/** Small icon for next/hold panels */
export function drawPartIcon(ctx, partId, paint, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  drawPartLocal(ctx, partId, paint, 1);
  ctx.restore();
}
