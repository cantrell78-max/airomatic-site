import { VIEW_W, VIEW_H, HEAVEN } from "./config.js";
import { createState, resetRun, update, takeEvents, mulberry32 } from "./sim.js";

function pad(n, w = 6) {
  return String(Math.max(0, n | 0)).padStart(w, "0");
}

export function createGame(assets, audio, input, renderer, ui) {
  const state = createState(mulberry32((Math.random() * 1e9) | 0));
  const particles = [];
  let best = Number(localStorage.getItem("babel-best") || 0);

  function burst(x, y, color, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 140;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 1.5 + Math.random() * 3,
        color,
        life: 0.5 + Math.random() * 0.5,
      });
    }
  }

  function syncHud() {
    if (ui.score) ui.score.textContent = pad(state.score);
    if (ui.best) ui.best.textContent = pad(Math.max(best, state.score));
    if (ui.height) ui.height.textContent = String(state.floors.length).padStart(2, "0");
    if (ui.heaven) ui.heaven.textContent = String(HEAVEN);
    if (ui.company) {
      const s = state.slider;
      ui.company.textContent = s?.company ? s.company.name : "—";
    }
    if (ui.ability) {
      const s = state.slider;
      ui.ability.textContent = s?.company ? `${s.company.ability} · ${s.company.pitch}` : "stack a company";
    }
    if (ui.wrath) {
      const fill = Math.min(1, state.floors.length / HEAVEN);
      ui.wrath.style.width = `${fill * 100}%`;
    }
    if (ui.overScore) ui.overScore.textContent = pad(state.score);
    if (ui.overHeight) ui.overHeight.textContent = String(state.heightBest);
  }

  function setMode(mode) {
    if (mode) state.mode = mode;
    document.body.dataset.mode = state.mode;
  }

  function consume(events) {
    for (const e of events) {
      if (e.kind === "place") {
        audio.place();
        burst(VIEW_W / 2, VIEW_H * 0.4, "#ffd24a", 10);
      }
      if (e.kind === "perfect") {
        audio.perfect();
        burst(VIEW_W / 2, VIEW_H * 0.38, "#fff1a8", 22);
        burst(VIEW_W / 2, VIEW_H * 0.38, "#ff2bd6", 10);
      }
      if (e.kind === "miss") audio.miss();
      if (e.kind === "wrath" && e.extra === "comet") audio.comet();
      if (e.kind === "wrath" && e.extra === "lightning") audio.lightning();
      if (e.kind === "wrath" && e.extra === "flood") audio.flood();
      if (e.kind === "wrath" && e.extra === "babel") audio.babel();
      if (e.kind === "wrath" && e.extra === "quake") audio.quake();
      if (e.kind === "intercept") audio.intercept();
      if (e.kind === "cometHit") {
        audio.comet();
        burst(VIEW_W / 2, 80, "#ff7a2b", 16);
      }
      if (e.kind === "god") {
        audio.god();
        burst(VIEW_W / 2, 70, "#ffd24a", 36);
      }
      if (e.kind === "dead") {
        audio.dead();
        if (state.score > best) {
          best = state.score;
          localStorage.setItem("babel-best", String(best));
        }
        setMode("dead");
      }
      if (e.kind === "win") {
        audio.win();
        if (state.score > best) {
          best = state.score;
          localStorage.setItem("babel-best", String(best));
        }
        setMode("win");
      }
    }
  }

  const game = {
    state,
    startRun() {
      resetRun(state);
      particles.length = 0;
      audio.resume();
      setMode("play");
      syncHud();
    },
    update(dt) {
      if (state.mode === "title") {
        renderer.render(state, state.rng, particles);
        return;
      }
      const simInput = {
        drop: input.pressed("drop"),
        left: input.down("left"),
        right: input.down("right"),
      };
      update(state, simInput, dt);
      for (const a of state.announce) a.t -= dt;
      state.announce = state.announce.filter((a) => a.t > 0);
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 80 * dt;
        p.life -= dt;
      }
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
      consume(takeEvents(state));
      if (state.mode === "play" || state.mode === "god" || state.mode === "pause") setMode();
      renderer.render(state, state.rng, particles);
      syncHud();
    },
  };

  if (ui.best) ui.best.textContent = pad(best);
  renderer.render(state, state.rng, particles);
  return game;
}
