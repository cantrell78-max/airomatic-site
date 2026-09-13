export const VIEW_W = 960;
export const VIEW_H = 540;

export const CENTER_X = VIEW_W * 0.5;
export const PAD = 36;
export const BASE_W = 340;
export const BASE_X = (VIEW_W - BASE_W) / 2;
export const START_W = 268;
export const FLOOR_H = 38;
export const MIN_OVERLAP = 30;
export const MIN_W = 42;
export const PERFECT_EPS = 8;
export const HEAVEN = 24;
export const MISS_PUNISH = 3;

export const COLORS = {
  ink: "#f4e8ff",
  gold: "#ffd24a",
  violet: "#1a0830",
  magenta: "#ff2bd6",
  cyan: "#3ef0ff",
};

export const ART_BY_ABILITY = {
  ARK: "a",
  VOICE: "a",
  GROUND: "b",
  BIND: "b",
  DEFENSE: "b",
  FUND: "c",
  GLOW: "c",
  BRACE: "d",
  REPAIR: "d",
  CHAOS: "d",
};

export const ABILITIES = {
  ARK: { id: "ARK", name: "ARK", blurb: "holds back the flood" },
  GROUND: { id: "GROUND", name: "GROUND", blurb: "eats the lightning" },
  DEFENSE: { id: "DEFENSE", name: "DEFENSE", blurb: "swats fiery comets" },
  BRACE: { id: "BRACE", name: "BRACE", blurb: "extra integrity" },
  FUND: { id: "FUND", name: "FUND", blurb: "heals the stack" },
  REPAIR: { id: "REPAIR", name: "REPAIR", blurb: "restores width" },
  CHAOS: { id: "CHAOS", name: "CHAOS", blurb: "quantum dice" },
  VOICE: { id: "VOICE", name: "VOICE", blurb: "talks the wrath down" },
  BIND: { id: "BIND", name: "BIND", blurb: "holds the languages" },
  GLOW: { id: "GLOW", name: "GLOW", blurb: "closer to God" },
};

export const PLACE_LINES = [
  "SERIES A CLOSED.",
  "AGENTS IN PRODUCTION.",
  "THE STACK IS THE PRODUCT.",
  "WE ARE SO BACK.",
  "NON-HUMAN EMPLOYEE ONLINE.",
  "COMPUTE ALLOCATED.",
  "ANOTHER FLOOR TO HEAVEN.",
  "THE ROUND IS OVERSUBSCRIBED.",
  "SHIPPED TO THE FLEET.",
  "ALIGNMENT PENDING.",
];

export const WRATH_COPY = {
  comet: "FIRE ON THE CAMPUS",
  lightning: "A BOLT FROM THE BOARD",
  flood: "THE WATERS RISE",
  babel: "THE LANGUAGES BREAK",
  quake: "THE HILLS SHAKE",
};

export const ASSET_PATHS = {
  title: "assets/ui/title.jpg",
  valley: "assets/bg/valley.jpg",
  sky: "assets/bg/sky.jpg",
  stars: "assets/bg/stars.jpg",
  water: "assets/fx/water.jpg",
  floorA: "assets/sprites/floor-a.png",
  floorB: "assets/sprites/floor-b.png",
  floorC: "assets/sprites/floor-c.png",
  floorD: "assets/sprites/floor-d.png",
  base: "assets/props/base.png",
  comet: "assets/sprites/comet.png",
  lightning: "assets/sprites/lightning.png",
  fire: "assets/sprites/fire.png",
  godhead: "assets/sprites/godhead.png",
  babel: "assets/sprites/babel.png",
  btn: "assets/ui/btn.png",
  btnHover: "assets/ui/btn-hover.png",
  btnPressed: "assets/ui/btn-pressed.png",
  panel: "assets/ui/panel.png",
};

export function difficulty(n) {
  const t = Math.max(0, n);
  return {
    sliderSpeed: 210 + t * 16,
    wrathEvery: Math.max(1.25, 4.6 - t * 0.14),
    cometVy: 170 + t * 11,
    floodMax: FLOOR_H * (0.55 + t * 0.16),
    dmg: 20 + t * 1.35,
    burn: 12 + t * 0.4,
  };
}

export function baseRect() {
  return { x: BASE_X, w: BASE_W, y: -FLOOR_H };
}
