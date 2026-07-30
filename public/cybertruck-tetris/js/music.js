/**
 * Factory chiptune — Korobeiniki-inspired (public-domain Russian folk melody).
 * Procedural Web Audio, no external audio files.
 */

// MIDI-ish note numbers → frequency
function n2f(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

/**
 * Korobeiniki phrase (classic Tetris A-type vibe), note = midi, beats = length in 16ths
 * Transposed slightly for a square-wave lead.
 */
const MELODY = [
  // phrase 1
  [76, 2], [71, 1], [72, 1], [74, 2], [72, 1], [71, 1],
  [69, 2], [69, 1], [72, 1], [76, 2], [74, 1], [72, 1],
  [71, 3], [72, 1], [74, 2], [76, 2],
  [72, 2], [69, 2], [69, 4],
  // phrase 2
  [74, 3], [77, 1], [81, 2], [79, 1], [77, 1],
  [76, 3], [72, 1], [76, 2], [74, 1], [72, 1],
  [71, 3], [72, 1], [74, 2], [76, 2],
  [72, 2], [69, 2], [69, 4],
];

// Simple bass pedal under melody (root movement)
const BASS = [
  [45, 4], [45, 4], [41, 4], [41, 4],
  [43, 4], [43, 4], [45, 4], [41, 4],
  [38, 4], [38, 4], [45, 4], [45, 4],
  [43, 4], [43, 4], [41, 4], [41, 4],
];

export class Chiptune {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.playing = false;
    this.muted = false;
    this._timer = null;
    this._step = 0;
    this._bassStep = 0;
    this.bpm = 148;
    this._nextTime = 0;
  }

  async ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.12;
    this.master.connect(this.ctx.destination);

    // subtle factory hum
    this._hum = this.ctx.createOscillator();
    this._hum.type = "sine";
    this._hum.frequency.value = 55;
    const humG = this.ctx.createGain();
    humG.gain.value = 0.015;
    this._hum.connect(humG);
    humG.connect(this.master);
    this._hum.start();
  }

  async start() {
    await this.ensure();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this._nextTime = this.ctx.currentTime + 0.05;
    this._step = 0;
    this._bassStep = 0;
    this._schedule();
  }

  stop() {
    this.playing = false;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) {
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : 0.12,
        this.ctx?.currentTime || 0,
        0.05
      );
    }
    return this.muted;
  }

  setPaused(paused) {
    if (!this.ctx) return;
    if (paused) {
      this.ctx.suspend();
    } else if (this.playing && !this.muted) {
      this.ctx.resume();
    }
  }

  _beatSec() {
    // one 16th note
    return 60 / this.bpm / 4;
  }

  _schedule() {
    if (!this.playing || !this.ctx) return;
    const lookAhead = 0.2;
    const beat = this._beatSec();

    while (this._nextTime < this.ctx.currentTime + lookAhead) {
      const [note, len] = MELODY[this._step % MELODY.length];
      this._beep(note, this._nextTime, len * beat * 0.92, 0.07, "square");
      this._step++;

      // bass every step, advance bass by length in 16ths
      const [bNote, bLen] = BASS[this._bassStep % BASS.length];
      // only fire bass when we land on a bass grid (simplified: every 4 sixteenths)
      if (this._step % 4 === 1) {
        this._beep(bNote, this._nextTime, bLen * beat * 0.5, 0.05, "triangle");
        this._bassStep++;
      }

      // hat click
      if (this._step % 2 === 0) this._hat(this._nextTime);

      this._nextTime += len * beat;
    }

    this._timer = setTimeout(() => this._schedule(), 40);
  }

  _beep(midi, t, dur, gain, type) {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = n2f(midi);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.04, dur));
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  _hat(t) {
    if (!this.ctx || this.muted) return;
    const bufSize = Math.floor(this.ctx.sampleRate * 0.03);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = 0.018;
    src.connect(g);
    g.connect(this.master);
    src.start(t);
  }
}

export const music = new Chiptune();
