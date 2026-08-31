export function createInput(canvas) {
  const down = new Set();
  const pressed = new Set();
  const released = new Set();
  let kickQueued = false;
  let pointer = { x: 0, y: 0, down: false };

  const map = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "jump",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "jump",
    s: "down",
    A: "left",
    D: "right",
    W: "jump",
    S: "down",
    " ": "jump",
    j: "kick",
    J: "kick",
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
    if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
    }
    if (isDown) {
      if (!down.has(k)) pressed.add(k);
      down.add(k);
      if (k === "kick") kickQueued = true;
    } else {
      down.delete(k);
      released.add(k);
    }
  }

  window.addEventListener("keydown", (e) => onKey(e, true));
  window.addEventListener("keyup", (e) => onKey(e, false));

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest("button")) return;
    pointer = { ...canvasPos(e), down: true };
    kickQueued = true;
    down.add("kick");
    pressed.add("kick");
  });
  window.addEventListener("pointerup", () => {
    pointer.down = false;
    down.delete("kick");
    released.add("kick");
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  const touch = { left: false, right: false, jump: false, kick: false };
  function bindHold(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const go = (e) => {
      e.preventDefault();
      touch[key] = true;
      if (!down.has(key)) pressed.add(key);
      down.add(key);
      if (key === "kick") kickQueued = true;
    };
    const stop = (e) => {
      e.preventDefault();
      touch[key] = false;
      down.delete(key);
      released.add(key);
    };
    el.addEventListener("pointerdown", go);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointerleave", stop);
    el.addEventListener("pointercancel", stop);
  }
  bindHold("btn-left", "left");
  bindHold("btn-right", "right");
  bindHold("btn-jump", "jump");
  bindHold("btn-kick", "kick");

  return {
    down: (k) => down.has(k),
    pressed: (k) => pressed.has(k),
    axis() {
      let x = 0;
      if (down.has("left")) x -= 1;
      if (down.has("right")) x += 1;
      return x;
    },
    consumeKick() {
      const k = kickQueued;
      kickQueued = false;
      return k;
    },
    jumpHeld: () => down.has("jump"),
    jumpPressed: () => pressed.has("jump"),
    pointer,
    endFrame() {
      pressed.clear();
      released.clear();
    },
  };
}
