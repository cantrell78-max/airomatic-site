import { VIEW_W, VIEW_H } from "./config.js";
import { loadAssets } from "./assets.js";
import { createInput } from "./input.js";
import { createAudio } from "./audio.js";
import { createRenderer } from "./render.js";
import { createGame } from "./game.js";

const canvas = document.getElementById("game");
const bootErr = document.getElementById("boot-error");

function fit() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW_W * dpr;
  canvas.height = VIEW_H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

fit();
window.addEventListener("resize", fit);

const ui = {
  root: document.body,
  score: document.getElementById("hud-score"),
  best: document.getElementById("hud-best"),
  lives: document.getElementById("hud-lives"),
  trip: document.getElementById("hud-trip"),
  combo: document.getElementById("hud-combo"),
  overScore: document.getElementById("over-score"),
};

try {
  const assets = await loadAssets();
  const audio = createAudio();
  const input = createInput(canvas);
  const renderer = createRenderer(canvas, assets);
  const game = createGame(assets, audio, input, renderer, ui);
  const how = document.getElementById("how");
  const btnHow = document.getElementById("btn-how");

  document.getElementById("btn-start").addEventListener("click", () => {
    how.hidden = true;
    btnHow.setAttribute("aria-expanded", "false");
    game.startRun();
    audio.resume();
  });
  document.getElementById("btn-again")?.addEventListener("click", () => game.startRun());
  document.getElementById("btn-mute").addEventListener("click", () => {
    const m = audio.toggleMute();
    document.getElementById("btn-mute").textContent = m ? "SOUND OFF" : "SOUND ON";
  });
  btnHow.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = how.hidden;
    how.hidden = !open;
    btnHow.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.getElementById("screen-title").addEventListener("click", (e) => {
    if (how.hidden) return;
    if (e.target.closest("#how") || e.target.closest("#btn-how")) return;
    how.hidden = true;
    btnHow.setAttribute("aria-expanded", "false");
  });

  let last = performance.now();
  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    if (input.pressed("start") && game.state.mode === "title") game.startRun();
    if (input.pressed("restart") && game.state.mode === "dead") game.startRun();
    if (input.pressed("pause") && (game.state.mode === "play" || game.state.mode === "pause")) {
      game.state.mode = game.state.mode === "play" ? "pause" : "play";
      document.body.dataset.mode = game.state.mode;
    }
    if (input.pressed("mute")) {
      const m = audio.toggleMute();
      document.getElementById("btn-mute").textContent = m ? "SOUND OFF" : "SOUND ON";
    }
    game.update(dt);
    input.endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
} catch (err) {
  console.error(err);
  bootErr.hidden = false;
  bootErr.textContent = err.message || String(err);
}
