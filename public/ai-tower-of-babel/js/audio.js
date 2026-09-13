function n2f(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

// Original glitchy hymn ostinato in D minor — not a licensed tune.
const HYMN = [
  [62, 1], [65, 1], [69, 1], [72, 1.5],
  [70, 0.5], [69, 1], [65, 1], [62, 2],
  [60, 1], [62, 1], [65, 1], [69, 1.5],
  [67, 0.5], [65, 1], [60, 1], [62, 2],
  [69, 0.5], [72, 0.5], [74, 1], [72, 1], [69, 1],
  [65, 1], [69, 1], [62, 2],
  [70, 0.5], [69, 0.5], [65, 1], [62, 1], [58, 1], [62, 2],
];

export function createAudio() {
  let ctx = null;
  let master, music, sfx;
  let muted = false;
  let started = false;
  let timer = null;
  let step = 0;
  let melodyI = 0;
  let melodyLeft = 0;
  const bpm = 96;
  const beat = 60 / bpm;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.78;
    master.connect(ctx.destination);
    music = ctx.createGain();
    music.gain.value = 0.32;
    sfx = ctx.createGain();
    sfx.gain.value = 0.58;
    music.connect(master);
    sfx.connect(master);
  }

  function choir(note, t, dur, gain = 0.18) {
    const f = n2f(note);
    for (const mul of [1, 1.5, 2.002]) {
      const o = ctx.createOscillator();
      o.type = mul === 1 ? "triangle" : "sine";
      o.frequency.setValueAtTime(f * mul, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain / mul, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1400;
      o.connect(lp);
      lp.connect(g);
      g.connect(music);
      o.start(t);
      o.stop(t + dur + 0.02);
    }
  }

  function arp(note, t, dur) {
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(n2f(note), t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1200;
    o.connect(bp);
    bp.connect(g);
    g.connect(music);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function kick(t) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(36, t + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g);
    g.connect(music);
    o.start(t);
    o.stop(t + 0.22);
  }

  function tick() {
    if (!ctx || muted) return;
    const t = ctx.currentTime + 0.03;
    if (step % 4 === 0) kick(t);
    if (step % 8 === 4) choir(50, t, beat * 4, 0.1);
    choir(38, t, beat * 1.05, 0.07);
    if (melodyLeft <= 0) {
      const [note, beats] = HYMN[melodyI % HYMN.length];
      melodyI++;
      melodyLeft = beats;
      choir(note, t, beat * beats * 0.95, 0.16);
      arp(note + 12, t, beat * 0.45);
    }
    melodyLeft -= 1;
    if (step % 3 === 0) arp(74 + (step % 5), t, beat * 0.28);
    step++;
  }

  function blip(freq, dur, type = "square", gain = 0.2) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(sfx);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(dur, freq, gain = 0.2) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(sfx);
    src.start(t);
    src.stop(t + dur);
  }

  const api = {
    resume() {
      ensure();
      if (ctx.state === "suspended") ctx.resume();
      if (!started) {
        started = true;
        timer = setInterval(tick, beat * 1000);
      }
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.78;
      return muted;
    },
    isMuted() {
      return muted;
    },
    place() {
      blip(220, 0.12, "triangle", 0.25);
      blip(330, 0.08, "square", 0.1);
    },
    perfect() {
      blip(523, 0.12, "sine", 0.22);
      blip(659, 0.18, "sine", 0.18);
      blip(784, 0.22, "triangle", 0.14);
    },
    miss() {
      blip(180, 0.18, "sawtooth", 0.2);
      blip(110, 0.28, "triangle", 0.16);
    },
    comet() {
      noise(0.28, 900, 0.22);
    },
    lightning() {
      noise(0.12, 2400, 0.3);
      blip(90, 0.2, "square", 0.22);
    },
    flood() {
      blip(48, 0.6, "sine", 0.22);
      noise(0.5, 180, 0.12);
    },
    babel() {
      blip(311, 0.15, "sawtooth", 0.14);
      blip(329, 0.2, "sawtooth", 0.12);
      blip(277, 0.28, "triangle", 0.12);
    },
    quake() {
      noise(0.35, 80, 0.28);
    },
    intercept() {
      blip(880, 0.08, "square", 0.16);
    },
    god() {
      blip(392, 0.4, "sine", 0.2);
      blip(523, 0.5, "sine", 0.16);
      blip(659, 0.7, "triangle", 0.14);
    },
    dead() {
      blip(98, 0.5, "sawtooth", 0.2);
      blip(73, 0.7, "triangle", 0.16);
    },
    win() {
      blip(523, 0.2, "sine", 0.2);
      blip(659, 0.3, "sine", 0.16);
      blip(784, 0.45, "sine", 0.14);
      blip(1046, 0.6, "triangle", 0.1);
    },
  };
  return api;
}
