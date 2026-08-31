export const VIEW_W = 960;
export const VIEW_H = 540;
export const WORLD_W = 7200;
export const GROUND_Y = 458;
export const CEILING_Y = 86;
export const TILE = 64;

export const GRAVITY = 2100;
export const JUMP_V = -740;
export const JUMP_CUT = 0.42;
export const MAX_VX = 290;
export const ACCEL = 1950;
export const AIR_ACCEL = 1300;
export const FRICTION = 0.78;
export const AIR_DRAG = 0.985;
export const COYOTE = 0.1;
export const JUMP_BUF = 0.12;
export const STOMP_VY = 980;
export const KICK_TIME = 0.22;
export const KICK_RANGE = 78;
export const DANCE_HITS = 3;
export const DANCE_FLOAT_G = 380;
export const INVULN = 1.15;
export const LIVES = 3;

export const TRIP_ZONE = [3100, 5300];
export const DANCE_ARENA = [3720, 4480];

export const ORB_TIME = {
  grav: 5.2,
  stretch: 5.5,
  clone: 6.4,
};

export const COLORS = {
  black: "#0a0608",
  purple: "#3a1a4a",
  gold: "#e0b43a",
  amber: "#ff9a1f",
  bruise: "#6b2d7a",
  rain: "#c8d4e8",
};

export const ASSET_PATHS = {
  fairy: {
    idle: "assets/sprites/fairy/idle.png",
    jump: "assets/sprites/fairy/jump.png",
    stomp: "assets/sprites/fairy/stomp.png",
    dance: "assets/sprites/fairy/dance.png",
    walk: [
      "assets/sprites/fairy/walk-001.png",
      "assets/sprites/fairy/walk-002.png",
      "assets/sprites/fairy/walk-003.png",
      "assets/sprites/fairy/walk-004.png",
      "assets/sprites/fairy/walk-005.png",
      "assets/sprites/fairy/walk-006.png",
      "assets/sprites/fairy/walk-007.png",
      "assets/sprites/fairy/walk-008.png",
    ],
  },
  punk: "assets/sprites/punk.png",
  bottle: "assets/sprites/bottle.png",
  dwarf: "assets/sprites/dwarf.png",
  dwarfB: "assets/sprites/dwarf-b.png",
  bigFairy: "assets/sprites/big-fairy.png",
  orb: "assets/sprites/orb.png",
  lamp: "assets/props/lamp.png",
  fence: "assets/props/fence.png",
  mushroom: "assets/props/mushroom.png",
  window: "assets/props/window.png",
  cobble: "assets/tiles/cobble.png",
  brick: "assets/tiles/brick.png",
  wet: "assets/tiles/wet.png",
  tripWall: "assets/tiles/trip-wall.png",
  street: "assets/bg/street.jpg",
};
