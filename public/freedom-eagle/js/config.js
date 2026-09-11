export const VIEW_W = 960;
export const VIEW_H = 540;

export const ROOF_Y = 248;
export const GRAVITY = 2200;
export const JUMP_V = -720;
export const JUMP_CUT = 0.45;
export const MAX_VX = 340;
export const ACCEL = 2400;
export const AIR_ACCEL = 1600;
export const FRICTION = 0.78;
export const AIR_DRAG = 0.985;
export const COYOTE = 0.1;
export const JUMP_BUF = 0.12;

export const PLAYER_W = 36;
export const PLAYER_H = 58;
export const FIRE_RATE = 0.07;
export const BULLET_SPEED = 980;
export const BULLET_LIFE = 0.9;

export const TOWER_MAX = 100;
export const TOWER_HIT = 22;

export const PLATFORMS = [{ x: 48, w: 864, y: ROOF_Y }];

export const TOWERS = [
  { id: "north", x: 70, y: 8, w: 360, h: 520, roofY: ROOF_Y, hitX: 90, hitW: 300, hitY: 258, hitH: 282 },
  { id: "south", x: 530, y: 38, w: 360, h: 500, roofY: ROOF_Y, hitX: 560, hitW: 300, hitY: 258, hitH: 282 },
];

export const LINES = [
  "FUCK YEAH!",
  "NICE TRY TERRORIST SCUM!",
  "USA! USA!",
  "EAT LASER!",
  "HOO-AH!",
  "GOD BLESS THIS GUN!",
  "NOT TODAY!",
  "GET SOME!",
  "FREEDOM!",
  "THAT'S FOR AMERICA!",
];

export const COLORS = {
  red: "#e30613",
  white: "#f4f7ff",
  blue: "#0033a0",
  gold: "#ffd24a",
  navy: "#0b1a4a",
};

export const ASSET_PATHS = {
  heroIdle: "assets/sprites/hero/idle.png",
  heroShoot: [
    "assets/sprites/hero/shoot-01.png",
    "assets/sprites/hero/shoot-02.png",
    "assets/sprites/hero/shoot-03.png",
    "assets/sprites/hero/shoot-04.png",
    "assets/sprites/hero/shoot-05.png",
    "assets/sprites/hero/shoot-06.png",
    "assets/sprites/hero/shoot-07.png",
    "assets/sprites/hero/shoot-08.png",
  ],
  plane: "assets/sprites/plane.png",
  eagle: [
    "assets/sprites/eagle/01.png",
    "assets/sprites/eagle/02.png",
    "assets/sprites/eagle/03.png",
    "assets/sprites/eagle/04.png",
    "assets/sprites/eagle/05.png",
    "assets/sprites/eagle/06.png",
    "assets/sprites/eagle/07.png",
    "assets/sprites/eagle/08.png",
  ],
  flag: [
    "assets/sprites/flag/01.png",
    "assets/sprites/flag/02.png",
    "assets/sprites/flag/03.png",
    "assets/sprites/flag/04.png",
    "assets/sprites/flag/05.png",
    "assets/sprites/flag/06.png",
    "assets/sprites/flag/07.png",
    "assets/sprites/flag/08.png",
  ],
  firework: [
    "assets/sprites/fx/01.png",
    "assets/sprites/fx/02.png",
    "assets/sprites/fx/03.png",
    "assets/sprites/fx/04.png",
    "assets/sprites/fx/05.png",
    "assets/sprites/fx/06.png",
    "assets/sprites/fx/07.png",
    "assets/sprites/fx/08.png",
  ],
  liberty: "assets/props/liberty.png",
  towerNorth: "assets/props/tower-north.png",
  towerSouth: "assets/props/tower-south.png",
  towerNorthDmg: "assets/props/tower-north-dmg.png",
  towerSouthDmg: "assets/props/tower-south-dmg.png",
  sky: "assets/bg/sky.jpg",
  manhattan: "assets/bg/manhattan.jpg",
};
