import * as THREE from "three";
import { CFG } from "./config.js";
import {
  teslaScore,
  sectionScore,
  speedBonus,
  computeGrade,
  formatTime,
} from "./logic.js";
import { createInput } from "./input.js";
import { createAudio } from "./audio.js";
import { makeTextures } from "./textures.js";
import { createWorld } from "./world.js";
import { createBridge } from "./bridge.js";
import { createBarge } from "./barge.js";
import { createTraffic } from "./cars.js";
import { createFX, flashScreen } from "./fx.js";

export class Game {
  async boot() {
    this.canvas = document.getElementById("game");
    this.textures = makeTextures();
    this.world = createWorld(this.canvas, this.textures);
    this.bridge = createBridge(this.world.scene, this.textures);
    this.barge = createBarge(this.world.scene, this.textures);
    this.fx = createFX(this.world.scene, this.textures);
    this.traffic = createTraffic(this.world.scene, this.bridge);
    this.input = createInput(this.canvas);
    this.input.attach();
    this.audio = createAudio();

    this.mode = "title";
    this.paused = false;
    this.t = 0;
    this.last = performance.now();
    this.clock = 0;
    this.timing = false;
    this.score = 0;
    this.teslaPts = 0;
    this.sectionPts = 0;
    this.teslas = 0;
    this.combo = 0;
    this.comboT = 0;
    this.scored = new Set();
    this.pauseHeld = false;
    this.orbitYaw = 0.55;
    this.orbitPitch = 0.32;
    this.camPos = new THREE.Vector3(90, 42, 50);
    this.look = new THREE.Vector3(0, 28, 0);
    this.lookSm = new THREE.Vector3(0, 28, 0);

    this.els = {
      title: document.getElementById("screen-title"),
      hud: document.getElementById("hud"),
      pause: document.getElementById("screen-pause"),
      results: document.getElementById("screen-results"),
      time: document.getElementById("hud-time"),
      teslas: document.getElementById("hud-teslas"),
      span: document.getElementById("hud-span"),
      bar: document.getElementById("span-bar"),
      score: document.getElementById("hud-score"),
      combo: document.getElementById("hud-combo"),
      popups: document.getElementById("popups"),
      flash: document.getElementById("flash"),
      touch: document.getElementById("touch"),
      how: document.getElementById("how"),
      mute: document.getElementById("btn-mute"),
      grade: document.getElementById("results-grade"),
      list: document.getElementById("results-list"),
    };

    this.bindUi();
    this.showTouch();
    this.setMode("title");
    requestAnimationFrame((n) => this.loop(n));
  }

  bindUi() {
    document.getElementById("btn-start").addEventListener("click", () => this.startRun());
    document.getElementById("btn-again").addEventListener("click", () => this.startRun());
    document.getElementById("btn-menu").addEventListener("click", () => this.setMode("title"));
    document.getElementById("btn-quit").addEventListener("click", () => this.setMode("title"));
    document.getElementById("btn-resume").addEventListener("click", () => this.setPaused(false));
    document.getElementById("btn-how").addEventListener("click", () => {
      const h = this.els.how;
      h.hidden = !h.hidden;
    });
    this.els.mute.addEventListener("click", () => this.toggleMute());
    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyM") this.toggleMute();
    });
  }

  toggleMute() {
    const muted = this.audio.toggle();
    this.els.mute.textContent = muted ? "Sound off" : "Sound on";
  }

  showTouch() {
    const touch = "ontouchstart" in window || window.innerWidth < 901;
    if (touch) this.els.touch.hidden = false;
  }

  setMode(mode) {
    this.mode = mode;
    document.body.dataset.mode = mode;
    this.els.title.hidden = mode !== "title";
    this.els.hud.hidden = mode !== "play";
    this.els.pause.hidden = mode !== "pause";
    this.els.results.hidden = mode !== "results";
    if (mode === "title") this.els.touch.hidden = true;
    else this.showTouch();
    if (mode === "play") this.els.touch.hidden = !("ontouchstart" in window || window.innerWidth < 901);
  }

  async startRun() {
    await this.audio.resume();
    this.scored = new Set();
    this.score = 0;
    this.teslaPts = 0;
    this.sectionPts = 0;
    this.teslas = 0;
    this.combo = 0;
    this.comboT = 0;
    this.clock = 0;
    this.timing = false;
    this.paused = false;
    this.fx.clear();
    this.traffic.reset();
    this.bridge.rebuild();
    this.barge.reset();
    this.orbitYaw = 0.4;
    this.orbitPitch = 0.28;
    this.setMode("play");
  }

  setPaused(v) {
    this.paused = v;
    if (this.mode === "play" || this.mode === "pause") {
      this.setMode(v ? "pause" : "play");
    }
  }

  onTesla(car) {
    if (this.comboT > 0) this.combo += 1;
    else this.combo = 1;
    this.comboT = CFG.COMBO_WINDOW;
    const pts = teslaScore(this.combo, CFG.TESLA_BASE);
    this.teslaPts += pts;
    this.teslas += 1;
    this.score = this.teslaPts + this.sectionPts;
    this.audio.teslaPop();
    flashScreen(this.els.flash, 0.28);
    this.popup(`+${pts} TESLA`, car.mesh.position, true);
  }

  noteDestroyed(sec) {
    if (this.scored.has(sec)) return;
    this.scored.add(sec);
    if (!this.timing) this.timing = true;
    const pts = sectionScore(sec.kind);
    this.sectionPts += pts;
    this.score = this.teslaPts + this.sectionPts;
    this.traffic.killOnSection(sec, this.fx, (c) => this.onTesla(c));
    this.popup(`+${pts}`, new THREE.Vector3(sec.box.cx, sec.box.cy + 4, sec.box.cz), false);
    if (sec.kind === "tower") flashScreen(this.els.flash, 0.45);
  }

  popup(text, world, tesla) {
    const v = world.clone().project(this.world.camera);
    const el = document.createElement("div");
    el.className = tesla ? "popup tesla" : "popup";
    el.textContent = text;
    el.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`;
    el.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
    this.els.popups.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  handleHits() {
    const hits = this.bridge.hitBall(
      this.barge.ballPos,
      this.barge.ballVel,
      this.barge.ballRadius
    );
    for (const h of hits) {
      this.barge.bounce(h.hit.nx, h.hit.ny, h.hit.nz, h.vn);
      if (h.dmg <= 0) continue;
      if (!this.timing) this.timing = true;
      const res = this.bridge.applyDamage(h.sec, h.dmg);
      this.audio.impact(h.impact / 28);
      this.fx.explode(
        new THREE.Vector3(h.sec.box.cx, h.sec.box.cy, h.sec.box.cz),
        0.35 + h.dmg / 180
      );
      if (res.ignited) {
        this.fx.fireAt(
          new THREE.Vector3(h.sec.box.cx, h.sec.box.cy + 1.2, h.sec.box.cz),
          4
        );
      }
      if (res.destroyed) {
        this.audio.explode(h.sec.kind === "tower" ? 1.3 : 0.9);
        for (const n of this.bridge.sections) {
          if (n === h.sec || !n.alive) continue;
          if (Math.abs(n.zCenter - h.sec.zCenter) < CFG.SEG_LEN * 1.15) {
            this.bridge.applyDamage(n, Math.round(h.sec.maxHp * 0.18));
          }
        }
      }
    }
  }

  win() {
    this.timing = false;
    const seconds = this.clock;
    const bonus = speedBonus(seconds, CFG.PAR_SECONDS, CFG.SPEED_PTS);
    this.score = this.teslaPts + this.sectionPts + bonus;
    const grade = computeGrade(this.score);
    this.els.grade.textContent = grade;
    this.els.list.innerHTML = `
      <li><span>Time</span><b>${formatTime(seconds)}</b></li>
      <li><span>Teslas</span><b>${this.teslas}</b></li>
      <li><span>Structure</span><b>${this.sectionPts.toLocaleString()}</b></li>
      <li><span>Tesla bonus</span><b>${this.teslaPts.toLocaleString()}</b></li>
      <li><span>Speed bonus</span><b>${bonus.toLocaleString()}</b></li>
      <li><span>Total</span><b>${this.score.toLocaleString()}</b></li>
    `;
    this.audio.win();
    this.setMode("results");
  }

  updateHud() {
    this.els.time.textContent = formatTime(this.timing || this.clock > 0 ? this.clock : 0);
    this.els.teslas.textContent = String(this.teslas);
    const rem = this.bridge.remaining();
    const tot = this.bridge.total();
    this.els.span.textContent = `${rem}/${tot}`;
    this.els.bar.style.setProperty("--pct", tot ? rem / tot : 0);
    this.els.score.textContent = this.score.toLocaleString();
    if (this.combo > 1 && this.comboT > 0) {
      this.els.combo.dataset.show = "1";
      this.els.combo.textContent = `x${this.combo}`;
    } else {
      this.els.combo.dataset.show = "0";
    }
  }

  updateCamera(dt) {
    const cam = this.world.camera;
    if (this.mode === "title" || this.mode === "results") {
      const t = this.t * 0.07;
      this.camPos.set(Math.cos(t) * 165, 48 + Math.sin(t * 0.6) * 8, Math.sin(t) * 130);
      this.look.set(0, 30, Math.sin(t * 0.4) * 20);
      cam.position.copy(this.camPos);
      cam.lookAt(this.look);
      return;
    }
    const o = this.input.orbit();
    this.orbitYaw += o.x;
    this.orbitPitch = Math.max(-0.12, Math.min(0.72, this.orbitPitch + o.y));
    const h = this.barge.heading;
    const dist = 48;
    const height = 20 + this.orbitPitch * 20;
    const yaw = h + Math.PI + this.orbitYaw;
    const tx = this.barge.x + Math.sin(yaw) * dist;
    const tz = this.barge.z + Math.cos(yaw) * dist;
    this.camPos.lerp(new THREE.Vector3(tx, height, tz), 1 - Math.pow(0.001, dt));
    this.lookSm.lerp(
      new THREE.Vector3(
        this.barge.ballPos.x * 0.55 + this.barge.x * 0.45,
        this.barge.ballPos.y * 0.45 + 14,
        this.barge.ballPos.z * 0.55 + this.barge.z * 0.45
      ),
      1 - Math.pow(0.002, dt)
    );
    cam.position.copy(this.camPos);
    cam.lookAt(this.lookSm);
    this.fx.applyShake(cam);
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;

    const pauseNow = this.input.pausePressed();
    if (pauseNow && !this.pauseHeld && (this.mode === "play" || this.mode === "pause")) {
      this.setPaused(!this.paused);
    }
    this.pauseHeld = pauseNow;

    const simulating = this.mode === "play" || this.mode === "title" || this.mode === "results";
    const playing = this.mode === "play";

    if (simulating) {
      if (playing) {
        this.barge.update(dt, this.input, this.fx, this.audio);
        this.handleHits();
        this.traffic.hitBall(
          this.barge.ballPos,
          this.barge.ballVel,
          this.barge.ballRadius,
          this.fx,
          (c) => this.onTesla(c)
        );
        this.traffic.update(dt, this.fx, (c) => this.onTesla(c));
        this.bridge.update(dt, this.fx);
        for (const sec of this.bridge.sections) {
          if (!sec.alive) this.noteDestroyed(sec);
        }
        if (this.timing) this.clock += dt;
        if (this.comboT > 0) this.comboT -= dt;
        if (this.comboT <= 0) this.combo = 0;
        this.updateHud();
        if (this.bridge.remaining() === 0 && this.scored.size > 0) this.win();
      } else {
        this.traffic.update(dt, this.fx, () => {});
        this.bridge.update(dt, this.fx);
      }
      this.fx.update(dt);
      this.world.update(this.t);
    }

    this.updateCamera(dt);
    this.world.render();
    requestAnimationFrame((n) => this.loop(n));
  }
}
