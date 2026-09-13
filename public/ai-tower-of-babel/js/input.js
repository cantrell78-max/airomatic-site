import { VIEW_W, VIEW_H } from "./config.js";

export function createInput(canvas) {
  const down = new Set();
  const pressed = new Set();
  let pointer = { x: VIEW_W * 0.5, y: VIEW_H * 0.4, down: false };

  const map = {
    ArrowLeft: "left",
    ArrowRight: "right",
    a: "left",
    d: "right",
    A: "left",
    D: "right",
    " ": "drop",
    j: "drop",
    J: "drop",
    p: "pause",
    P: "pause",
    Escape: "pause",
    m: "mute",
    M: "mute",
    Enter: "start",
    r: "restart",
    R: "restart",
  };

  function onKey(e, isDown) {
    const k = map[e.key];
    if (!k) return;
    if ([" ", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    if (isDown) {
      if (!down.has(k)) pressed.add(k);
      down.add(k);
    } else {
      down.delete(k);
    }
  }

  window.addEventListener("keydown", (e) => onKey(e, true));
  window.addEventListener("keyup", (e) => onKey(e, false));

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * VIEW_W,
      y: ((e.clientY - r.top) / r.height) * VIEW_H,
    };
  }

  canvas.addEventListener("pointermove", (e) => {
    const p = canvasPos(e);
    pointer.x = p.x;
    pointer.y = p.y;
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest("button")) return;
    const p = canvasPos(e);
    pointer = { x: p.x, y: p.y, down: true };
    if (!down.has("drop")) pressed.add("drop");
    down.add("drop");
  });
  window.addEventListener("pointerup", () => {
    pointer.down = false;
    down.delete("drop");
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  function bindHold(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const go = (e) => {
      e.preventDefault();
      if (!down.has(key)) pressed.add(key);
      down.add(key);
    };
    const stop = (e) => {
      e.preventDefault();
      down.delete(key);
    };
    el.addEventListener("pointerdown", go);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointerleave", stop);
    el.addEventListener("pointercancel", stop);
  }
  bindHold("btn-left", "left");
  bindHold("btn-right", "right");
  bindHold("btn-drop", "drop");

  return {
    down: (k) => down.has(k),
    pressed: (k) => pressed.has(k),
    axis() {
      let x = 0;
      if (down.has("left")) x -= 1;
      if (down.has("right")) x += 1;
      return x;
    },
    pointer,
    endFrame() {
      pressed.clear();
    },
  };
}
