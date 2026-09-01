/** Procedural bay wind, barge thrum, impacts, fire, splash. */

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let muted = false;
  let started = false;
  let engineOsc = null;
  let engineGain = null;
  let engineFilter = null;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.72;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.32;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(master);
  }

  async function resume() {
    ensure();
    if (ctx.state === "suspended") await ctx.resume();
    if (!started) {
      started = true;
      startBed();
    }
  }

  function envGain(t, a, hold, rel, peak = 1) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * 0.65), t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
    return g;
  }

  function noiseBuf(sec = 1) {
    const n = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function startBed() {
    const t = ctx.currentTime;
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = noiseBuf(2.5);
    windSrc.loop = true;
    const windF = ctx.createBiquadFilter();
    windF.type = "bandpass";
    windF.frequency.value = 420;
    windF.Q.value = 0.7;
    const windG = ctx.createGain();
    windG.gain.value = 0.045;
    windSrc.connect(windF);
    windF.connect(windG);
    windG.connect(musicGain);
    windSrc.start();

    const swell = ctx.createOscillator();
    swell.type = "sine";
    swell.frequency.value = 0.07;
    const swellG = ctx.createGain();
    swellG.gain.value = 0.02;
    swell.connect(swellG);
    swellG.connect(windF.frequency);
    swell.start();

    engineOsc = ctx.createOscillator();
    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 48;
    engineFilter = ctx.createBiquadFilter();
    engineFilter.type = "lowpass";
    engineFilter.frequency.value = 140;
    engineGain = ctx.createGain();
    engineGain.gain.value = 0.0001;
    engineOsc.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(musicGain);
    engineOsc.start();

    const horn = ctx.createOscillator();
    horn.type = "sine";
    horn.frequency.value = 98;
    const horn2 = ctx.createOscillator();
    horn2.type = "sine";
    horn2.frequency.value = 124;
    const hg = envGain(t + 0.4, 0.15, 0.9, 1.6, 0.07);
    horn.connect(hg);
    horn2.connect(hg);
    hg.connect(musicGain);
    horn.start(t + 0.4);
    horn2.start(t + 0.4);
    horn.stop(t + 3.2);
    horn2.stop(t + 3.2);
  }

  function engine(speed01) {
    if (!engineOsc || muted) return;
    const t = ctx.currentTime;
    const f = 46 + speed01 * 38;
    engineOsc.frequency.setTargetAtTime(f, t, 0.08);
    engineFilter.frequency.setTargetAtTime(120 + speed01 * 220, t, 0.1);
    engineGain.gain.setTargetAtTime(0.02 + speed01 * 0.07, t, 0.1);
  }

  function impact(power = 0.5) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const p = Math.max(0.15, Math.min(1, power));
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(0.35);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 180 + p * 900;
    const g = envGain(t, 0.004, 0.04, 0.22 + p * 0.2, 0.35 * p);
    src.connect(f);
    f.connect(g);
    g.connect(sfxGain);
    src.start(t);
    src.stop(t + 0.5);

    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(90 + p * 40, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 0.28);
    const og = envGain(t, 0.005, 0.05, 0.3, 0.28 * p);
    o.connect(og);
    og.connect(sfxGain);
    o.start(t);
    o.stop(t + 0.4);
  }

  function explode(power = 1) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const p = Math.max(0.3, Math.min(1.4, power));
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(0.6);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(700 * p, t);
    f.frequency.exponentialRampToValueAtTime(80, t + 0.45);
    const g = envGain(t, 0.008, 0.08, 0.7, 0.5 * Math.min(1, p));
    src.connect(f);
    f.connect(g);
    g.connect(sfxGain);
    src.start(t);
    src.stop(t + 0.8);

    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(55, t);
    o.frequency.exponentialRampToValueAtTime(18, t + 0.6);
    const og = envGain(t, 0.01, 0.12, 0.7, 0.22);
    o.connect(og);
    og.connect(sfxGain);
    o.start(t);
    o.stop(t + 0.85);
  }

  function splash(power = 0.5) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(0.4);
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 600;
    const g = envGain(t, 0.01, 0.05, 0.25, 0.18 * power);
    src.connect(f);
    f.connect(g);
    g.connect(sfxGain);
    src.start(t);
    src.stop(t + 0.4);
  }

  function teslaPop() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    explode(0.7);
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.18);
    const g = envGain(t, 0.004, 0.03, 0.16, 0.12);
    o.connect(g);
    g.connect(sfxGain);
    o.start(t);
    o.stop(t + 0.22);
  }

  function win() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [196, 247, 294, 392].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = envGain(t + i * 0.12, 0.02, 0.18, 0.5, 0.12);
      o.connect(g);
      g.connect(sfxGain);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 0.8);
    });
  }

  function setMuted(v) {
    muted = v;
    if (master) master.gain.value = v ? 0 : 0.72;
  }

  return {
    resume,
    engine,
    impact,
    explode,
    splash,
    teslaPop,
    win,
    setMuted,
    get muted() {
      return muted;
    },
    toggle() {
      setMuted(!muted);
      return muted;
    },
  };
}
