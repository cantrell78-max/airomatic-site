/** Procedural wet-cyberpunk bed + stingers. */

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let muted = false;
  let siren = null;
  let started = false;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.28;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.55;
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
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(peak * 0.7, t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
    return g;
  }

  function startBed() {
    const t = ctx.currentTime;
    // Rain
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const rain = ctx.createBufferSource();
    rain.buffer = buf;
    rain.loop = true;
    const rainF = ctx.createBiquadFilter();
    rainF.type = "highpass";
    rainF.frequency.value = 900;
    const rainG = ctx.createGain();
    rainG.gain.value = 0.07;
    rain.connect(rainF);
    rainF.connect(rainG);
    rainG.connect(musicGain);
    rain.start();

    // Drone
    const drone = ctx.createOscillator();
    drone.type = "sawtooth";
    drone.frequency.value = 55;
    const droneF = ctx.createBiquadFilter();
    droneF.type = "lowpass";
    droneF.frequency.value = 180;
    const droneG = ctx.createGain();
    droneG.gain.value = 0.18;
    drone.connect(droneF);
    droneF.connect(droneG);
    droneG.connect(musicGain);
    drone.start();

    const drone2 = ctx.createOscillator();
    drone2.type = "triangle";
    drone2.frequency.value = 82.5;
    const d2g = ctx.createGain();
    d2g.gain.value = 0.05;
    drone2.connect(d2g);
    d2g.connect(musicGain);
    drone2.start();

    // Neon hum
    const hum = ctx.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 220;
    const humG = ctx.createGain();
    humG.gain.value = 0.025;
    hum.connect(humG);
    humG.connect(musicGain);
    hum.start();

    // Pulse arp
    const notes = [110, 130.81, 146.83, 164.81, 196, 164.81, 146.83, 130.81];
    let step = 0;
    const tick = () => {
      if (!ctx || muted) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = notes[step % notes.length];
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 900 + (step % 4) * 80;
      const g = envGain(now, 0.01, 0.04, 0.18, 0.045);
      o.connect(f);
      f.connect(g);
      g.connect(musicGain);
      o.start(now);
      o.stop(now + 0.24);
      step++;
    };
    setInterval(tick, 280);

    // Kick
    setInterval(() => {
      if (!ctx || muted) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(90, now);
      o.frequency.exponentialRampToValueAtTime(38, now + 0.12);
      const g = envGain(now, 0.005, 0.04, 0.16, 0.16);
      o.connect(g);
      g.connect(musicGain);
      o.start(now);
      o.stop(now + 0.22);
    }, 560);
  }

  function pellet() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
    const g = envGain(t, 0.005, 0.03, 0.08, 0.2);
    o.connect(g);
    g.connect(sfxGain);
    o.start(t);
    o.stop(t + 0.14);
  }

  function dash() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(240, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.16);
    const g = envGain(t, 0.005, 0.04, 0.12, 0.12);
    o.connect(g);
    g.connect(sfxGain);
    o.start(t);
    o.stop(t + 0.18);
  }

  function spotted() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.28);
    const g = envGain(t, 0.01, 0.08, 0.2, 0.18);
    o.connect(g);
    g.connect(sfxGain);
    o.start(t);
    o.stop(t + 0.32);
  }

  function caught() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.35);
    const g = envGain(t, 0.01, 0.1, 0.25, 0.28);
    o.connect(g);
    g.connect(sfxGain);
    o.start(t);
    o.stop(t + 0.4);
    const n = ctx.createOscillator();
    n.type = "square";
    n.frequency.value = 90;
    const ng = envGain(t, 0.005, 0.05, 0.2, 0.1);
    n.connect(ng);
    ng.connect(sfxGain);
    n.start(t);
    n.stop(t + 0.28);
  }

  function win() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1046].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = envGain(t + i * 0.09, 0.01, 0.08, 0.2, 0.16);
      o.connect(g);
      g.connect(sfxGain);
      o.start(t + i * 0.09);
      o.stop(t + i * 0.09 + 0.32);
    });
  }

  function setSiren(on) {
    if (!ctx) return;
    if (on && !siren) {
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = "sine";
      o2.type = "sine";
      o1.frequency.value = 680;
      o2.frequency.value = 540;
      const g = ctx.createGain();
      g.gain.value = 0.045;
      o1.connect(g);
      o2.connect(g);
      g.connect(sfxGain);
      o1.start();
      o2.start();
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 2.4;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 80;
      lfo.connect(lfoG);
      lfoG.connect(o1.frequency);
      lfo.start();
      siren = { o1, o2, g, lfo };
    } else if (!on && siren) {
      try {
        siren.o1.stop();
        siren.o2.stop();
        siren.lfo.stop();
      } catch {
        /* already stopped */
      }
      siren = null;
    }
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.7;
    return muted;
  }

  return { resume, pellet, dash, spotted, caught, win, setSiren, toggleMute, isMuted: () => muted };
}
