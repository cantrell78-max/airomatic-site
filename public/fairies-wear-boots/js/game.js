import { VIEW_W, GROUND_Y, ORB_TIME } from "./config.js";
import { wrap, wrapDelta, buildLevel, inTrip } from "./world.js";
import { createPlayer, resetPlayer, updatePlayer, kickBoxes, hurtPlayer } from "./player.js";
import { spawnEntities, updateEntities } from "./entities.js";
import { createFx, updateFx, spawnBits, spawnFloat } from "./particles.js";

export function createGame(assets, audio, input, renderer, ui) {
  const level = buildLevel();
  const state = {
    mode: "title",
    time: 0,
    score: 0,
    combo: 0,
    comboT: 0,
    best: (() => {
      try {
        return Number(localStorage.getItem("fwb-best") || 0);
      } catch {
        return 0;
      }
    })(),
    player: createPlayer(),
    ents: spawnEntities(level),
    level,
    cam: { x: 0 },
    fx: createFx(),
    trip: { grav: 0, stretch: 0, clone: 0 },
    banner: "",
    bannerT: 0,
    danceIntro: false,
  };

  function hud() {
    ui.score.textContent = String(state.score).padStart(6, "0");
    ui.best.textContent = String(state.best).padStart(6, "0");
    ui.lives.innerHTML = "🥾".repeat(Math.max(0, state.player.lives));
    const bits = [];
    if (state.trip.grav > 0) bits.push("GRAVITY UPSIDE DOWN");
    if (state.trip.stretch > 0) bits.push("STREET STRETCH");
    if (state.trip.clone > 0) bits.push("EXTRA FAIRIES");
    ui.trip.textContent = bits.join(" · ") || (inTrip(state.player.x) ? "THE TRIP" : "NIGHT STREET");
    ui.combo.textContent = state.combo > 1 ? `x${state.combo}` : "";
  }

  function addScore(n, x, y) {
    state.combo = state.comboT > 0 ? state.combo + 1 : 1;
    state.comboT = 2.2;
    const got = n * Math.min(8, state.combo);
    state.score += got;
    if (x != null) spawnFloat(state.fx, x, y || GROUND_Y - 60, `+${got}`);
    if (state.score > state.best) {
      state.best = state.score;
      try {
        localStorage.setItem("fwb-best", String(state.best));
      } catch {
        /* private mode */
      }
    }
    hud();
  }

  function startRun() {
    resetPlayer(state.player);
    state.ents = spawnEntities(level);
    state.score = 0;
    state.combo = 0;
    state.trip = { grav: 0, stretch: 0, clone: 0 };
    state.fx = createFx();
    state.mode = "play";
    state.banner = "";
    state.danceIntro = false;
    state.cam.x = wrap(state.player.x - VIEW_W * 0.4);
    ui.root.dataset.mode = "play";
    hud();
    audio.resume();
  }

  function applyOrb(kind) {
    state.trip[kind] = ORB_TIME[kind];
    if (kind === "grav") state.player.gravSign = -1;
    if (kind === "clone") state.player.clones = 2;
    state.banner = kind === "grav" ? "THE FLOOR IS THE SKY" : kind === "stretch" ? "THE STREET BENDS" : "FAIRIES WEAR BOOTS";
    state.bannerT = 1.8;
  }

  function update(dt) {
    if (state.mode === "title") {
      state.time += dt;
      state.cam.x = wrap(state.cam.x + 36 * dt);
      state.player.x = wrap(state.cam.x + VIEW_W * 0.38);
      state.player.y = GROUND_Y;
      state.player.anim = "walk";
      state.player.walkT += dt * 10;
      state.player.facing = 1;
      renderer.draw({ ...state, banner: "" });
      return;
    }
    if (state.mode === "pause") {
      renderer.draw(state);
      return;
    }

    if (state.fx.freeze > 0) {
      state.fx.freeze -= dt;
      renderer.draw(state);
      return;
    }

    dt = Math.min(0.033, dt);
    state.time += dt;
    if (state.comboT > 0) {
      state.comboT -= dt;
      if (state.comboT <= 0) state.combo = 0;
    }
    if (state.bannerT > 0) {
      state.bannerT -= dt;
      if (state.bannerT <= 0) state.banner = "";
    }

    for (const k of ["grav", "stretch", "clone"]) {
      if (state.trip[k] > 0) {
        state.trip[k] -= dt;
        if (state.trip[k] <= 0) {
          state.trip[k] = 0;
          if (k === "grav") state.player.gravSign = 1;
          if (k === "clone") state.player.clones = 0;
        }
      }
    }

    const plats = level.platforms.slice();
    if (state.player.gravSign < 0) plats.push(level.ceiling);

    if (state.mode === "play" && !state.player.dead) {
      updatePlayer(state.player, input, dt, plats, audio, state.fx);
      if (state.player.landedStomp) {
        spawnBits(state.fx, state.player.x, state.player.y, "crush");
      }
      const kicks = kickBoxes(state.player);
      const pops = updateEntities(state.ents, state.player, dt, kicks, addScore, audio, state.fx, state.trip);
      for (const p of pops) {
        if (p.hit) hurtPlayer(state.player, p.dir, audio, state.fx);
        if (p.kind) spawnBits(state.fx, p.x, p.y, p.kind);
        if (p.orb) {
          applyOrb(p.orb);
          spawnBits(state.fx, p.x, p.y, "orb");
        }
        if (p.danceStart && !state.danceIntro) {
          state.danceIntro = true;
          state.banner = "DANCE, YOU GOTTA BELIEVE ME";
          state.bannerT = 2.4;
        }
        if (p.danceWin) {
          state.banner = "YEAH — YOU GOTTA BELIEVE ME";
          state.bannerT = 2.6;
          applyOrb("clone");
        }
        if (p.step) spawnFloat(state.fx, p.x, p.y, `STEP ${p.step}`);
      }
    }

    if (state.player.dead && state.mode === "play") {
      state.mode = "dead";
      ui.root.dataset.mode = "dead";
      ui.overScore.textContent = String(state.score).padStart(6, "0");
    }

    {
      const target = wrap(state.player.x - VIEW_W * 0.4);
      state.cam.x = wrap(state.cam.x + wrapDelta(target, state.cam.x) * Math.min(1, dt * 6));
    }
    updateFx(state.fx, dt, state.cam.x);
    hud();
    renderer.draw(state);
  }

  return { state, startRun, update, hud };
}
