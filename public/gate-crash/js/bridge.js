import * as THREE from "three";
import { CFG } from "./config.js";
import { impactDamage } from "./logic.js";

function orangeMat(tex) {
  return new THREE.MeshStandardMaterial({
    color: CFG.ORANGE,
    map: tex || null,
    metalness: 0.55,
    roughness: 0.42,
  });
}

function asphaltMat(tex) {
  return new THREE.MeshStandardMaterial({
    color: CFG.ASPHALT,
    map: tex,
    metalness: 0.08,
    roughness: 0.88,
  });
}

function boxMesh(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function aabbFromMesh(mesh, pad = 0) {
  const b = new THREE.Box3().setFromObject(mesh);
  return {
    min: b.min.clone(),
    max: b.max.clone(),
    cx: (b.min.x + b.max.x) / 2,
    cy: (b.min.y + b.max.y) / 2,
    cz: (b.min.z + b.max.z) / 2,
    hx: (b.max.x - b.min.x) / 2 + pad,
    hy: (b.max.y - b.min.y) / 2 + pad,
    hz: (b.max.z - b.min.z) / 2 + pad,
  };
}

function sphereHitsAABB(px, py, pz, r, box) {
  const qx = Math.max(box.min.x, Math.min(px, box.max.x));
  const qy = Math.max(box.min.y, Math.min(py, box.max.y));
  const qz = Math.max(box.min.z, Math.min(pz, box.max.z));
  const dx = px - qx;
  const dy = py - qy;
  const dz = pz - qz;
  const d2 = dx * dx + dy * dy + dz * dz;
  if (d2 > r * r) return null;
  const d = Math.sqrt(d2) || 0.0001;
  return {
    nx: dx / d,
    ny: dy / d,
    nz: dz / d,
    dist: d,
    qx,
    qy,
    qz,
  };
}

function catenaryY(z, half, top, sag) {
  const t = z / half;
  return top - sag * (1 - t * t);
}

export function createBridge(scene, textures) {
  const root = new THREE.Group();
  scene.add(root);

  const matOrange = orangeMat(textures.iron);
  const matOrange2 = orangeMat(null);
  const matRoad = asphaltMat(textures.asphalt);
  const matIron = new THREE.MeshStandardMaterial({
    color: 0x2e3034,
    map: textures.iron,
    metalness: 0.7,
    roughness: 0.4,
  });
  const matCable = new THREE.MeshStandardMaterial({
    color: 0x2a1c18,
    metalness: 0.65,
    roughness: 0.35,
  });

  let sections = [];
  let deck = [];
  let cables = [];
  let suspenders = null;
  const suspIndex = [];

  const z0 = -CFG.SPAN_HALF;
  const deckY = CFG.DECK_Y;
  const towerN = CFG.HALF_MAIN;
  const towerS = -CFG.HALF_MAIN;

  function addSection({ mesh, kind, hp, zCenter, zLen, span, tower }) {
    root.add(mesh);
    const box = aabbFromMesh(mesh);
    const s = {
      mesh,
      kind,
      hp,
      maxHp: hp,
      alive: true,
      dying: 0,
      burned: false,
      zCenter,
      zLen,
      span,
      tower: tower || 0,
      box,
      hitCd: 0,
      mats: [],
    };
    mesh.traverse((c) => {
      if (c.isMesh) {
        c.material = c.material.clone();
        s.mats.push(c.material);
      }
    });
    sections.push(s);
    return s;
  }

  function makeDeckSegment(z, len, span) {
    const g = new THREE.Group();
    const road = boxMesh(CFG.DECK_W, 0.45, len - 0.08, matRoad, 0, deckY + 0.15, z);
    road.material = matRoad.clone();
    road.material.map = textures.asphalt;
    const truss = boxMesh(
      CFG.DECK_W - 1.6,
      CFG.DECK_THICK,
      len - 0.15,
      matOrange,
      0,
      deckY - 0.85,
      z
    );
    const railL = boxMesh(0.22, 1.15, len - 0.1, matOrange2, -CFG.DECK_W * 0.5 + 0.2, deckY + 0.85, z);
    const railR = boxMesh(0.22, 1.15, len - 0.1, matOrange2, CFG.DECK_W * 0.5 - 0.2, deckY + 0.85, z);
    const edgeL = boxMesh(0.7, 0.35, len - 0.1, matOrange2, -CFG.DECK_W * 0.48, deckY + 0.4, z);
    const edgeR = boxMesh(0.7, 0.35, len - 0.1, matOrange2, CFG.DECK_W * 0.48, deckY + 0.4, z);
    g.add(road, truss, railL, railR, edgeL, edgeR);
    if (Math.abs(z) % 20 < CFG.SEG_LEN) {
      const lamp = boxMesh(0.18, 3.2, 0.18, matIron, -CFG.DECK_W * 0.46, deckY + 2.2, z);
      const head = boxMesh(0.7, 0.12, 0.35, new THREE.MeshStandardMaterial({
        color: 0xffe6b0,
        emissive: 0xffc070,
        emissiveIntensity: 0.8,
      }), -CFG.DECK_W * 0.42, deckY + 3.7, z);
      g.add(lamp, head);
    }
    const hp = span === "main" ? 110 : span === "side" ? 95 : 80;
    const sec = addSection({
      mesh: g,
      kind: "deck",
      hp,
      zCenter: z,
      zLen: len,
      span,
    });
    deck.push(sec);
  }

  function buildDeck() {
    const spans = [
      { n: CFG.APPR_SEGS, zStart: -CFG.SPAN_HALF, span: "approach" },
      { n: CFG.SIDE_SEGS, zStart: -CFG.HALF_MAIN - CFG.SIDE_LEN, span: "side" },
      { n: CFG.MAIN_SEGS, zStart: -CFG.HALF_MAIN, span: "main" },
      { n: CFG.SIDE_SEGS, zStart: CFG.HALF_MAIN, span: "side" },
      { n: CFG.APPR_SEGS, zStart: CFG.HALF_MAIN + CFG.SIDE_LEN, span: "approach" },
    ];
    for (const sp of spans) {
      for (let i = 0; i < sp.n; i++) {
        const z = sp.zStart + (i + 0.5) * CFG.SEG_LEN;
        makeDeckSegment(z, CFG.SEG_LEN, sp.span);
      }
    }
    deck.sort((a, b) => a.zCenter - b.zCenter);
  }

  function buildTower(zSign) {
    const z = zSign * CFG.HALF_MAIN;
    const h = CFG.TOWER_H;
    const legX = CFG.TOWER_LEG_X;
    const levels = [
      { y: 10, h: 20, kind: "tower", hp: CFG.TOWER_HP },
      { y: deckY + 6, h: 14, kind: "tower", hp: CFG.TOWER_HP },
      { y: 52, h: 18, kind: "tower", hp: CFG.TOWER_HP * 0.85 },
      { y: 74, h: 16, kind: "tower", hp: CFG.TOWER_HP * 0.7 },
    ];
    for (const side of [-1, 1]) {
      for (const lv of levels) {
        const g = new THREE.Group();
        const w = 3.6 - lv.y * 0.012;
        const d = 4.4 - lv.y * 0.01;
        g.add(boxMesh(w, lv.h, d, matOrange, side * legX, lv.y, z));
        addSection({
          mesh: g,
          kind: lv.kind,
          hp: lv.hp,
          zCenter: z,
          zLen: d,
          span: "tower",
          tower: zSign,
        });
      }
    }
    const bracesY = [18, deckY + 12, 48, 66, 80];
    for (const y of bracesY) {
      const g = new THREE.Group();
      g.add(boxMesh(legX * 2 + 2.4, 2.1, 3.2, matOrange2, 0, y, z));
      if (y > 22 && y < 75) {
        const x1 = boxMesh(0.7, 11, 0.6, matOrange2, 0, y - 5, z);
        x1.rotation.z = 0.55;
        const x2 = boxMesh(0.7, 11, 0.6, matOrange2, 0, y - 5, z);
        x2.rotation.z = -0.55;
        g.add(x1, x2);
      }
      addSection({
        mesh: g,
        kind: "brace",
        hp: CFG.BRACE_HP,
        zCenter: z,
        zLen: 3.2,
        span: "tower",
        tower: zSign,
      });
    }
    const saddle = boxMesh(12, 2.4, 5, matOrange, 0, h - 1, z);
    root.add(saddle);
    const pier = boxMesh(16, 6, 12, new THREE.MeshStandardMaterial({
      color: 0x8a8680,
      roughness: 0.9,
    }), 0, 2, z);
    root.add(pier);
  }

  function buildCables() {
    const top = CFG.TOWER_H - 1.2;
    function tube(points) {
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 48, 0.42, 7, false);
      const m = new THREE.Mesh(geo, matCable);
      m.castShadow = true;
      root.add(m);
      cables.push(m);
    }
    for (const sx of [-CFG.CABLE_X, CFG.CABLE_X]) {
      const main = [];
      for (let i = 0; i <= 24; i++) {
        const z = -CFG.HALF_MAIN + (i / 24) * CFG.MAIN_LEN;
        main.push(new THREE.Vector3(sx, catenaryY(z, CFG.HALF_MAIN, top, CFG.CABLE_SAG), z));
      }
      tube(main);
      const north = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const z = CFG.HALF_MAIN + t * (CFG.SIDE_LEN + CFG.APPR_LEN * 0.4);
        const y = top - t * t * 38;
        north.push(new THREE.Vector3(sx, Math.max(deckY + 4, y), z));
      }
      tube(north);
      const south = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const z = -CFG.HALF_MAIN - t * (CFG.SIDE_LEN + CFG.APPR_LEN * 0.4);
        const y = top - t * t * 38;
        south.push(new THREE.Vector3(sx, Math.max(deckY + 4, y), z));
      }
      tube(south);
    }

    const dummy = new THREE.Object3D();
    const cyl = new THREE.CylinderGeometry(0.08, 0.08, 1, 5);
    suspenders = new THREE.InstancedMesh(cyl, matCable, deck.length * 2);
    suspenders.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    root.add(suspenders);
    let i = 0;
    for (const sec of deck) {
      for (const sx of [-CFG.CABLE_X, CFG.CABLE_X]) {
        const z = sec.zCenter;
        let cy;
        if (Math.abs(z) <= CFG.HALF_MAIN) {
          cy = catenaryY(z, CFG.HALF_MAIN, top, CFG.CABLE_SAG);
        } else {
          const t = (Math.abs(z) - CFG.HALF_MAIN) / (CFG.SIDE_LEN + CFG.APPR_LEN * 0.4);
          cy = Math.max(deckY + 4, top - t * t * 38);
        }
        const len = Math.max(1.2, cy - deckY);
        dummy.position.set(sx, deckY + len * 0.5, z);
        dummy.scale.set(1, len, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        suspenders.setMatrixAt(i, dummy.matrix);
        suspIndex.push({ sec, i });
        i++;
      }
    }
    suspenders.count = i;
    suspenders.instanceMatrix.needsUpdate = true;
  }

  function hideSuspendersFor(sec) {
    if (!suspenders) return;
    const dummy = new THREE.Object3D();
    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();
    for (const rec of suspIndex) {
      if (rec.sec === sec) suspenders.setMatrixAt(rec.i, dummy.matrix);
    }
    suspenders.instanceMatrix.needsUpdate = true;
  }

  function tintDamage(sec) {
    const k = sec.hp / sec.maxHp;
    for (const m of sec.mats) {
      if (!m || !m.color) continue;
      if (!m.userData.base) m.userData.base = m.color.clone();
      m.color.copy(m.userData.base).lerp(new THREE.Color(0x1a120e), 1 - k);
      m.emissive = m.emissive || new THREE.Color(0, 0, 0);
      if (k < 0.45) m.emissive.setHex(0x3a1000);
    }
  }

  function build() {
    disposeInner();
    sections = [];
    deck = [];
    cables = [];
    suspIndex.length = 0;
    buildDeck();
    buildTower(1);
    buildTower(-1);
    buildCables();
  }

  function disposeInner() {
    const keep = [];
    while (root.children.length) {
      const c = root.children.pop();
      c.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
    }
    suspenders = null;
    void keep;
  }

  function hitBall(ballPos, ballVel, radius) {
    const hits = [];
    for (const sec of sections) {
      if (!sec.alive || sec.dying > 0) continue;
      if (sec.hitCd > 0) continue;
      const hit = sphereHitsAABB(ballPos.x, ballPos.y, ballPos.z, radius, sec.box);
      if (!hit) continue;
      const vn = ballVel.x * hit.nx + ballVel.y * hit.ny + ballVel.z * hit.nz;
      const speed = Math.hypot(ballVel.x, ballVel.y, ballVel.z);
      const impact = Math.max(-vn, speed * 0.35);
      const dmg = impactDamage(impact, sec.maxHp, CFG.MIN_HIT_SPEED, CFG.ONESHOT_SPEED);
      hits.push({ sec, hit, dmg, impact, vn });
    }
    return hits;
  }

  function applyDamage(sec, dmg) {
    if (!sec.alive) return { destroyed: false, ignited: false };
    sec.hp -= dmg;
    sec.hitCd = 0.14;
    tintDamage(sec);
    const ignited = !sec.burned && sec.hp / sec.maxHp < 0.5;
    if (ignited) sec.burned = true;
    if (sec.hp <= 0) {
      sec.hp = 0;
      sec.dying = 0.16;
      return { destroyed: true, ignited: true };
    }
    return { destroyed: false, ignited };
  }

  function finishDestroy(sec, fx) {
    if (!sec.alive) return;
    sec.alive = false;
    sec.dying = 0;
    hideSuspendersFor(sec);
    const pos = new THREE.Vector3(sec.box.cx, sec.box.cy, sec.box.cz);
    fx.explode(pos, sec.kind === "tower" ? 1.6 : 1);
    fx.fireAt(pos, 5 + Math.random() * 3);
    const bits = sec.kind === "tower" ? 8 : 6;
    for (let i = 0; i < bits; i++) {
      const sx = 1.2 + Math.random() * (sec.kind === "tower" ? 2.8 : 2.2);
      const sy = 0.5 + Math.random() * 1.4;
      const sz = 1 + Math.random() * 2;
      const mesh = fx.boxDebris(
        { x: sx, y: sy, z: sz },
        sec.kind === "deck" && i % 3 === 0 ? CFG.ASPHALT : CFG.ORANGE,
        textures.iron
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        8 + Math.random() * 16,
        (Math.random() - 0.5) * 18
      );
      const ang = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
      const p = pos.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 2,
        (Math.random() - 0.5) * 3
      ));
      fx.addDebris(mesh, p, vel, ang);
    }
    sec.mesh.visible = false;
    if (sec.kind === "tower") {
      const standing = sections.some(
        (s) => s !== sec && s.kind === "tower" && s.tower === sec.tower && s.alive
      );
      if (!standing) cascadeTower(sec.tower, fx);
    }
  }

  let pendingCascade = [];

  function cascadeTower(sign, fx) {
    const targets = deck.filter((d) => {
      if (!d.alive) return false;
      if (sign > 0) return d.zCenter > 0 && d.zCenter <= CFG.HALF_MAIN + CFG.SEG_LEN;
      return d.zCenter < 0 && d.zCenter >= -CFG.HALF_MAIN - CFG.SEG_LEN;
    });
    targets.sort((a, b) => Math.abs(a.zCenter - sign * CFG.HALF_MAIN) - Math.abs(b.zCenter - sign * CFG.HALF_MAIN));
    targets.forEach((d, i) => {
      pendingCascade.push({ sec: d, t: 0.18 + i * 0.09, fx });
    });
    if (cables.length) {
      for (const c of cables) c.visible = sections.some((s) => s.kind === "tower" && s.alive);
    }
  }

  function update(dt, fx) {
    for (const sec of sections) {
      if (sec.hitCd > 0) sec.hitCd -= dt;
      if (sec.dying > 0 && sec.alive) {
        sec.dying -= dt;
        sec.mesh.rotation.z = (1 - sec.dying / 0.16) * 0.18 * (sec.zCenter >= 0 ? 1 : -1);
        sec.mesh.position.y -= dt * 6;
        if (sec.dying <= 0) finishDestroy(sec, fx);
      }
    }
    for (let i = pendingCascade.length - 1; i >= 0; i--) {
      const p = pendingCascade[i];
      p.t -= dt;
      if (p.t <= 0) {
        if (p.sec.alive) {
          p.sec.hp = 0;
          p.sec.dying = 0.1;
        }
        pendingCascade.splice(i, 1);
      }
    }
  }

  function remaining() {
    return sections.filter((s) => s.alive).length;
  }

  function remainingDeck() {
    return deck.filter((s) => s.alive).length;
  }

  function total() {
    return sections.length;
  }

  function sectionAtZ(z) {
    for (const d of deck) {
      if (!d.alive) continue;
      if (Math.abs(z - d.zCenter) <= d.zLen * 0.5 + 0.2) return d;
    }
    return null;
  }

  function aliveDeckFlags() {
    return deck.map((d) => d.alive);
  }

  function rebuild() {
    pendingCascade = [];
    build();
  }

  function dispose() {
    disposeInner();
    scene.remove(root);
  }

  build();

  return {
    root,
    get sections() {
      return sections;
    },
    get deck() {
      return deck;
    },
    z0,
    hitBall,
    applyDamage,
    finishDestroy,
    update,
    remaining,
    remainingDeck,
    total,
    sectionAtZ,
    aliveDeckFlags,
    rebuild,
    dispose,
    deckY,
  };
}
