import { createState, resetRun, update, difficulty } from "./sim.js";

export function createGame(assets, audio, input, renderer, ui) {
  const state = createState();
  try {
    state.best = Number(localStorage.getItem("fe-best") || 0);
  } catch {
    state.best = 0;
  }

  function hud() {
    const d = difficulty(state.time);
    ui.score.textContent = String(state.score).padStart(6, "0");
    ui.best.textContent = String(state.best).padStart(6, "0");
    ui.wave.textContent = String(d.wave).padStart(2, "0");
    ui.combo.textContent = state.combo > 1 ? `x${state.combo}` : "";
    const n = state.towers[0];
    const s = state.towers[1];
    ui.north.style.width = `${Math.max(0, (n.hp / n.max) * 100)}%`;
    ui.south.style.width = `${Math.max(0, (s.hp / s.max) * 100)}%`;
  }

  function startRun() {
    resetRun(state);
    ui.root.dataset.mode = "play";
    hud();
    audio.resume();
  }

  function updateFrame(dt) {
    if (state.mode === "play") {
      const { events } = update(state, input, dt);
      for (const e of events) {
        if (e.type === "shoot") audio.shoot();
        if (e.type === "kill") audio.firework();
        if (e.type === "impact") audio.impact();
        if (e.type === "dead") {
          audio.dead();
          ui.root.dataset.mode = "dead";
          ui.overScore.textContent = String(state.score).padStart(6, "0");
        }
      }
      if (state.score > state.best) {
        state.best = state.score;
        try {
          localStorage.setItem("fe-best", String(state.best));
        } catch {
          /* private */
        }
      }
      hud();
    }
    renderer.draw(state, state.time);
  }

  hud();
  renderer.draw(state, 0);

  return { state, startRun, update: updateFrame };
}
