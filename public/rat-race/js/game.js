import { CFG, RATS, CAT_NAME } from "./config.js";
import {
  parseMap,
  circleResolve,
  dist,
  canSee,
  isHiddenFrom,
  fatness,
  radiusFor,
  speedFor,
  placeInOpen,
  screenFace,
} from "./world.js";
import { updateRival, updateCat } from "./ai.js";
import { createInput } from "./input.js";
import { createAudio } from "./audio.js";
import { View } from "./render.js";
import { initLang, toggleLang, t, ratName } from "./i18n.js";

export class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.view = new View(this.canvas);
    this.audio = createAudio();
    this.input = createInput(this.canvas);
    this.mode = "title";
    this.world = parseMap();
    this.last = 0;
    this.acc = 0;
  }

  async boot() {
    await this.view.load();
    this.view.build(this.world);
    this.resetRound();
    this.bindUi();
    initLang();
    this.refreshCopy();
    this.setMode("title");
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  bindUi() {
    document.getElementById("btn-start")?.addEventListener("click", () => this.start());
    document.getElementById("btn-how")?.addEventListener("click", () => {
      const how = document.getElementById("how");
      how.hidden = !how.hidden;
      if (!how.hidden) {
        how.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
    document.getElementById("btn-resume")?.addEventListener("click", () => this.setMode("play"));
    document.getElementById("btn-quit")?.addEventListener("click", () => {
      this.resetRound();
      this.setMode("title");
    });
    document.getElementById("btn-again")?.addEventListener("click", () => {
      this.resetRound();
      this.start();
    });
    document.getElementById("btn-menu")?.addEventListener("click", () => {
      this.resetRound();
      this.setMode("title");
    });
    document.getElementById("btn-mute")?.addEventListener("click", () => {
      this.audio.toggleMute();
      this.syncMuteLabel();
    });
    document.querySelectorAll(".btn-lang").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleLang();
        this.refreshCopy();
      });
    });
    window.addEventListener("pointerdown", () => this.audio.resume(), { once: true });
    window.addEventListener("keydown", () => this.audio.resume(), { once: true });
  }

  syncMuteLabel() {
    const el = document.getElementById("btn-mute");
    if (el) el.textContent = t(this.audio.isMuted() ? "soundOff" : "soundOn");
  }

  refreshCopy() {
    this.syncMuteLabel();
    if (this.rats) this.syncHud();
    if (this.lastRanking) this.renderResults(this.lastRanking);
  }

  setMode(mode) {
    this.mode = mode;
    document.body.dataset.mode = mode;
    const show = {
      "screen-title": mode === "title",
      "screen-pause": mode === "pause",
      "screen-results": mode === "results",
      hud: mode === "play",
      touch: mode === "play",
    };
    for (const [id, on] of Object.entries(show)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.hidden = !on;
      el.setAttribute("aria-hidden", on ? "false" : "true");
    }
  }

  start() {
    this.audio.resume();
    this.resetRound();
    this.setMode("play");
    this.toast(t("toastStart"));
  }

  resetRound() {
    const w = this.world;
    this.remaining = CFG.totalPellets;
    this.drops = [];
    this.noise = 0;
    this.ended = false;
    this.feeders = 0;
    this.toasts = [];
    this.dropStall = 0;
    this.lastRanking = null;

    const spawnPts = [...w.spawns];
    while (spawnPts.length < RATS.length) {
      spawnPts.push({
        x: spawnPts[0].x + (Math.random() - 0.5) * 1.6,
        z: spawnPts[0].z + (Math.random() - 0.5) * 0.8,
      });
    }

    this.rats = RATS.map((spec, i) => {
      const p = spawnPts[i] || spawnPts[spawnPts.length - 1];
      return {
        ...spec,
        x: p.x + (i - 1.5) * 0.55,
        z: p.z,
        vx: 0,
        vz: 0,
        facingX: 0,
        facingZ: -1,
        pellets: 0,
        stun: 0,
        invuln: 0,
        dash: 0,
        dashCd: 0,
        eatAcc: 0,
        hidden: false,
        speed: spec.human ? CFG.playerSpeed : CFG.rivalSpeed,
        r: CFG.skinnyR,
        path: null,
        repath: 0,
        aiWant: "seek",
      };
    });
    this.player = this.rats[0];

    this.cat = {
      id: "cat",
      name: CAT_NAME,
      x: w.dispenser.x,
      z: w.dispenser.z + 4.0,
      vx: 0,
      vz: 0,
      facingX: 0,
      facingZ: 1,
      state: "patrol",
      wp: 0,
      path: null,
      repath: 0,
      celebrate: 0,
      justSpotted: null,
      lastSeen: null,
      preyId: null,
      r: CFG.catR,
    };

    if (!this.bound) {
      this.view.bindActor("you", "player", "rat", 1.28, 1.02);
      this.view.bindActor("vex", "rival", "rat-vex", 1.24, 0.98);
      this.view.bindActor("noodle", "rival", "rat-noodle", 1.24, 0.98);
      this.view.bindActor("pivot", "rival", "rat-pivot", 1.24, 0.98);
      this.view.bindActor("cat", "cat", "cat", 1.72, 1.72);
      this.bound = true;
    }
    this.view.setPile(this.remaining, CFG.totalPellets, w.dispenser);
    this.syncHud(true);
  }

  toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.dataset.show = "1";
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      el.dataset.show = "0";
    }, 2200);
  }

  loop(now) {
    const dt = Math.min(0.033, (now - this.last) / 1000 || 0.016);
    this.last = now;
    if (this.mode === "play") {
      if (this.input.consumePause()) this.setMode("pause");
      else this.tick(dt);
    } else if (this.mode === "pause") {
      if (this.input.consumePause()) this.setMode("play");
    }
    this.draw(dt);
    requestAnimationFrame(this.loop);
  }

  tick(dt) {
    this.feeders = 0;
    this.updatePlayer(dt);
    for (const rat of this.rats) {
      if (rat.human) continue;
      rat.r = radiusFor(rat.pellets);
      rat.speed = speedFor(CFG.rivalSpeed, CFG.rivalSpeedFat, rat.pellets);
      if (rat.stun > 0) rat.stun -= dt;
      if (rat.invuln > 0) rat.invuln -= dt;
      const { feeding } = updateRival(
        rat,
        this.world,
        this.cat,
        this.rats,
        this.drops,
        this.remaining,
        dt
      );
      this.physics(rat);
      if (feeding) this.tryEat(rat, dt);
    }
    this.collectDrops(dt);
    this.nudgeStuckDrops(dt);
    this.noise = Math.max(0, this.noise * (1 - dt * 0.45) + this.feeders * dt * 0.9);
    updateCat(this.cat, this.world, this.rats, this.noise, dt);
    this.separateRats();
    for (const rat of this.rats) this.physics(rat);
    this.physics(this.cat);
    if (this.cat.justSpotted) {
      if (this.cat.justSpotted === "you") {
        this.audio.spotted();
        this.toast(t("toastSpotted"));
      }
      this.cat.justSpotted = null;
    }
    this.audio.setSiren(this.cat.state === "chase" && this.cat.preyId === "you");
    this.cat.facingX = this.cat.vx || this.cat.facingX;
    this.cat.facingZ = this.cat.vz || this.cat.facingZ;
    this.resolveCatches();
    this.view.setPile(this.remaining, CFG.totalPellets, this.world.dispenser);
    this.view.syncDrops(this.drops);
    this.syncHud(false);
    if (this.remaining <= 0 && !this.ended) {
      if (this.drops.length === 0) this.finish();
      else {
        this.dropStall += dt;
        if (this.dropStall > 7) {
          this.vacuumDrops();
          this.finish();
        }
      }
    } else {
      this.dropStall = 0;
    }
  }

  updatePlayer(dt) {
    const p = this.player;
    if (p.stun > 0) p.stun -= dt;
    if (p.invuln > 0) p.invuln -= dt;
    if (p.dash > 0) p.dash -= dt;
    if (p.dashCd > 0) p.dashCd -= dt;
    p.r = radiusFor(p.pellets);
    p.speed = speedFor(CFG.playerSpeed, CFG.playerSpeedFat, p.pellets);

    const axis = this.input.axis();
    const { fx, fz } = this.screenAxes();
    // W/S is screen-vertical (axis.z < 0 is W). fz is camera-forward, top of screen.
    let mx = fx.x * axis.x + fz.x * -axis.z;
    let mz = fx.z * axis.x + fz.z * -axis.z;
    const mag = Math.hypot(mx, mz);
    if (mag > 1e-4) {
      mx /= mag;
      mz /= mag;
      p.facingX = mx;
      p.facingZ = mz;
    }

    if (this.input.consumeDash() && p.dashCd <= 0 && p.stun <= 0) {
      p.dash = CFG.dashTime;
      p.dashCd = CFG.dashCd;
      this.audio.dash();
      this.view.puff(p.x, p.z, 0xff66ee);
    }

    if (p.stun > 0) {
      p.vx = 0;
      p.vz = 0;
    } else {
      const aiming = mag > 0.01;
      const dx = aiming ? mx : p.facingX;
      const dz = aiming ? mz : p.facingZ;
      const boost = p.dash > 0 ? CFG.dashSpeed / Math.max(p.speed, 0.5) : 1;
      const go = aiming || p.dash > 0;
      const spd = go ? p.speed * boost : 0;
      p.vx = dx * spd;
      p.vz = dz * spd;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
    }
    this.physics(p);
    p.hidden = isHiddenFrom(this.world, p, this.cat);

    if (this.input.feeding() && p.stun <= 0) this.tryEat(p, dt);
  }

  screenAxes() {
    const cam = this.view.camera;
    let fzX = -cam.position.x;
    let fzZ = -cam.position.z;
    const fl = Math.hypot(fzX, fzZ) || 1;
    fzX /= fl;
    fzZ /= fl;
    return {
      fx: { x: -fzZ, z: fzX },
      fz: { x: fzX, z: fzZ },
    };
  }

  physics(ent) {
    const r = ent.r || 0.4;
    const n = circleResolve(ent.x, ent.z, r, this.world.solids);
    ent.x = n.x;
    ent.z = n.z;
    const b = this.world.bounds;
    ent.x = Math.max(b.minX + r, Math.min(b.maxX - r, ent.x));
    ent.z = Math.max(b.minZ + r, Math.min(b.maxZ - r, ent.z));
  }

  separateRats() {
    for (let i = 0; i < this.rats.length; i++) {
      for (let j = i + 1; j < this.rats.length; j++) {
        const a = this.rats[i];
        const b = this.rats[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        const need = a.r + b.r + 0.08;
        if (d > 1e-4 && d < need) {
          const push = (need - d) * 0.5;
          const nx = dx / d;
          const nz = dz / d;
          a.x -= nx * push;
          a.z -= nz * push;
          b.x += nx * push;
          b.z += nz * push;
        }
      }
    }
  }

  tryEat(rat, dt) {
    if (this.remaining <= 0) return;
    if (dist(rat, this.world.dispenser) > CFG.feedRadius) {
      rat.eatAcc = 0;
      return;
    }
    this.feeders++;
    rat.eatAcc += dt;
    if (rat.eatAcc >= CFG.eatTime) {
      rat.eatAcc = 0;
      this.remaining--;
      rat.pellets++;
      if (rat.human) this.audio.pellet();
      this.view.puff(this.world.dispenser.x, this.world.dispenser.z + 1.05, 0xffc24a);
    }
  }

  collectDrops() {
    this.drops = this.drops.filter((drop) => {
      let taken = null;
      let best = CFG.dropTakeR;
      for (const rat of this.rats) {
        const d = dist(rat, drop);
        if (d < best) {
          best = d;
          taken = rat;
        }
      }
      if (taken) {
        taken.pellets++;
        if (taken.human) this.audio.pellet();
        return false;
      }
      return true;
    });
  }

  spawnDrop(x, z) {
    const p = placeInOpen(this.world, x, z, 0.24);
    this.drops.push({ x: p.x, z: p.z, age: 0 });
  }

  nudgeStuckDrops(dt) {
    const hungry = this.remaining <= 0;
    for (const drop of this.drops) {
      drop.age = (drop.age || 0) + dt;
      const p = placeInOpen(this.world, drop.x, drop.z, 0.24);
      drop.x = p.x;
      drop.z = p.z;
      if (!hungry && drop.age < 2.5) continue;
      let nearest = null;
      let best = 1e9;
      for (const rat of this.rats) {
        const d = dist(rat, drop);
        if (d < best) {
          best = d;
          nearest = rat;
        }
      }
      if (!nearest || best < 0.05) continue;
      const pull = hungry ? 3.6 : 1.4;
      const t = Math.min(1, (pull * dt) / best);
      drop.x += (nearest.x - drop.x) * t;
      drop.z += (nearest.z - drop.z) * t;
    }
  }

  vacuumDrops() {
    for (const drop of this.drops) {
      let nearest = this.rats[0];
      let best = dist(nearest, drop);
      for (const rat of this.rats) {
        const d = dist(rat, drop);
        if (d < best) {
          best = d;
          nearest = rat;
        }
      }
      nearest.pellets++;
    }
    this.drops = [];
    this.view.syncDrops(this.drops);
  }

  resolveCatches() {
    if (this.cat.celebrate > 0) return;
    for (const rat of this.rats) {
      if (rat.invuln > 0 || rat.stun > 0) continue;
      const d = dist(this.cat, rat);
      if (d < this.cat.r + rat.r + CFG.catchExtra) this.detain(rat);
    }
  }

  detain(rat) {
    const loss = Math.max(0, Math.floor(rat.pellets * CFG.catchLoss));
    rat.pellets -= loss;
    rat.stun = CFG.stunTime;
    rat.invuln = CFG.invulnTime;
    rat.eatAcc = 0;
    this.cat.celebrate = 0.85;
    this.cat.state = "patrol";
    this.cat.preyId = null;
    this.audio.caught();
    this.view.puff(rat.x, rat.z, 0xff3355);
    for (let i = 0; i < loss; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 1.2;
      this.spawnDrop(rat.x + Math.cos(a) * r, rat.z + Math.sin(a) * r);
    }
    if (rat.human) {
      this.toast(loss ? t("toastDrop", { n: loss }) : t("toastEmpty"));
    }
  }

  finish() {
    this.ended = true;
    this.audio.setSiren(false);
    this.audio.win();
    this.lastRanking = [...this.rats]
      .map((r) => ({
        id: r.id,
        human: r.human,
        color: r.color,
        pellets: r.pellets,
      }))
      .sort((a, b) => b.pellets - a.pellets);
    this.renderResults(this.lastRanking);
    this.setMode("results");
  }

  renderResults(ranked) {
    const winner = ranked[0];
    const box = document.getElementById("results-list");
    if (box) {
      box.innerHTML = ranked
        .map((r, i) => {
          const fat = Math.round(fatness(r.pellets) * 100);
          return `<li class="${r.human ? "you" : ""}">
            <span class="rk">${i + 1}</span>
            <span class="nm" style="--c:${r.color}">${ratName(r.id)}</span>
            <span class="sc">${r.pellets}</span>
            <span class="fat">${t("fatPct", { n: fat })}</span>
          </li>`;
        })
        .join("");
    }
    const title = document.getElementById("results-title");
    if (title) {
      title.textContent = winner.human ? t("winYou") : t("winOther", { name: ratName(winner.id) });
    }
    const blurb = document.getElementById("results-blurb");
    if (blurb) blurb.textContent = winner.human ? t("blurbYou") : t("blurbOther");
  }

  syncHud() {
    const rem = document.getElementById("hud-remaining");
    const you = document.getElementById("hud-you");
    const fat = document.getElementById("hud-fat");
    const status = document.getElementById("hud-status");
    const scores = document.getElementById("hud-scores");
    const bar = document.getElementById("feed-bar");
    if (rem) rem.textContent = String(this.remaining);
    if (you) you.textContent = String(this.player.pellets);
    const f = fatness(this.player.pellets);
    if (fat) {
      fat.style.setProperty("--fat", f.toFixed(3));
      fat.dataset.label = f > 0.75 ? t("fatStuffed") : f > 0.4 ? t("fatHeavy") : t("fatHungry");
    }
    if (status) {
      const seen = canSee(this.world, this.cat, this.player, {
        x: this.cat.facingX,
        z: this.cat.facingZ,
      });
      let s = t("statusLoose");
      let cls = "ok";
      if (this.player.stun > 0) {
        s = t("statusDetained");
        cls = "bad";
      } else if (this.player.hidden) {
        s = t("statusHidden");
        cls = "hide";
      } else if (seen && this.cat.state === "chase" && this.cat.preyId === "you") {
        s = t("statusSpotted");
        cls = "bad";
      } else if (dist(this.player, this.world.dispenser) < CFG.feedRadius) {
        s = t("statusFeed");
        cls = "feed";
      }
      status.textContent = s;
      status.dataset.k = cls;
    }
    if (scores) {
      scores.innerHTML = this.rats
        .map(
          (r) =>
            `<div class="sc ${r.human ? "you" : ""}" style="--c:${r.color}">
              <b>${ratName(r.id)}</b><span>${r.pellets}</span>
            </div>`
        )
        .join("");
    }
    if (bar) {
      const pct = this.remaining / CFG.totalPellets;
      bar.style.setProperty("--pct", pct.toFixed(4));
    }
    this.drawMini();
  }

  drawMini() {
    const c = document.getElementById("minimap");
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width;
    const h = c.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(6,4,18,0.82)";
    ctx.fillRect(0, 0, w, h);
    const b = this.world.bounds;
    const sx = w / (b.maxX - b.minX);
    const sz = h / (b.maxZ - b.minZ);
    const px = (x) => (x - b.minX) * sx;
    const pz = (z) => (z - b.minZ) * sz;
    ctx.fillStyle = "#1b1630";
    for (const s of this.world.solids) {
      ctx.fillRect(px(s.minX), pz(s.minZ), (s.maxX - s.minX) * sx, (s.maxZ - s.minZ) * sz);
    }
    ctx.fillStyle = "#66f8ff";
    ctx.fillRect(px(this.world.dispenser.minX), pz(this.world.dispenser.minZ), 8, 8);
    for (const r of this.rats) {
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(px(r.x), pz(r.z), r.human ? 3.4 : 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ff3355";
    ctx.beginPath();
    ctx.arc(px(this.cat.x), pz(this.cat.z), 3.6, 0, Math.PI * 2);
    ctx.fill();
  }

  draw(dt) {
    const axes = this.screenAxes();
    for (const r of this.rats) {
      r.face = screenFace(r, axes);
      this.view.updateActor(r.id, r, dt);
    }
    this.cat.face = screenFace(this.cat, axes);
    this.view.updateActor("cat", this.cat, dt);
    this.view.frame({ cat: this.cat }, dt);
  }
}
