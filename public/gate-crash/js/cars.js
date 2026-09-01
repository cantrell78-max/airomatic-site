import * as THREE from "three";
import { CFG } from "./config.js";

const PAINT = [0xf4f4f6, 0x111213, 0xc41e3a, 0x1a3a6b, 0xc8ccd0, 0x222428];

function wheel(mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 10), mat);
  m.rotation.z = Math.PI / 2;
  m.castShadow = true;
  return m;
}

function makeSedan(color) {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.55,
    roughness: 0.32,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x151a22,
    metalness: 0.7,
    roughness: 0.12,
  });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.72, 4.5), paint);
  body.position.y = 0.72;
  body.castShadow = true;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.15), glass);
  cabin.position.set(0, 1.28, -0.15);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 1.1), paint);
  hood.position.set(0, 1.02, 1.55);
  const light = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.12, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xfff2d0, emissive: 0xffe8b0, emissiveIntensity: 1 })
  );
  light.position.set(0, 0.7, 2.28);
  g.add(body, cabin, hood, light);
  const wpos = [
    [0.85, 0.38, 1.4],
    [-0.85, 0.38, 1.4],
    [0.85, 0.38, -1.45],
    [-0.85, 0.38, -1.45],
  ];
  for (const p of wpos) {
    const w = wheel(rubber);
    w.position.set(...p);
    g.add(w);
  }
  g.userData.kind = "sedan";
  return g;
}

function makeCybertruck() {
  const g = new THREE.Group();
  const stainless = new THREE.MeshStandardMaterial({
    color: 0xc5c8cc,
    metalness: 0.92,
    roughness: 0.28,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.4,
    roughness: 0.5,
  });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.42);
  shape.lineTo(0.05, 1.12);
  shape.lineTo(2.05, 1.92);
  shape.lineTo(5.35, 1.38);
  shape.lineTo(5.35, 0.42);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.95, bevelEnabled: false, steps: 1 });
  geo.rotateY(Math.PI / 2);
  geo.translate(-0.97, 0, -2.65);
  const body = new THREE.Mesh(geo, stainless);
  body.castShadow = true;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 2.2), dark);
  glass.position.set(0, 1.55, 0.35);
  glass.rotation.x = -0.28;
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xf4f6f8, emissive: 0xe8eef4, emissiveIntensity: 1.1 })
  );
  bar.position.set(0, 0.82, 2.55);
  g.add(body, glass, bar);
  const wpos = [
    [0.95, 0.4, 1.55],
    [-0.95, 0.4, 1.55],
    [0.95, 0.4, -1.6],
    [-0.95, 0.4, -1.6],
  ];
  for (const p of wpos) {
    const w = wheel(rubber);
    w.scale.set(1.15, 1.15, 1.15);
    w.position.set(...p);
    g.add(w);
  }
  g.userData.kind = "cyber";
  return g;
}

export function createTraffic(scene, bridge) {
  const cars = [];
  let spawnCd = 0.6;
  const lanes = [-5.2, -1.75, 1.75, 5.2];

  function makeCar() {
    const cyber = Math.random() < 0.34;
    const mesh = cyber ? makeCybertruck() : makeSedan(PAINT[(Math.random() * PAINT.length) | 0]);
    scene.add(mesh);
    return mesh;
  }

  function spawn() {
    if (cars.filter((c) => !c.dead).length >= CFG.MAX_CARS) return;
    const fromNorth = Math.random() < 0.5;
    const dir = fromNorth ? -1 : 1;
    const z = fromNorth ? CFG.SPAN_HALF - 6 : -CFG.SPAN_HALF + 6;
    if (!bridge.sectionAtZ(z)) return;
    const mesh = makeCar();
    const lane = lanes[(Math.random() * lanes.length) | 0];
    const car = {
      mesh,
      x: lane,
      y: CFG.DECK_Y + 0.55,
      z,
      dir,
      speed: CFG.CAR_SPEED * (0.85 + Math.random() * 0.35),
      dead: false,
      falling: false,
      fallT: 0,
      kind: mesh.userData.kind,
    };
    mesh.position.set(car.x, car.y, car.z);
    mesh.rotation.y = dir > 0 ? 0 : Math.PI;
    cars.push(car);
  }

  function explode(car, vel, fx, onKill) {
    if (car.dead) return;
    car.dead = true;
    car.mesh.visible = false;
    const pos = car.mesh.position.clone();
    fx.explode(pos, car.kind === "cyber" ? 1.35 : 1.05, true);
    fx.fireAt(pos, 3.5);
    const bits = car.kind === "cyber" ? 7 : 6;
    for (let i = 0; i < bits; i++) {
      const mesh = fx.boxDebris(
        {
          x: 0.6 + Math.random() * 1.4,
          y: 0.25 + Math.random() * 0.5,
          z: 0.7 + Math.random() * 1.6,
        },
        car.kind === "cyber" ? 0xc5c8cc : PAINT[i % PAINT.length]
      );
      const v = (vel || new THREE.Vector3()).clone();
      v.x += (Math.random() - 0.5) * 22;
      v.y += 14 + Math.random() * 18;
      v.z += (Math.random() - 0.5) * 16;
      if (Math.abs(v.x) < 8) v.x += (car.x >= 0 ? 1 : -1) * (12 + Math.random() * 10);
      fx.addDebris(
        mesh,
        pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 1, (Math.random() - 0.5) * 2)),
        v,
        new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
      );
    }
    onKill?.(car);
  }

  function killOnSection(sec, fx, onKill) {
    for (const car of cars) {
      if (car.dead) continue;
      if (Math.abs(car.z - sec.zCenter) <= sec.zLen * 0.55 + 1.2) {
        explode(
          car,
          new THREE.Vector3((Math.random() - 0.5) * 10, 20, (Math.random() - 0.5) * 8),
          fx,
          onKill
        );
      }
    }
  }

  function hitBall(ballPos, ballVel, radius, fx, onKill) {
    const r2 = (radius + 2.2) * (radius + 2.2);
    for (const car of cars) {
      if (car.dead) continue;
      const dx = car.mesh.position.x - ballPos.x;
      const dy = car.mesh.position.y - ballPos.y;
      const dz = car.mesh.position.z - ballPos.z;
      if (dx * dx + dy * dy + dz * dz < r2) {
        const vel = ballVel.clone().multiplyScalar(1.25);
        vel.y += 16;
        explode(car, vel, fx, onKill);
      }
    }
  }

  function update(dt, fx, onKill) {
    spawnCd -= dt;
    if (spawnCd <= 0) {
      spawn();
      spawnCd = 0.9 + Math.random() * 1.4;
    }
    for (const car of cars) {
      if (car.dead) continue;
      if (car.falling) {
        car.fallT += dt;
        car.y -= 22 * dt;
        car.z += car.dir * car.speed * 0.25 * dt;
        car.mesh.position.set(car.x, car.y, car.z);
        car.mesh.rotation.x += dt * 2.4 * car.dir;
        car.mesh.rotation.z += dt * 1.6;
        if (car.y < CFG.DECK_Y - 4 || car.fallT > 0.55) {
          explode(car, new THREE.Vector3((car.x >= 0 ? 1 : -1) * 8, 8, 0), fx, onKill);
        }
        continue;
      }
      car.z += car.dir * car.speed * dt;
      const sec = bridge.sectionAtZ(car.z);
      if (!sec) {
        car.falling = true;
        car.fallT = 0;
        continue;
      }
      car.y = CFG.DECK_Y + 0.55;
      car.mesh.position.set(car.x, car.y, car.z);
      if (Math.abs(car.z) > CFG.SPAN_HALF + 8) {
        car.dead = true;
        car.mesh.visible = false;
      }
    }
  }

  function reset() {
    for (const c of cars) {
      scene.remove(c.mesh);
      c.mesh.traverse((o) => o.geometry?.dispose?.());
    }
    cars.length = 0;
    spawnCd = 0.4;
  }

  return {
    cars,
    update,
    hitBall,
    killOnSection,
    explode,
    reset,
    spawn,
  };
}
