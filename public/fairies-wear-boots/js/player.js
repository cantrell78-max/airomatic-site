import {
  GROUND_Y,
  GRAVITY,
  JUMP_V,
  JUMP_CUT,
  MAX_VX,
  ACCEL,
  AIR_ACCEL,
  FRICTION,
  AIR_DRAG,
  COYOTE,
  JUMP_BUF,
  STOMP_VY,
  KICK_TIME,
  KICK_RANGE,
  DANCE_HITS,
  DANCE_FLOAT_G,
  INVULN,
  LIVES,
} from "./config.js";
import { wrap, moveAndCollide, actorBox } from "./world.js";

export function createPlayer() {
  return {
    x: 240,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    w: 30,
    h: 46,
    facing: 1,
    grounded: true,
    coyote: 0,
    jumpBuf: 0,
    gravSign: 1,
    lives: LIVES,
    invuln: 0,
    anim: "idle",
    walkT: 0,
    squash: 1,
    kickT: 0,
    stomping: false,
    landedStomp: false,
    shockT: 0,
    danceLeft: 0,
    danceT: 0,
    dead: false,
    trail: [],
    clones: 0,
    hurtFlash: 0,
  };
}

export function resetPlayer(p) {
  Object.assign(p, createPlayer());
}

export function feetY(p) {
  return p.gravSign < 0 ? p.y - p.h : p.y;
}

export function kickBoxes(p) {
  const boxes = [];
  const fy = feetY(p);
  const add = (x, y, w, h) =>
    boxes.push(p.gravSign < 0 ? { x: x - w / 2, y, w, h } : { x: x - w / 2, y: y - h, w, h });
  if (p.kickT > 0 && !p.stomping && p.danceLeft <= 0) {
    add(p.x + p.facing * (p.w * 0.6 + KICK_RANGE * 0.45), fy, 70, 36);
  }
  if (p.stomping) add(p.x, fy + 8 * p.gravSign, 54, 40);
  if (p.shockT > 0) add(p.x, fy, 110, 48);
  if (p.danceLeft > 0) add(p.x, fy, 96, 70);
  if (p.clones > 0 && (p.kickT > 0 || p.stomping || p.danceLeft > 0)) {
    for (let i = 1; i <= p.clones; i++) {
      const tr = p.trail[p.trail.length - 1 - i * 8];
      if (tr) add(tr.x, tr.y, 70, 50);
    }
  }
  return boxes;
}

export function updatePlayer(p, input, dt, platforms, audio, fx) {
  p.landedStomp = false;
  if (p.dead) return;

  if (p.invuln > 0) p.invuln -= dt;
  if (p.hurtFlash > 0) p.hurtFlash -= dt;
  if (p.kickT > 0) p.kickT -= dt;
  if (p.danceT > 0) p.danceT -= dt;
  if (p.shockT > 0) p.shockT -= dt;

  const ax = input.axis();
  if (ax) p.facing = ax < 0 ? -1 : 1;

  const accel = p.grounded ? ACCEL : AIR_ACCEL;
  if (p.danceLeft <= 0) {
    p.vx += ax * accel * dt;
    const max = MAX_VX * (p.stomping ? 0.45 : 1);
    if (p.vx > max) p.vx = max;
    if (p.vx < -max) p.vx = -max;
  }

  if (p.grounded) p.vx *= Math.pow(FRICTION, dt * 60);
  else p.vx *= Math.pow(AIR_DRAG, dt * 60);

  if (input.jumpPressed()) p.jumpBuf = JUMP_BUF;
  else if (p.jumpBuf > 0) p.jumpBuf -= dt;
  if (p.grounded) p.coyote = COYOTE;
  else if (p.coyote > 0) p.coyote -= dt;

  if (p.jumpBuf > 0 && p.coyote > 0 && p.danceLeft <= 0) {
    p.vy = JUMP_V * p.gravSign;
    p.grounded = false;
    p.coyote = 0;
    p.jumpBuf = 0;
    p.squash = 1.18;
    audio.kick();
  }
  if (!input.jumpHeld() && p.gravSign * p.vy < 0) {
    const cap = JUMP_V * JUMP_CUT * p.gravSign;
    p.vy = p.gravSign > 0 ? Math.max(p.vy, cap) : Math.min(p.vy, cap);
  }

  if (input.consumeKick()) {
    if (p.grounded) {
      p.kickT = KICK_TIME;
      p.anim = "dance";
      audio.kick();
    } else if (p.stomping || p.danceLeft > 0) {
      p.danceLeft = DANCE_HITS;
      p.danceT = 0.28;
      p.stomping = false;
      p.vy = -220 * p.gravSign;
      p.kickT = 0.2;
      audio.dance(DANCE_HITS - p.danceLeft);
    } else {
      p.stomping = true;
      p.vy = STOMP_VY * p.gravSign;
      p.kickT = 0.3;
      audio.kick();
    }
  }

  if (p.danceLeft > 0) {
    p.vy += DANCE_FLOAT_G * p.gravSign * dt * 0.35;
    if (p.danceT <= 0) {
      p.danceLeft -= 1;
      if (p.danceLeft > 0) {
        p.danceT = 0.26;
        p.vy = -280 * p.gravSign;
        p.kickT = 0.2;
        audio.dance(DANCE_HITS - p.danceLeft);
      }
    }
  } else {
    const g = p.stomping ? GRAVITY * 1.65 : GRAVITY;
    p.vy += g * p.gravSign * dt;
    if (Math.abs(p.vy) > 1400) p.vy = 1400 * Math.sign(p.vy);
  }

  const wasAir = !p.grounded;
  p.grounded = moveAndCollide(p, dt, platforms, p.gravSign);

  if (p.grounded && wasAir) {
    p.squash = p.stomping ? 0.55 : 0.78;
    if (p.stomping) {
      p.landedStomp = true;
      p.kickT = 0.18;
      p.shockT = 0.16;
      audio.stomp();
      fx.shake = Math.max(fx.shake, 18);
      fx.freeze = 0.05;
    }
    p.stomping = false;
    p.danceLeft = 0;
  }

  p.squash += (1 - p.squash) * Math.min(1, dt * 10);

  if (Math.abs(p.vx) > 40 && p.grounded) p.walkT += dt * 10;
  else p.walkT += dt * 0.4;

  if (p.danceLeft > 0) p.anim = "dance";
  else if (p.stomping) p.anim = "stomp";
  else if (!p.grounded) p.anim = "jump";
  else if (p.kickT > 0) p.anim = "dance";
  else if (Math.abs(p.vx) > 40) p.anim = "walk";
  else p.anim = "idle";

  p.trail.push({ x: p.x, y: p.y, facing: p.facing, anim: p.anim, walkT: p.walkT });
  if (p.trail.length > 40) p.trail.shift();
}

export function hurtPlayer(p, dir, audio, fx) {
  if (p.invuln > 0 || p.dead) return false;
  p.lives -= 1;
  p.invuln = INVULN;
  p.hurtFlash = 0.35;
  p.vx = dir * 280;
  p.vy = -320 * p.gravSign;
  p.stomping = false;
  audio.hit();
  fx.shake = Math.max(fx.shake, 10);
  if (p.lives <= 0) p.dead = true;
  return true;
}

export { actorBox };
