/** Original doom riff — cobblestone stomp. Not a cover. */

function n2f(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

// E2=40. Tresillo doom, not a shuffle blues walk.
const RIFF = [
  40, 40, 0, 43, 40, 0, 46, 45, 43, 0, 40, 40, 38, 40, 0, 0, 40, 40, 0, 43, 47, 46, 43, 40, 46, 43, 40, 0, 38, 36, 40, 0,
];
const BASS = [
  28, 28, 28, 28, 28, 28, 24, 24, 26, 26, 28, 28, 23, 24, 28, 28, 28, 28, 28, 28, 31, 31, 28, 28, 26, 26, 24, 24, 28, 27, 28, 28,
];

export function createAudio() {
  let ctx = null;
  let master, music, sfx;
  let muted = false;
  let started = false;
  let step = 0;
  let nextT = 0;
  let timer = null;
  const bpm = 92;
  const stepDur = (60 / bpm) * 0.25;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
    music = ctx.createGain();
    music.gain.value = 0.32;
    music.connect(master);
    sfx = ctx.createGain();
    sfx.gain.value = 0.7;
    sfx.connect(master);
  }

  function curve() {
    const n = 256;
    const c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      c[i] = Math.tanh(x * 3.2);
    }
    return c;
  }

  function guitar(note, t, dur) {
    const f = n2f(note);
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f, t);
    const osc2 = ctx.createOscillator();
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(f * 1.997, t);
    const mix = ctx.createGain();
    mix.gain.value = 0.45;
    const sh = ctx.createWaveShaper();
    sh.curve = curve();
    sh.oversample = "2x";
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(720, t);
    lp.frequency.exponentialRampToValueAtTime(1600, t + 0.04);
    lp.frequency.exponentialRampToValueAtTime(500, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(mix);
    osc2.connect(mix);
    mix.connect(sh);
    sh.connect(lp);
    lp.connect(g);
    g.connect(music);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur + 0.02);
    osc2.stop(t + dur + 0.02);
  }

  function bass(note, t, dur) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(n2f(note), t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 280;
    osc.connect(lp);
    lp.connect(g);
    g.connect(music);
    osc.start(t);
    osc.stop(t + dur);
  }

  function kick(t, peak = 0.9) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(138, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g);
    g.connect(music);
    o.start(t);
    o.stop(t + 0.24);
  }

  function snare(t) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(bp);
    bp.connect(g);
    g.connect(music);
    src.start(t);
    src.stop(t + 0.14);
  }

  function hat(t) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    src.connect(hp);
    hp.connect(g);
    g.connect(music);
    src.start(t);
    src.stop(t + 0.05);
  }

  function rainBed() {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.value = 0.045;
    src.connect(hp);
    hp.connect(g);
    g.connect(music);
    src.start();
    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 49;
    const dg = ctx.createGain();
    dg.gain.value = 0.07;
    drone.connect(dg);
    dg.connect(music);
    drone.start();
  }

  function schedule() {
    if (!started || muted) return;
    const now = ctx.currentTime;
    while (nextT < now + 0.35) {
      const i = step % RIFF.length;
      const swing = i % 2 === 1 ? stepDur * 0.12 : 0;
      const t = nextT + swing;
      if (RIFF[i]) guitar(RIFF[i], t, stepDur * 1.35);
      if (i % 2 === 0) bass(BASS[i] || 28, t, stepDur * 2.1);
      if (i % 8 === 0) kick(t, 0.55);
      if (i % 8 === 4) snare(t);
      if (i % 2 === 0) hat(t);
      step++;
      nextT += stepDur;
    }
    timer = setTimeout(schedule, 80);
  }

  function env(t, a, h, r, peak = 1) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(peak * 0.7, t + a + h);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + h + r);
    return g;
  }

  function blip(freq, dur, type = "square", peak = 0.2) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    const g = env(t, 0.01, dur * 0.3, dur * 0.7, peak);
    o.connect(g);
    g.connect(sfx);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  return {
    async resume() {
      ensure();
      if (ctx.state === "suspended") await ctx.resume();
      if (master) master.gain.value = muted ? 0 : 0.85;
      if (!started) {
        started = true;
        rainBed();
        nextT = ctx.currentTime + 0.05;
        schedule();
      }
    },
    toggleMute() {
      muted = !muted;
      ensure();
      if (master) master.gain.value = muted ? 0 : 0.85;
      if (!muted && started) {
        nextT = ctx.currentTime + 0.05;
        schedule();
      }
      return muted;
    },
    isMuted: () => muted,
    stomp() {
      if (!ctx || muted) return;
      const t = ctx.currentTime;
      kick(t, 1.1);
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 400;
      const g = ctx.createGain();
      g.gain.value = 0.7;
      src.connect(lp);
      lp.connect(g);
      g.connect(sfx);
      src.start(t);
    },
    kick() {
      blip(180, 0.12, "sawtooth", 0.18);
      blip(90, 0.16, "square", 0.12);
    },
    dance(hit) {
      blip(220 + hit * 90, 0.14, "square", 0.16);
    },
    collect(kind) {
      const base = kind === "grav" ? 196 : kind === "stretch" ? 262 : 330;
      blip(base, 0.12, "triangle", 0.22);
      blip(base * 1.5, 0.18, "sine", 0.14);
    },
    hit() {
      blip(90, 0.2, "sawtooth", 0.25);
    },
    crush() {
      blip(140, 0.08, "square", 0.2);
      blip(70, 0.16, "triangle", 0.18);
    },
    cheer() {
      blip(392, 0.2, "square", 0.16);
      blip(494, 0.28, "square", 0.14);
      blip(587, 0.4, "triangle", 0.12);
    },
  };
}
