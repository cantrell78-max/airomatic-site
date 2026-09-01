export function createInput(canvas) {
  const keys = new Set();
  let swingQueued = false;
  let swingHeld = false;
  let pointerDown = false;
  let lastMX = 0;
  let lastMY = 0;
  let orbitX = 0;
  let orbitY = 0;
  let wheelAcc = 0;
  let look = false;

  const stick = { x: 0, y: 0, active: false };
  let touchSwing = false;
  let touchReel = 0;
  let touchBoom = 0;

  function code(e) {
    return e.code || e.key;
  }

  function onKey(e, down) {
    const c = code(e);
    if (down) keys.add(c);
    else keys.delete(c);
    if (down && (c === "Space" || c === "KeyJ")) {
      swingQueued = true;
      swingHeld = true;
      e.preventDefault();
    }
    if (!down && (c === "Space" || c === "KeyJ")) swingHeld = false;
    if (
      [
        "Space",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(c)
    ) {
      e.preventDefault();
    }
  }

  function onDown(e) {
    if (e.button === 0) {
      pointerDown = true;
      swingQueued = true;
      swingHeld = true;
    }
    if (e.button === 2) look = true;
    lastMX = e.clientX;
    lastMY = e.clientY;
  }

  function onUp(e) {
    if (e.button === 0) {
      pointerDown = false;
      swingHeld = false;
    }
    if (e.button === 2) look = false;
  }

  function onMove(e) {
    const dx = e.clientX - lastMX;
    const dy = e.clientY - lastMY;
    lastMX = e.clientX;
    lastMY = e.clientY;
    if (look || (pointerDown && e.buttons & 2)) {
      orbitX += dx * 0.005;
      orbitY += dy * 0.005;
    } else if (look || e.buttons === 2) {
      orbitX += dx * 0.005;
      orbitY += dy * 0.005;
    }
    if (e.buttons === 2) {
      orbitX += dx * 0.005 * 0;
    }
  }

  function onWheel(e) {
    wheelAcc += Math.sign(e.deltaY);
    e.preventDefault();
  }

  function bindTouch() {
    const joy = document.getElementById("joystick");
    const knob = document.getElementById("joystick-knob");
    if (!joy) return;
    const setStick = (clientX, clientY) => {
      const r = joy.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      let x = (clientX - cx) / (r.width * 0.5);
      let y = (clientY - cy) / (r.height * 0.5);
      const m = Math.hypot(x, y) || 1;
      if (m > 1) {
        x /= m;
        y /= m;
      }
      stick.x = x;
      stick.y = y;
      stick.active = true;
      if (knob) {
        knob.style.transform = `translate(${x * 28}px, ${y * 28}px)`;
      }
    };
    const clear = () => {
      stick.x = stick.y = 0;
      stick.active = false;
      if (knob) knob.style.transform = "translate(0,0)";
    };
    joy.addEventListener("pointerdown", (e) => {
      joy.setPointerCapture(e.pointerId);
      setStick(e.clientX, e.clientY);
    });
    joy.addEventListener("pointermove", (e) => {
      if (stick.active) setStick(e.clientX, e.clientY);
    });
    joy.addEventListener("pointerup", clear);
    joy.addEventListener("pointercancel", clear);

    const bindHold = (id, fnDown, fnUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        fnDown();
      });
      el.addEventListener("pointerup", fnUp);
      el.addEventListener("pointerleave", fnUp);
      el.addEventListener("pointercancel", fnUp);
    };
    bindHold(
      "btn-swing",
      () => {
        touchSwing = true;
        swingQueued = true;
        swingHeld = true;
      },
      () => {
        touchSwing = false;
        swingHeld = false;
      }
    );
    bindHold(
      "btn-reel-in",
      () => {
        touchReel = -1;
      },
      () => {
        touchReel = 0;
      }
    );
    bindHold(
      "btn-reel-out",
      () => {
        touchReel = 1;
      },
      () => {
        touchReel = 0;
      }
    );
    bindHold(
      "btn-boom-l",
      () => {
        touchBoom = -1;
      },
      () => {
        touchBoom = 0;
      }
    );
    bindHold(
      "btn-boom-r",
      () => {
        touchBoom = 1;
      },
      () => {
        touchBoom = 0;
      }
    );
  }

  function attach() {
    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", (e) => {
      if (e.buttons & 2 || look) {
        orbitX += e.movementX * 0.004;
        orbitY += e.movementY * 0.004;
      }
    });
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    bindTouch();
  }

  function held(c) {
    return keys.has(c);
  }

  return {
    attach,
    throttle() {
      let t = 0;
      if (held("KeyW") || held("ArrowUp")) t += 1;
      if (held("KeyS") || held("ArrowDown")) t -= 1;
      if (stick.active) t += -stick.y;
      return clamp(t, -1, 1);
    },
    steer() {
      let s = 0;
      if (held("ArrowLeft")) s += 1;
      if (held("ArrowRight")) s -= 1;
      if (stick.active) s += -stick.x * 0.55;
      return clamp(s, -1, 1);
    },
    strafe() {
      let s = 0;
      if (held("KeyA") || held("KeyZ")) s -= 1;
      if (held("KeyD") || held("KeyC") || held("KeyX")) s += 1;
      if (stick.active) s += stick.x * 0.85;
      return clamp(s, -1, 1);
    },
    boom() {
      let b = touchBoom;
      if (held("KeyQ")) b -= 1;
      if (held("KeyE")) b += 1;
      return clamp(b, -1, 1);
    },
    reel() {
      let r = touchReel;
      if (held("KeyR") || held("ShiftLeft") || held("ShiftRight")) r -= 1;
      if (held("KeyF")) r += 1;
      if (wheelAcc) {
        r += Math.sign(wheelAcc);
        wheelAcc = 0;
      }
      return clamp(r, -1, 1);
    },
    consumeSwing() {
      const v = swingQueued || touchSwing;
      swingQueued = false;
      touchSwing = false;
      return v;
    },
    swingHeld() {
      return swingHeld;
    },
    orbit() {
      const x = orbitX;
      const y = orbitY;
      orbitX = 0;
      orbitY = 0;
      return { x, y };
    },
    pausePressed() {
      return held("KeyP") || held("Escape");
    },
    pointerDown: () => pointerDown,
  };
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
