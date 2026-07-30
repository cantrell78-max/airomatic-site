/**
 * Cybertruck Assembly Line — config
 * Three-truck color line: move + rotate parts onto the matching chassis.
 */

export const CANVAS = {
  width: 960,
  height: 700,
};

export const PAINTS = {
  stainless: {
    id: "stainless",
    name: "Silver",
    body: "#e8eef6",
    stroke: "#9aa8bc",
    glass: "rgba(140, 200, 255, 0.45)",
    dark: "#5a6578",
    glow: "rgba(200, 210, 230, 0.5)",
    label: "#0b0d10",
  },
  teal: {
    id: "teal",
    name: "Teal",
    body: "#00e0b0",
    stroke: "#009e7c",
    glass: "rgba(100, 220, 255, 0.4)",
    dark: "#006b54",
    glow: "rgba(0, 224, 176, 0.55)",
    label: "#042820",
  },
  red: {
    id: "red",
    name: "Red",
    body: "#ff3b4a",
    stroke: "#c41e2a",
    glass: "rgba(180, 220, 255, 0.35)",
    dark: "#8b1e28",
    glow: "rgba(255, 59, 74, 0.55)",
    label: "#fff",
  },
  violet: {
    id: "violet",
    name: "Violet",
    body: "#8b6cff",
    stroke: "#5a3fd4",
    glass: "rgba(180, 200, 255, 0.4)",
    dark: "#3a2580",
    glow: "rgba(139, 108, 255, 0.55)",
    label: "#fff",
  },
  desert: {
    id: "desert",
    name: "Sand",
    body: "#ffb347",
    stroke: "#d4892a",
    glass: "rgba(200, 220, 255, 0.35)",
    dark: "#8a5e32",
    glow: "rgba(255, 179, 71, 0.5)",
    label: "#1a1000",
  },
};

export const PAINT_ORDER = ["teal", "red", "stainless", "violet", "desert"];

export const PART_DEFS = {
  // snapPad: extra forgiveness on top of socket snap radii (wide parts need more X room)
  cab: { id: "cab", name: "Cab", w: 72, h: 48, okRots: [0], snapPadX: 12, snapPadY: 10 },
  // Structural battery pack (wide pack under the bed) — same shape as old "bed".
  battery: { id: "battery", name: "Battery", w: 88, h: 36, okRots: [0, 180], snapPadX: 28, snapPadY: 16 },
  canopy: { id: "canopy", name: "Canopy", w: 56, h: 28, okRots: [0, 180], snapPadX: 14, snapPadY: 12 },
  wheel: { id: "wheel", name: "Wheel", w: 36, h: 36, okRots: [0, 90, 180, 270], snapPadX: 8, snapPadY: 8 },
  bumper: { id: "bumper", name: "Bumper", w: 64, h: 20, okRots: [0, 180], snapPadX: 18, snapPadY: 12 },
};

/**
 * Truck blueprint — local coords, scaled at render.
 * Slightly tighter snap radii (multiplied by truck.scale in game).
 */
export const TRUCK_BLUEPRINT = {
  bodyW: 220,
  bodyH: 70,
  sockets: [
    // snapRX / snapRY: half-width / half-height of snap box (at scale 1)
    { id: "cab", part: "cab", x: -48, y: -8, rot: 0, snapRX: 48, snapRY: 36, rotTolerance: 25 },
    { id: "battery", part: "battery", x: 42, y: -2, rot: 0, snapRX: 62, snapRY: 40, rotTolerance: 25 },
    { id: "canopy", part: "canopy", x: -20, y: -36, rot: 0, snapRX: 44, snapRY: 34, rotTolerance: 30 },
    { id: "wheel_f", part: "wheel", x: -58, y: 38, rot: 0, snapRX: 36, snapRY: 36, rotTolerance: 45 },
    { id: "wheel_r", part: "wheel", x: 55, y: 38, rot: 0, snapRX: 36, snapRY: 36, rotTolerance: 45 },
    { id: "bumper", part: "bumper", x: -100, y: 12, rot: 0, snapRX: 48, snapRY: 32, rotTolerance: 25 },
  ],
};

export const LINE = {
  truckCount: 3,
  /** Base scale for each chassis so three fit on the line */
  truckScale: 0.92,
  paddingX: 28,
  bayGap: 16,
  truckY: 520,
};

/**
 * Which part types still get training guides (line + snap box).
 * Teach each new piece once, then graduate:
 *   L1 — cab, battery, wheels (base kit)
 *   L2 — canopy only (new this level)
 *   L3 — bumper only (new this level)
 *   L4+ — none
 */
export function guidedPartTypesForLevel(level) {
  const n = Math.max(1, level);
  if (n === 1) return ["cab", "battery", "wheel"];
  if (n === 2) return ["canopy"];
  if (n === 3) return ["bumper"];
  return [];
}

export function levelConfig(level) {
  const n = Math.max(1, level);
  const allIds = TRUCK_BLUEPRINT.sockets.map((s) => s.id);
  let activeSockets;
  if (n === 1) {
    activeSockets = ["cab", "battery", "wheel_f", "wheel_r"];
  } else if (n === 2) {
    activeSockets = ["cab", "battery", "canopy", "wheel_f", "wheel_r"];
  } else {
    // Level 3+ includes bumper
    activeSockets = allIds;
  }

  // Always at least 3 distinct paints for the three bays
  const paintCount = Math.min(3 + Math.floor((n - 1) / 2), PAINT_ORDER.length);
  const paintPool = PAINT_ORDER.slice(0, Math.max(3, paintCount));

  return {
    level: n,
    activeSockets,
    guidedParts: guidedPartTypesForLevel(n),
    fallSpeed: Math.min(240, 65 + n * 16),
    trucksToClear: 3 + n, // complete this many trucks to level
    paintPool,
    missLimit: 6 + n,
    truckCount: LINE.truckCount,
  };
}

/** Horizontal centers for each bay */
export function bayCenters(count = LINE.truckCount) {
  const { width } = CANVAS;
  const { paddingX, bayGap } = LINE;
  const usable = width - paddingX * 2;
  const bayW = (usable - bayGap * (count - 1)) / count;
  const centers = [];
  for (let i = 0; i < count; i++) {
    centers.push(paddingX + bayW * i + bayGap * i + bayW / 2);
  }
  return centers;
}
