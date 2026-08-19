/** Rat Race — tuning, map, and flavor. */

export const CELL = 1.12;

export const CFG = {
  cell: CELL,
  totalPellets: 56,
  eatTime: 0.36,
  playerSpeed: 6.55,
  playerSpeedFat: 2.05,
  rivalSpeed: 6.15,
  rivalSpeedFat: 2.0,
  catSpeed: 3.85,
  catChase: 4.95,
  dashSpeed: 12.2,
  dashTime: 0.17,
  dashCd: 1.12,
  fatPellets: 15,
  catchLoss: 0.42,
  stunTime: 1.25,
  invulnTime: 1.55,
  feedRadius: 2.05,
  catSight: 9.2,
  catSightDot: 0.38,
  catNear: 2.55,
  hideDist: 1.42,
  dropTakeR: 1.15,
  skinnyR: 0.30,
  fatR: 0.56,
  catR: 0.52,
  catchExtra: 0.12,
};

/** 28 x 16. First row is north (−Z). # wall  . floor  X kiosk  S spawn
 *  D dumpster  T tvs  F fridge  B box  O barrel  L lamp */
export const MAP = [
  "############################",
  "#L........................L#",
  "#..DD..##....XXXX....##.TT.#",
  "#..DD..#.....XXXX.....#.TT.#",
  "#......#..BB......FF..#....#",
  "#..##.....BB..O...FF....##.#",
  "#..#.......................#",
  "#..#..TT..##......##..DD...#",
  "#.....TT..#...O...#...DD...#",
  "#..FF.....#.......#.....BB.#",
  "#..FF..##....O...##.....BB.#",
  "#..........######..........#",
  "#..OO..##..........##..TT..#",
  "#......#...SSSS....#...TT..#",
  "#L.....#...........#......L#",
  "############################",
];

export const PROP_META = {
  D: { type: "dumpster", sprite: "dumpster", label: "FLEETFIX", hide: true, h: 1.15 },
  T: { type: "tvs", sprite: "tvs", label: "FRYSK", hide: true, h: 1.35 },
  F: { type: "fridge", sprite: "fridge", label: "DRAFX", hide: true, h: 1.55 },
  B: { type: "box", sprite: "box", label: "PIVOT", hide: true, h: 0.85 },
  O: { type: "barrel", sprite: "barrel", label: "COLDSTART", hide: true, h: 1.05 },
  L: { type: "lamp", sprite: "lamp", label: "", hide: false, h: 2.4 },
};

export const RATS = [
  {
    id: "you",
    name: "YOU",
    handle: "@you",
    sprite: "rat",
    fatSprite: "rat-fat",
    color: "#ff2bd6",
    human: true,
    personality: "human",
  },
  {
    id: "vex",
    name: "VEX",
    handle: "@vex",
    sprite: "rat-vex",
    color: "#39e7ff",
    human: false,
    personality: "cautious",
  },
  {
    id: "noodle",
    name: "NOODLE",
    handle: "@noodle",
    sprite: "rat-noodle",
    color: "#ffb020",
    human: false,
    personality: "greedy",
  },
  {
    id: "pivot",
    name: "PIVOT",
    handle: "@pivot",
    sprite: "rat-pivot",
    color: "#7cff3a",
    human: false,
    personality: "loot",
  },
];

export const NEON_SIGNS = [
  { text: "鼠", color: "#ff2bd6", x: -13.2, y: 2.15, z: -4.2, rotY: Math.PI / 2 },
  { text: "内卷", color: "#39e7ff", x: 13.2, y: 2.25, z: 1.4, rotY: -Math.PI / 2 },
  { text: "关注", color: "#ff2bd6", x: -6.4, y: 2.4, z: -8.35, rotY: 0 },
  { text: "投喂", color: "#ffb020", x: 6.6, y: 2.35, z: -8.35, rotY: 0 },
  { text: "赛跑", color: "#39e7ff", x: 0, y: 2.55, z: 8.35, rotY: Math.PI },
  { text: "老鼠", color: "#ff2bd6", x: -13.2, y: 2.2, z: 5.2, rotY: Math.PI / 2 },
];

export const CAT_NAME = "SGT. MEOWZ";
