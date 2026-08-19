import * as THREE from "three";
import { CFG, NEON_SIGNS } from "./config.js";
import { fatness } from "./world.js";

const ASSET = {
  rat: "assets/sprites/rat.png",
  "rat-e": "assets/sprites/rat-e.png",
  "rat-w": "assets/sprites/rat-w.png",
  "rat-n": "assets/sprites/rat-n.png",
  "rat-fat": "assets/sprites/rat-fat.png",
  "rat-fat-e": "assets/sprites/rat-fat-e.png",
  "rat-fat-w": "assets/sprites/rat-fat-w.png",
  "rat-fat-n": "assets/sprites/rat-fat-n.png",
  "rat-vex": "assets/sprites/rat-vex.png",
  "rat-vex-e": "assets/sprites/rat-vex-e.png",
  "rat-vex-w": "assets/sprites/rat-vex-w.png",
  "rat-vex-n": "assets/sprites/rat-vex-n.png",
  "rat-noodle": "assets/sprites/rat-noodle.png",
  "rat-noodle-e": "assets/sprites/rat-noodle-e.png",
  "rat-noodle-w": "assets/sprites/rat-noodle-w.png",
  "rat-noodle-n": "assets/sprites/rat-noodle-n.png",
  "rat-pivot": "assets/sprites/rat-pivot.png",
  "rat-pivot-e": "assets/sprites/rat-pivot-e.png",
  "rat-pivot-w": "assets/sprites/rat-pivot-w.png",
  "rat-pivot-n": "assets/sprites/rat-pivot-n.png",
  cat: "assets/sprites/cat.png",
  dumpster: "assets/props/dumpster.png",
  tvs: "assets/props/tvs.png",
  fridge: "assets/props/fridge.png",
  kiosk: "assets/props/kiosk.png",
  pellet: "assets/props/pellet.png",
  box: "assets/props/box.png",
  barrel: "assets/props/barrel.png",
  lamp: "assets/props/lamp.png",
  asphalt: "assets/tiles/asphalt.png",
  brick: "assets/tiles/brick.png",
};

const RAT_RUN = Array.from({ length: 8 }, (_, i) =>
  `assets/sprites/rat-run/f${String(i + 1).padStart(2, "0")}.png`
);
const CAT_WALK = Array.from({ length: 8 }, (_, i) =>
  `assets/sprites/cat-walk/f${String(i + 1).padStart(2, "0")}.png`
);

function loadTex(loader, url, repeat = false) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (t) => {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.colorSpace = THREE.SRGBColorSpace;
        t.generateMipmaps = false;
        if (repeat) {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
        }
        resolve(t);
      },
      undefined,
      reject
    );
  });
}

function spriteMat(tex) {
  return new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.12,
    depthWrite: true,
  });
}

function makeSprite(tex, w, h) {
  const s = new THREE.Sprite(spriteMat(tex));
  s.scale.set(w, h, 1);
  s.center.set(0.5, 0);
  return s;
}

function dirKey(base, face) {
  if (!face || face === "s") return base;
  return `${base}-${face}`;
}

function neonCanvas(text, color) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 320;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '900 168px "ZCOOL KuaiLe", "Noto Sans SC", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;
  ctx.fillStyle = color;
  ctx.fillText(text, c.width / 2, c.height / 2);
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#fff8ff";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function labelCanvas(text, color) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 256, 64);
  ctx.font = '700 26px "Share Tech Mono", "VT323", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(6,4,16,0.72)";
  ctx.fillRect(18, 12, 220, 40);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 12, 220, 40);
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class View {
  constructor(canvas) {
    this.canvas = canvas;
    this.tex = {};
    this.ratRun = [];
    this.catWalk = [];
    this.actors = new Map();
    this.drops = [];
    this.pile = [];
    this.puffs = [];
    this.clock = 0;
  }

  async load() {
    const loader = new THREE.TextureLoader();
    const entries = Object.entries(ASSET);
    await Promise.all(
      entries.map(async ([k, url]) => {
        this.tex[k] = await loadTex(loader, url, k === "asphalt" || k === "brick");
      })
    );
    this.ratRun = await Promise.all(RAT_RUN.map((u) => loadTex(loader, u)));
    this.catWalk = await Promise.all(CAT_WALK.map((u) => loadTex(loader, u)));
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
    }
  }

  build(world) {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x140c28, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Pixel textures are already graded. ACES + PBR metal crushed the maze to black.
    this.renderer.toneMapping = THREE.NoToneMapping;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x140c28, 38, 70);
    this.scene.background = new THREE.Color(0x140c28);

    const aspect = w / h;
    this.viewHalf = 12.6;
    const half = this.viewHalf;
    this.camera = new THREE.OrthographicCamera(
      -half * aspect,
      half * aspect,
      half,
      -half,
      0.1,
      90
    );
    this.camera.position.set(16.5, 20.5, 16.5);
    this.camera.lookAt(0, 0.2, 0);

    this.scene.add(new THREE.HemisphereLight(0x9aa6ff, 0x3a2048, 2.4));
    this.scene.add(new THREE.AmbientLight(0x6a5a88, 1.35));
    const key = new THREE.DirectionalLight(0xfff2ff, 2.8);
    key.position.set(10, 28, 8);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x5ce8ff, 1.15);
    fill.position.set(-12, 18, -6);
    this.scene.add(fill);

    this.tex.asphalt.repeat.set(8, 8);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(world.size.w + 4, world.size.d + 4),
      new THREE.MeshLambertMaterial({
        map: this.tex.asphalt,
        color: 0xd8deee,
        emissive: 0x2a3358,
        emissiveIntensity: 0.7,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);

    for (const p of [
      [2.2, 1.4, 2.8, 1.5],
      [-4.6, -2.1, 2.2, 1.2],
      [6.4, 4.8, 1.8, 1.1],
      [-7.2, 3.2, 2.4, 1.3],
      [0.4, 6.1, 2.0, 1.0],
    ]) {
      const puddle = new THREE.Mesh(
        new THREE.CircleGeometry(1, 20),
        new THREE.MeshLambertMaterial({
          color: 0x3a5a88,
          emissive: 0x1a3058,
          emissiveIntensity: 0.55,
          transparent: true,
          opacity: 0.42,
        })
      );
      puddle.rotation.x = -Math.PI / 2;
      puddle.position.set(p[0], 0.02, p[1]);
      puddle.scale.set(p[2], p[3], 1);
      this.scene.add(puddle);
    }

    this.tex.brick.repeat.set(1.2, 1.6);
    const wallSideMat = new THREE.MeshLambertMaterial({
      map: this.tex.brick,
      color: 0xf2e8ff,
      emissive: 0x3a2460,
      emissiveIntensity: 0.85,
    });
    const wallTopMat = new THREE.MeshLambertMaterial({
      map: this.tex.brick,
      color: 0xffffff,
      emissive: 0x5a3a88,
      emissiveIntensity: 1.1,
    });
    const wallMats = [
      wallSideMat,
      wallSideMat,
      wallTopMat,
      wallSideMat,
      wallSideMat,
      wallSideMat,
    ];
    const wallEdgeMat = new THREE.LineBasicMaterial({
      color: 0x7af6ff,
      transparent: true,
      opacity: 0.45,
    });

    // Merge perimeter into long walls; inner cells stay as posts.
    const inner = [];
    const cols = world.cols;
    const rows = world.rows;
    for (const wall of world.walls) {
      const cx = (wall.minX + wall.maxX) / 2;
      const cz = (wall.minZ + wall.maxZ) / 2;
      const edge =
        Math.abs(cx) > (cols * CFG.cell) / 2 - CFG.cell * 1.2 ||
        Math.abs(cz) > (rows * CFG.cell) / 2 - CFG.cell * 1.2;
      if (edge) continue;
      inner.push(wall);
    }
    for (const wall of inner) {
      const bw = wall.maxX - wall.minX;
      const bd = wall.maxZ - wall.minZ;
      const geo = new THREE.BoxGeometry(bw, 1.85, bd);
      const mesh = new THREE.Mesh(geo, wallMats);
      mesh.position.set((wall.minX + wall.maxX) / 2, 0.92, (wall.minZ + wall.maxZ) / 2);
      this.scene.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), wallEdgeMat);
      mesh.add(edges);
    }

    // Canyon buildings around the block
    const bw = world.size.w;
    const bd = world.size.d;
    const facades = [
      { x: 0, z: -bd / 2 - 0.55, w: bw + 1.2, d: 1.1, h: 5.4 },
      { x: 0, z: bd / 2 + 0.55, w: bw + 1.2, d: 1.1, h: 4.8 },
      { x: -bw / 2 - 0.55, z: 0, w: 1.1, d: bd + 1.2, h: 5.1 },
      { x: bw / 2 + 0.55, z: 0, w: 1.1, d: bd + 1.2, h: 5.6 },
    ];
    for (const f of facades) {
      const geo = new THREE.BoxGeometry(f.w, f.h, f.d);
      const m = new THREE.Mesh(geo, wallMats);
      m.position.set(f.x, f.h / 2, f.z);
      this.scene.add(m);
    }

    for (const sign of NEON_SIGNS) {
      const tex = neonCanvas(sign.text, sign.color);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const wSign = sign.text.length > 1 ? 3.4 : 1.8;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(wSign, 1.35), mat);
      plane.position.set(sign.x, sign.y, sign.z);
      plane.rotation.y = sign.rotY;
      this.scene.add(plane);
      const light = new THREE.PointLight(sign.color, 2.6, 9, 1.6);
      light.position.set(sign.x, sign.y, sign.z);
      this.scene.add(light);
    }

    const propScale = {
      dumpster: [2.15, 1.85],
      tvs: [1.55, 2.05],
      fridge: [1.45, 2.35],
      box: [1.45, 1.15],
      barrel: [1.15, 1.55],
      lamp: [1.15, 3.55],
    };
    for (const p of world.props) {
      const [pw, ph] = propScale[p.type] || [1.6, 1.6];
      const spr = makeSprite(this.tex[p.sprite], pw, ph);
      spr.position.set(p.x, 0, p.z);
      this.scene.add(spr);
      if (p.label) {
        const lab = makeSprite(labelCanvas(p.label, "#9ef6ff"), 1.7, 0.42);
        lab.position.set(p.x, ph + 0.05, p.z);
        lab.material.depthWrite = false;
        this.scene.add(lab);
      }
      if (p.type === "lamp") {
        const pl = new THREE.PointLight(0x66f6ff, 2.2, 7.5, 1.8);
        pl.position.set(p.x, 2.6, p.z);
        this.scene.add(pl);
      }
      if (p.type === "fridge") {
        const pl = new THREE.PointLight(0xffd36a, 0.7, 3.4, 2);
        pl.position.set(p.x, 0.8, p.z + 0.2);
        this.scene.add(pl);
      }
      if (p.type === "tvs") {
        const pl = new THREE.PointLight(0xff3ad6, 0.85, 3.6, 2);
        pl.position.set(p.x, 1.1, p.z);
        this.scene.add(pl);
      }
    }

    this.kiosk = makeSprite(this.tex.kiosk, 2.55, 3.45);
    this.kiosk.position.set(world.dispenser.x, 0, world.dispenser.z);
    this.scene.add(this.kiosk);
    this.xLight = new THREE.PointLight(0x66f8ff, 4.2, 11, 1.4);
    this.xLight.position.set(world.dispenser.x, 2.1, world.dispenser.z + 0.2);
    this.scene.add(this.xLight);
    this.xLight2 = new THREE.PointLight(0xff3ad6, 1.6, 8, 1.6);
    this.xLight2.position.set(world.dispenser.x, 1.6, world.dispenser.z);
    this.scene.add(this.xLight2);

    this.pileGroup = new THREE.Group();
    this.scene.add(this.pileGroup);

    this.catLightR = new THREE.PointLight(0xff2244, 1.4, 4.5, 2);
    this.catLightB = new THREE.PointLight(0x2266ff, 1.4, 4.5, 2);
    this.scene.add(this.catLightR);
    this.scene.add(this.catLightB);

    this.buildRain();

    window.addEventListener("resize", () => this.resize());
  }

  buildRain() {
    const n = 700;
    const pos = new Float32Array(n * 3);
    this.rainSpeed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 32;
      this.rainSpeed[i] = 7 + Math.random() * 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x88c8ff,
      size: 0.045,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.rain = new THREE.Points(geo, mat);
    this.scene.add(this.rain);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    const half = this.viewHalf;
    this.camera.left = -half * aspect;
    this.camera.right = half * aspect;
    this.camera.top = half;
    this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();
  }

  bindActor(id, kind, texKey, w, h) {
    const spr = makeSprite(this.tex[texKey], w, h);
    const blob = new THREE.Mesh(
      new THREE.CircleGeometry(0.38, 12),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.03;
    this.scene.add(blob);
    this.scene.add(spr);
    this.actors.set(id, { spr, blob, kind, w, h, texKey, frame: 0, acc: 0 });
  }

  setPile(remaining, total, origin) {
    const want = Math.max(0, Math.ceil((remaining / total) * 18));
    while (this.pile.length > want) {
      const s = this.pile.pop();
      this.pileGroup.remove(s);
    }
    while (this.pile.length < want) {
      const s = makeSprite(this.tex.pellet, 0.28, 0.28);
      this.pileGroup.add(s);
      this.pile.push(s);
    }
    const gold = 0x382410;
    for (let i = 0; i < this.pile.length; i++) {
      const ang = i * 2.2;
      const rad = 0.18 + (i % 5) * 0.09;
      const y = 0.08 + Math.floor(i / 5) * 0.16;
      this.pile[i].position.set(
        origin.x + Math.cos(ang) * rad,
        y,
        origin.z + 1.05 + Math.sin(ang) * rad * 0.7
      );
    }
    this.xLight.intensity = 2.4 + (remaining / total) * 2.4;
  }

  syncDrops(drops) {
    while (this.drops.length < drops.length) {
      const s = makeSprite(this.tex.pellet, 0.32, 0.32);
      this.scene.add(s);
      this.drops.push(s);
    }
    while (this.drops.length > drops.length) {
      const s = this.drops.pop();
      this.scene.remove(s);
    }
    drops.forEach((d, i) => {
      this.drops[i].position.set(d.x, 0.18 + Math.sin(this.clock * 6 + i) * 0.04, d.z);
    });
  }

  puff(x, z, color) {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 10),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.06, z);
    this.scene.add(m);
    this.puffs.push({ m, t: 0 });
  }

  updateActor(id, ent, dt) {
    const a = this.actors.get(id);
    if (!a) return;
    a.spr.position.set(ent.x, 0, ent.z);
    a.blob.position.set(ent.x, 0.03, ent.z);
    const moving = Math.hypot(ent.vx || 0, ent.vz || 0) > 0.4;
    const face = ent.face || "s";
    if (a.kind === "player") {
      const fat = fatness(ent.pellets);
      const useFat = fat > 0.42;
      const base = useFat ? "rat-fat" : "rat";
      if (!useFat && moving && face === "s" && this.ratRun.length) {
        a.acc += dt;
        if (a.acc > 1 / 12) {
          a.acc = 0;
          a.frame = (a.frame + 1) % this.ratRun.length;
        }
        a.spr.material.map = this.ratRun[a.frame];
      } else {
        const key = dirKey(base, face);
        a.spr.material.map = this.tex[key] || this.tex[base];
        if (moving) a.acc += dt;
      }
      const bob = moving ? 1 + Math.sin(a.acc * 16) * 0.05 : 1;
      const sx = a.w * (1 + fat * 0.55);
      const sy = a.h * (1 + fat * 0.18) * bob;
      a.spr.scale.set(sx, sy, 1);
      a.blob.scale.set(1 + fat * 0.7, 1 + fat * 0.5, 1);
    } else if (a.kind === "rival") {
      const fat = fatness(ent.pellets);
      const key = dirKey(a.texKey, face);
      a.spr.material.map = this.tex[key] || this.tex[a.texKey];
      if (moving) a.acc += dt;
      const bob = moving ? 1 + Math.sin(a.acc * 16) * 0.06 : 1;
      a.spr.scale.set(a.w * (1 + fat * 0.5), a.h * bob * (1 + fat * 0.16), 1);
      a.blob.scale.set(1 + fat * 0.65, 1 + fat * 0.45, 1);
    } else if (a.kind === "cat") {
      if (moving && this.catWalk.length) {
        a.acc += dt;
        if (a.acc > 1 / 10) {
          a.acc = 0;
          a.frame = (a.frame + 1) % this.catWalk.length;
        }
        a.spr.material.map = this.catWalk[a.frame];
      } else {
        a.spr.material.map = this.tex.cat;
      }
      a.spr.scale.set(a.w, a.h, 1);
    }
    if (ent.stun > 0) {
      a.spr.material.rotation = Math.sin(this.clock * 18) * 0.2;
    } else {
      a.spr.material.rotation = 0;
    }
    if (ent.invuln > 0 && Math.floor(this.clock * 16) % 2 === 0) {
      a.spr.material.opacity = 0.35;
    } else {
      a.spr.material.opacity = 1;
    }
  }

  frame(state, dt) {
    this.clock += dt;
    if (this.rain) {
      const pos = this.rain.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - this.rainSpeed[i] * dt;
        if (y < 0) y = 9 + Math.random();
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
    for (const p of this.puffs) {
      p.t += dt;
      p.m.scale.setScalar(1 + p.t * 6);
      p.m.material.opacity = Math.max(0, 0.7 - p.t * 2.2);
    }
    this.puffs = this.puffs.filter((p) => {
      if (p.t > 0.4) {
        this.scene.remove(p.m);
        return false;
      }
      return true;
    });

    this.xLight2.intensity = 1.2 + Math.sin(this.clock * 3) * 0.4;
    const chase = state.cat.state === "chase";
    const blink = 0.6 + 0.6 * Math.sin(this.clock * 10);
    this.catLightR.position.set(state.cat.x - 0.25, 1.3, state.cat.z);
    this.catLightB.position.set(state.cat.x + 0.25, 1.3, state.cat.z);
    this.catLightR.intensity = chase ? 2.2 * blink : 0.7;
    this.catLightB.intensity = chase ? 2.2 * (1.2 - blink) : 0.7;

    this.renderer.render(this.scene, this.camera);
  }
}
