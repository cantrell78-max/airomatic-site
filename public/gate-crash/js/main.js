import { Game } from "./game.js";

const game = new Game();
game.boot().catch((err) => {
  console.error(err);
  const el = document.getElementById("boot-error");
  if (el) {
    el.hidden = false;
    el.textContent = String(err.message || err);
  }
});
