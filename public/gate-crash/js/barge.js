import * as THREE from "three";
import { CFG } from "./config.js";
import { clamp } from "./logic.js";

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function createBarge(scene, textures) {
  const rust = new THREE.MeshStandardMaterial({
    color: CFG.RUST,
    map: textures.rust,
    metalness: 0.35,
    roughness: 0.7,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x4a4e54,
    map: textures.iron,
    metalness: 0.6,
    roughness: 0.45,
  });
  const iron = new THREE.MeshStandardMaterial({
    color: 0x2c2e32,
    map: textures.iron,
    metalness: 0.72,
    roughness: 0.38,
  });
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0xc8b48a,
    roughness: 0.6,
    metalness: 0.15,
  });

  const group = new THREE.Group();
  scene.add(group);

  const beam = CFG.BARGE_W;
  const length = CFG.BARGE_LEN;
  const hull = box(beam, 2.4, length, rust, 0, 0.4, 0);
  const deck = box(beam - 0.5, 0.28, length - 0.6, steel, 0, 1.62, 0);
  const gunL = box(0.28, 0.55, length - 0.4, rust, -beam * 0.48, 1.85, 0);
  const gunR = box(0.28, 0.55, length - 0.4, rust, beam * 0.48, 1.85, 0);
  group.add(hull, deck, gunL, gunR);

  const cabin = box(6.2, 3.4, 7.2, cabinMat, 1.2, 3.4, -length * 0.32);
  const roof = box(6.6, 0.2, 7.5, rust, 1.2, 5.15, -length * 0.32);
  group.add(cabin, roof);
  const mast = box(0.7, 16, 0.7, steel, CFG.CRANE_X, 10, 2);
  group.add(mast);

  const nameC = document.createElement("canvas");
  nameC.width = 512;
  nameC.height = 96;
  const nctx = nameC.getContext("2d");
  nctx.fillStyle = "#6a3a28";
  nctx.fillRect(0, 0, 512, 96);
  nctx.fillStyle = "#f0e6d4";
  nctx.font = "700 56px Oswald, sans-serif";
  nctx.textAlign = "center";
  nctx.textBaseline = "middle";
  nctx.fillText("BAY HAMMER", 256, 50);
  const nameTex = new THREE.CanvasTexture(nameC);
  nameTex.colorSpace = THREE.SRGBColorSpace;
  const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: false });
  const name = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.4), nameMat);
  name.position.set(beam * 0.51, 1.1, 2);
  name.rotation.y = Math.PI / 2;
  group.add(name);
  const name2 = name.clone();
  name2.position.x = -beam * 0.51;
  name2.rotation.y = -Math.PI / 2;
  group.add(name2);

  const craneBase = box(4.4, 4.2, 4.4, steel, CFG.CRANE_X, 3.6, 2);
  group.add(craneBase);

  const crane = new THREE.Group();
  crane.position.set(CFG.CRANE_X, CFG.CRANE_Y, 2);
  group.add(crane);

  const house = box(3.4, 2.6, 3.6, cabinMat, -0.6, 1.4, 0);
  crane.add(house);

  const boom = new THREE.Group();
  crane.add(boom);
  const len = CFG.BOOM_LEN;
  boom.add(box(len, 0.28, 0.28, steel, len * 0.5, 0.15, -1.05));
  boom.add(box(len, 0.28, 0.28, steel, len * 0.5, 0.15, 1.05));
  boom.add(box(len, 0.28, 0.28, steel, len * 0.5, 1.55, -1.05));
  boom.add(box(len, 0.28, 0.28, steel, len * 0.5, 1.55, 1.05));
  for (let i = 0; i < 9; i++) {
    const x = 1.2 + i * (len / 9);
    boom.add(box(0.18, 1.6, 0.18, rust, x, 0.85, -1.05));
    boom.add(box(0.18, 1.6, 0.18, rust, x, 0.85, 1.05));
    const xbar = box(0.16, 0.16, 2.2, rust, x, 0.2, 0);
    const xbar2 = box(0.16, 0.16, 2.2, rust, x, 1.5, 0);
    boom.add(xbar, xbar2);
    const diag = box(0.14, 2.1, 0.14, rust, x, 0.85, 0);
    diag.rotation.z = 0.6;
    boom.add(diag);
  }
  boom.add(box(1.6, 0.5, 2.4, iron, len + 0.2, 0.8, 0));
  boom.rotation.z = CFG.BOOM_PITCH;

  const ball = new THREE.Mesh(new THREE.SphereGeometry(CFG.BALL_R, 28, 20), iron);
  ball.castShadow = true;
  scene.add(ball);
  for (let i = 0; i < 16; i++) {
    const riv = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), rust);
    const phi = Math.acos(2 * Math.random() - 1);
    const th = Math.random() * Math.PI * 2;
    riv.position.set(
      (CFG.BALL_R - 0.05) * Math.sin(phi) * Math.cos(th),
      (CFG.BALL_R - 0.05) * Math.cos(phi),
      (CFG.BALL_R - 0.05) * Math.sin(phi) * Math.sin(th)
    );
    ball.add(riv);
  }
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(CFG.BALL_R * 0.78, 0.16, 6, 18),
    rust
  );
  band.rotation.x = Math.PI / 2;
  ball.add(band);

  const cableGeo = new THREE.CylinderGeometry(0.11, 0.11, 1, 6);
  const cable = new THREE.Mesh(cableGeo, iron);
  scene.add(cable);

  const tipLocal = new THREE.Vector3(len + 0.3, 0.4, 0);
  const tip = new THREE.Vector3();
  const ballPos = new THREE.Vector3();
  const ballVel = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  let heading = 0;
  let omega = 0;
  let vx = 0;
  let vz = 0;
  let boomYaw = Math.PI;
  let cableLen = CFG.CABLE_DEFAULT;
  let pumpCd = 0;
  let bobT = 0;
  let x = 40;
  let z = 16;
  let splashed = false;

  function reset() {
    heading = 0;
    omega = 0;
    vx = 0;
    vz = 0;
    boomYaw = Math.PI;
    cableLen = CFG.CABLE_DEFAULT;
    pumpCd = 0;
    x = 40;
    z = 16;
    group.position.set(x, 0, z);
    group.rotation.set(0, heading, 0);
    crane.rotation.y = boomYaw;
    group.updateMatrixWorld(true);
    boom.updateWorldMatrix(true, true);
    tip.copy(tipLocal);
    boom.localToWorld(tip);
    ballPos.copy(tip);
    ballPos.y -= cableLen * 0.92;
    ballVel.set(-14, 0, 4);
    ball.position.copy(ballPos);
    splashed = false;
    syncCable();
  }

  function syncCable() {
    tmp.copy(ballPos).sub(tip);
    const dist = tmp.length() || 0.001;
    cable.position.copy(tip).addScaledVector(tmp, 0.5);
    cable.quaternion.setFromUnitVectors(up, tmp2.copy(tmp).multiplyScalar(1 / dist));
    cable.scale.set(1, dist, 1);
  }

  function applySwing() {
    tmp.copy(ballPos).sub(tip);
    const dist = tmp.length() || 1;
    tmp.multiplyScalar(1 / dist);
    tmp2.copy(ballVel).addScaledVector(tmp, -ballVel.dot(tmp));
    if (tmp2.lengthSq() < 9) {
      tmp2.set(-Math.sin(heading), 0, -Math.cos(heading));
      tmp2.cross(tmp).normalize();
      if (tmp2.lengthSq() < 0.1) tmp2.set(0, 0, 1).cross(tmp).normalize();
    } else {
      tmp2.normalize();
    }
    ballVel.addScaledVector(tmp2, CFG.SWING_IMPULSE);
    pumpCd = CFG.SWING_PUMP_CD;
  }

  function bounce(nx, ny, nz, vn) {
    if (vn < 0) {
      const rest = 1.42;
      ballVel.x -= vn * rest * nx;
      ballVel.y -= vn * rest * ny;
      ballVel.z -= vn * rest * nz;
    }
    ballPos.x += nx * 0.4;
    ballPos.y += ny * 0.4;
    ballPos.z += nz * 0.4;
  }

  function update(dt, input, fx, audio) {
    bobT += dt;
    const throttle = input.throttle();
    const steer = input.steer();
    const strafe = input.strafe();
    boomYaw += input.boom() * 1.15 * dt;
    cableLen = clamp(cableLen + input.reel() * 18 * dt, CFG.CABLE_MIN, CFG.CABLE_MAX);
    if (input.consumeSwing() && pumpCd <= 0) applySwing();
    else if (input.swingHeld() && pumpCd <= 0) applySwing();
    if (pumpCd > 0) pumpCd -= dt;

    omega += steer * CFG.BARGE_TURN * dt;
    omega *= 1 - Math.min(0.95, 2.4 * dt);
    heading += omega * dt;

    const c = Math.cos(heading);
    const s = Math.sin(heading);
    const fwdX = s;
    const fwdZ = c;
    const rightX = c;
    const rightZ = -s;
    vx += (fwdX * throttle * CFG.BARGE_ACCEL + rightX * strafe * CFG.BARGE_STRAFE) * dt;
    vz += (fwdZ * throttle * CFG.BARGE_ACCEL + rightZ * strafe * CFG.BARGE_STRAFE) * dt;
    const drag = 1 - Math.min(0.95, CFG.WATER_DRAG * dt);
    vx *= drag;
    vz *= drag;
    const spd = Math.hypot(vx, vz);
    if (spd > CFG.BARGE_MAX) {
      vx *= CFG.BARGE_MAX / spd;
      vz *= CFG.BARGE_MAX / spd;
    }
    x += vx * dt;
    z += vz * dt;
    x = clamp(x, -CFG.PLAY_X, CFG.PLAY_X);
    z = clamp(z, -CFG.PLAY_Z, CFG.PLAY_Z);

    for (const tz of [-CFG.HALF_MAIN, CFG.HALF_MAIN]) {
      const dx = x - 0;
      const dz = z - tz;
      const pierR = 14;
      const d = Math.hypot(dx, dz);
      if (d < pierR && d > 0.01) {
        const push = (pierR - d) / d;
        x += dx * push;
        z += dz * push;
        vx += dx * push * 4;
        vz += dz * push * 4;
      }
    }

    const bob = Math.sin(bobT * 1.5) * 0.14 + Math.sin(bobT * 2.3) * 0.07;
    group.position.set(x, bob, z);
    group.rotation.y = heading;
    group.rotation.z = -omega * 0.18;
    group.rotation.x = throttle * 0.03;
    crane.rotation.y = boomYaw;

    group.updateMatrixWorld(true);
    boom.updateWorldMatrix(true, true);
    tip.copy(tipLocal);
    boom.localToWorld(tip);

    ballVel.y -= CFG.GRAVITY * dt;
    ballPos.addScaledVector(ballVel, dt);

    tmp.copy(ballPos).sub(tip);
    const dist = tmp.length() || 0.0001;
    tmp.multiplyScalar(1 / dist);
    if (dist > cableLen) {
      ballPos.copy(tip).addScaledVector(tmp, cableLen);
      const vn = ballVel.dot(tmp);
      if (vn > 0) ballVel.addScaledVector(tmp, -vn);
    }
    ballVel.multiplyScalar(1 - 0.18 * dt);

    if (ballPos.y < CFG.BALL_R * 0.85) {
      const sub = (CFG.BALL_R * 0.85 - ballPos.y) / CFG.BALL_R;
      ballVel.y += 70 * sub * dt;
      ballVel.multiplyScalar(0.985);
      if (!splashed && ballVel.y < -4) {
        splashed = true;
        fx?.splash(ballPos, 1.2);
        audio?.splash(0.8);
      }
    } else {
      splashed = false;
    }

    ball.position.copy(ballPos);
    ball.rotation.x += ballVel.z * dt * 0.08;
    ball.rotation.z -= ballVel.x * dt * 0.08;
    syncCable();

    audio?.engine(Math.min(1, Math.hypot(vx, vz) / CFG.BARGE_MAX));
  }

  reset();

  return {
    group,
    ball,
    ballPos,
    ballVel,
    get ballRadius() {
      return CFG.BALL_R;
    },
    get heading() {
      return heading;
    },
    get x() {
      return x;
    },
    get z() {
      return z;
    },
    get speed() {
      return Math.hypot(vx, vz);
    },
    tip,
    update,
    reset,
    bounce,
    applySwing,
  };
}
