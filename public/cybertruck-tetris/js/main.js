/**
 * Boot: input + loop + music
 */

import { Game } from "./game.js";
import { renderGame, renderSide, syncHud } from "./render.js";
import { CANVAS } from "./config.js";
import { music } from "./music.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;
const ctx = canvas.getContext("2d");

const nextCtx = document.getElementById("next-canvas").getContext("2d");

const els = {
  score: document.getElementById("score"),
  level: document.getElementById("level"),
  built: document.getElementById("built"),
  goal: document.getElementById("goal"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayMsg: document.getElementById("overlay-msg"),
  overlayBtn: document.getElementById("overlay-btn"),
  muteBtn: document.getElementById("mute-btn"),
};

const game = new Game();
let last = performance.now();
let started = false;
const keys = new Set();

function showOverlay(title, msg, btn) {
  els.overlay.classList.remove("hidden");
  els.overlayTitle.textContent = title;
  els.overlayMsg.textContent = msg;
  els.overlayBtn.textContent = btn;
}

function hideOverlay() {
  els.overlay.classList.add("hidden");
}

function refreshOverlay() {
  if (!started) {
    showOverlay(
      "Assembly Line",
      "Three painted chassis. Match color + type, rotate to fit, snap on. Guides teach each new part once, then drop off by level 4.",
      "Start Line"
    );
    return;
  }
  if (game.state === "paused") {
    showOverlay("Paused", "Line on hold.", "Resume");
  } else if (game.state === "gameover") {
    showOverlay(
      "Line Shutdown",
      `${game.message}  Score ${game.score} · Trucks ${game.trucksBuilt}`,
      "Restart"
    );
  } else {
    hideOverlay();
  }
}

async function beginOrResumeMusic() {
  try {
    await music.start();
  } catch {
    /* autoplay policies — ignore */
  }
}

els.overlayBtn.addEventListener("click", async () => {
  if (!started) {
    started = true;
    game.reset();
    hideOverlay();
    await beginOrResumeMusic();
    return;
  }
  if (game.state === "paused") {
    game.togglePause();
    music.setPaused(false);
  } else if (game.state === "gameover") {
    game.reset();
    await beginOrResumeMusic();
  }
  refreshOverlay();
});

if (els.muteBtn) {
  els.muteBtn.addEventListener("click", () => {
    const muted = music.toggleMute();
    els.muteBtn.textContent = muted ? "Music: Off" : "Music: On";
    els.muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
  });
}

function isPlaying() {
  return started && game.state === "playing";
}

window.addEventListener("keydown", async (e) => {
  const k = e.key;
  keys.add(k);

  if (!started && (k === " " || k === "Enter")) {
    e.preventDefault();
    started = true;
    game.reset();
    hideOverlay();
    await beginOrResumeMusic();
    return;
  }

  if (k === "m" || k === "M") {
    if (els.muteBtn) els.muteBtn.click();
    return;
  }

  if (k === "p" || k === "P" || k === "Escape") {
    if (!started) return;
    if (game.state === "playing" || game.state === "paused") {
      e.preventDefault();
      game.togglePause();
      music.setPaused(game.state === "paused");
      refreshOverlay();
    }
    return;
  }

  if (k === "r" || k === "R") {
    if (!started) return;
    e.preventDefault();
    game.reset();
    await beginOrResumeMusic();
    music.setPaused(false);
    refreshOverlay();
    return;
  }

  if (!isPlaying()) return;

  if (k === "ArrowLeft" || k === "a" || k === "A") {
    e.preventDefault();
    game.move(-1);
  } else if (k === "ArrowRight" || k === "d" || k === "D") {
    e.preventDefault();
    game.move(1);
  } else if (k === "ArrowUp" || k === "x" || k === "X" || k === "w" || k === "W") {
    e.preventDefault();
    game.rotate(1);
  } else if (k === "z" || k === "Z" || k === "q" || k === "Q") {
    e.preventDefault();
    game.rotate(-1);
  } else if (k === "ArrowDown" || k === "s" || k === "S") {
    e.preventDefault();
    game.softDrop();
  } else if (k === " " || k === "Enter") {
    e.preventDefault();
    game.hardDrop();
  }
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.key);
});

function held(name) {
  return keys.has(name);
}

function frame(now) {
  const dt = Math.min(40, now - last);
  last = now;

  if (started) {
    if (isPlaying()) {
      if (held("ArrowLeft") || held("a") || held("A")) game.move(-0.4);
      if (held("ArrowRight") || held("d") || held("D")) game.move(0.4);

      if (held("ArrowDown") || held("s") || held("S")) {
        game.softDropHeld += dt;
        if (game.softDropHeld > 45) {
          game.softDrop();
          game.softDropHeld = 0;
        }
      } else {
        game.softDropHeld = 0;
      }
    }

    if (game.state !== "paused" && game.state !== "gameover") {
      const prev = game.state;
      game.update(dt);
      if (game.state !== prev) refreshOverlay();
    }
  }

  renderGame(ctx, game);
  renderSide(nextCtx, game);
  syncHud(game, els);
  requestAnimationFrame(frame);
}

game.state = "paused";
refreshOverlay();
requestAnimationFrame(frame);
