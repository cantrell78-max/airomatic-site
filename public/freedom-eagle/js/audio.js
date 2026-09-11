/** Low-bitrate hard-rock Star Spangled Banner. Melody is public domain. */

function n2f(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

// [midi, beats] — verse 1, 4/4 rock feel
const SSB = [
  [67, 0.5], [64, 0.5], [60, 1], [64, 1], [67, 1], [72, 2],
  [76, 0.5], [74, 0.5], [72, 1], [64, 1], [67, 2],
  [67, 0.5], [67, 0.25], [76, 1], [74, 0.5], [72, 0.5], [71, 1], [72, 1], [74, 2],
  [67, 0.5], [76, 0.5], [74, 0.5], [72, 0.5], [71, 1], [69, 1], [71, 1], [72, 2],
  [76, 0.5], [76, 0.5], [76, 1], [77, 1], [79, 2],
  [77, 0.5], [76, 0.5], [74, 1], [72, 1], [71, 2],
  [67, 0.5], [67, 0.5], [76, 1], [74, 0.5], [72, 0.5], [71, 1], [72, 1], [74, 2],
  [67, 0.5], [64, 0.5], [72, 0.5], [71, 0.5], [69, 1], [67, 1], [64, 2],
  [60, 0.5], [60, 0.5], [72, 1], [72, 0.5], [71, 0.5], [69, 1], [69, 1],
  [71, 1], [72, 0.5], [74, 0.5], [76, 2], [77, 1], [79, 2],
  [76, 0.5], [72, 0.5], [67, 1], [64, 1], [60, 2],
  [67, 0.5], [69, 0.5], [71, 1], [72, 1], [74, 1], [72, 3],
];

const CHORDS = [
  48, 48, 48, 48, 53, 48, 43, 48,
  48, 48, 53, 48, 43, 43, 48, 48,
  53, 53, 48, 48, 43, 43, 48, 48,
  48, 53, 43, 48, 48, 43, 48, 48,
];

export function createAudio() {
  let ctx = null;
  let master, music, sfx, crushIn;
  let muted = false;
  let started = false;
  let timer = null;
  let step = 0;
  let melodyI = 0;
  let melodyLeft = 0;
  const bpm = 148;
  const beat = 60 / bpm;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.82;
    master.connect(ctx.destination);

    music = ctx.createGain();
    music.gain.value = 0.34;
    sfx = ctx.createGain();
    sfx.gain.value = 0.62;

    crushIn = ctx.createGain();
    crushIn.gain.value = 1;
    const crushOut = ctx.createGain();
    crushOut.gain.value = 0.9;
    const crush = bitcrush(ctx);
    if (crush) {
      crushIn.connect(crush);
      crush.connect(crushOut);
    } else {
      crushIn.connect(crushOut);
    }
    crushOut.connect(music);
    music.connect(master);
    sfx.connect(master);
  }

  function bitcrush(ac) {
    try {
      if (!ac.createScriptProcessor) return null;
      const size = 256;
      const node = ac.createScriptProcessor(size, 1, 1);
      let hold = 0;
      let i = 0;
      const interval = 7;
      const steps = 24;
      node.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const output = e.outputBuffer.getChannelData(0);
        for (let n = 0; n < input.length; n++) {
          if (i % interval === 0) hold = Math.round(input[n] * steps) / steps;
          output[n] = hold * 1.15;
          i++;
        }
      };
      return node;
    } catch {
      return null;
    }
  }

  function curve() {
    const n = 256;
    const c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      c[i] = Math.tanh(x * 4.2);
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
    osc2.frequency.setValueAtTime(f * 1.995, t);
    const mix = ctx.createGain();
    mix.gain.value = 0.42;
    const sh = ctx.createWaveShaper();
    sh.curve = curve();
    sh.oversample = "2x";
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(2200, t + 0.03);
    lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(mix);
    osc2.connect(mix);
    mix.connect(sh);
    sh.connect(lp);
    lp.connect(g);
    g.connect(crushIn);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur + 0.02);
    osc2.stop(t + dur + 0.02);
  }

  function power(root, t, dur) {
    const f = n2f(root);
    for (const mul of [1, 1.5, 2]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f * mul, t);
      const sh = ctx.createWaveShaper();
      sh.curve = curve();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(sh);
      sh.connect(lp);
      lp.connect(g);
      g.connect(crushIn);
      o.start(t);
      o.stop(t + dur + 0.02);
    }
  }

  function kick(t) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g);
    g.connect(music);
    o.start(t);
    o.stop(t + 0.22);
  }

  function snare(t) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.14, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    src.connect(bp);
    bp.connect(g);
    g.connect(music);
    src.start(t);
    src.stop(t + 0.13);
  }

  function hat(t, open = false) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * (open ? 0.08 : 0.03), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(open ? 0.07 : 0.04, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.08 : 0.03));
    src.connect(hp);
    hp.connect(g);
    g.connect(music);
    src.start(t);
    src.stop(t + 0.09);
  }

  function tick() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    const t = now + 0.04;
    const chord = CHORDS[step % CHORDS.length];
    power(chord, t, beat * 0.92);
    if (step % 2 === 0) kick(t);
    if (step % 4 === 2) snare(t);
    hat(t, step % 8 === 7);
    if (melodyLeft <= 0) {
      const [note, beats] = SSB[melodyI % SSB.length];
      guitar(note, t, beats * beat * 0.92);
      guitar(note + 12, t, beats * beat * 0.7);
      melodyLeft = beats;
      melodyI++;
    }
    melodyLeft -= 1;
    step++;
  }

  function startBed() {
    if (timer) return;
    step = 0;
    melodyI = 0;
    melodyLeft = 0;
    tick();
    timer = setInterval(tick, beat * 1000);
  }

  async function resume() {
    ensure();
    if (ctx.state === "suspended") await ctx.resume();
    if (!started) {
      started = true;
      startBed();
    }
  }

  function noise(t, dur, peak, freq, q = 1) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(sfx);
    src.start(t);
    src.stop(t + dur);
  }

  function shoot() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(920, t);
    o.frequency.exponentialRampToValueAtTime(240, t + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g);
    g.connect(sfx);
    o.start(t);
    o.stop(t + 0.08);
    noise(t, 0.05, 0.1, 2400, 0.6);
  }

  function firework() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    noise(t, 0.35, 0.45, 900, 0.4);
    for (const n of [76, 79, 84, 88]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(n2f(n), t);
      o.frequency.exponentialRampToValueAtTime(n2f(n) * 1.5, t + 0.25);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g);
      g.connect(sfx);
      o.start(t);
      o.stop(t + 0.34);
    }
  }

  function impact() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g);
    g.connect(sfx);
    o.start(t);
    o.stop(t + 0.52);
    noise(t, 0.4, 0.35, 280, 0.8);
  }

  function dead() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(220 - i * 28, t + i * 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.2, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.3);
      o.connect(g);
      g.connect(sfx);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 0.32);
    }
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.82;
    return muted;
  }

  return { resume, shoot, firework, impact, dead, toggleMute, get muted() { return muted; } };
}
