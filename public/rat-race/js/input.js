export function createInput(canvas) {
  const keys = new Set();
  const stick = { x: 0, z: 0, active: false };
  let feed = false;
  let dash = false;
  let dashQueued = false;
  let pauseQueued = false;

  const down = (e) => {
    const k = e.key.toLowerCase();
    keys.add(k);
    if (k === " " || k === "e") {
      feed = true;
      e.preventDefault();
    }
    if (k === "shift") {
      dashQueued = true;
      e.preventDefault();
    }
    if (k === "p" || k === "escape") pauseQueued = true;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  };
  const up = (e) => {
    const k = e.key.toLowerCase();
    keys.delete(k);
    if (k === " " || k === "e") feed = false;
  };

  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);

  const joy = document.getElementById("joystick");
  const knob = document.getElementById("joystick-knob");
  const feedBtn = document.getElementById("btn-feed");
  const dashBtn = document.getElementById("btn-dash");

  const setStick = (clientX, clientY) => {
    if (!joy) return;
    const r = joy.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (clientX - cx) / (r.width * 0.42);
    let dy = (clientY - cy) / (r.height * 0.42);
    const m = Math.hypot(dx, dy);
    if (m > 1) {
      dx /= m;
      dy /= m;
    }
    stick.x = dx;
    stick.z = dy;
    stick.active = m > 0.08;
    if (knob) {
      knob.style.transform = `translate(${dx * 22}px, ${dy * 22}px)`;
    }
  };
  const clearStick = () => {
    stick.x = 0;
    stick.z = 0;
    stick.active = false;
    if (knob) knob.style.transform = "translate(0,0)";
  };

  if (joy) {
    const move = (e) => {
      const t = e.touches ? e.touches[0] : e;
      setStick(t.clientX, t.clientY);
      e.preventDefault();
    };
    joy.addEventListener("pointerdown", (e) => {
      joy.setPointerCapture(e.pointerId);
      move(e);
    });
    joy.addEventListener("pointermove", (e) => {
      if (e.buttons || stick.active) move(e);
    });
    joy.addEventListener("pointerup", clearStick);
    joy.addEventListener("pointercancel", clearStick);
  }
  if (feedBtn) {
    const on = (e) => {
      feed = true;
      e.preventDefault();
    };
    const off = () => {
      feed = false;
    };
    feedBtn.addEventListener("pointerdown", on);
    feedBtn.addEventListener("pointerup", off);
    feedBtn.addEventListener("pointerleave", off);
  }
  if (dashBtn) {
    dashBtn.addEventListener("pointerdown", (e) => {
      dashQueued = true;
      e.preventDefault();
    });
  }

  function axis() {
    let x = 0;
    let z = 0;
    if (keys.has("a") || keys.has("arrowleft")) x -= 1;
    if (keys.has("d") || keys.has("arrowright")) x += 1;
    if (keys.has("w") || keys.has("arrowup")) z -= 1;
    if (keys.has("s") || keys.has("arrowdown")) z += 1;
    if (stick.active) {
      x += stick.x;
      z += stick.z;
    }
    const m = Math.hypot(x, z);
    if (m > 1) {
      x /= m;
      z /= m;
    }
    return { x, z, mag: Math.min(1, m) };
  }

  function consumeDash() {
    if (dashQueued) {
      dashQueued = false;
      return true;
    }
    return false;
  }

  function consumePause() {
    if (pauseQueued) {
      pauseQueued = false;
      return true;
    }
    return false;
  }

  return {
    axis,
    feeding: () => feed || keys.has(" ") || keys.has("e"),
    consumeDash,
    consumePause,
    keys,
  };
}
