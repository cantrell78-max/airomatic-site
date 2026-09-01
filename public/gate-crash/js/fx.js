import * as THREE from "three";
import { CFG } from "./config.js";

function spriteMat(map, additive = false) {
  return new THREE.SpriteMaterial({
    map,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    opacity: 1,
  });
}

export function createFX(scene, textures) {
  const fireMat = spriteMat(textures.fire, true);
  const smokeMat = spriteMat(textures.smoke, false);
  const sparkMat = spriteMat(textures.spark, true);
  const foamMat = spriteMat(textures.foam, false);

  const particles = [];
  const debris = [];
  const fires = [];
  const lights = [];
  const shockwaves = [];

  let shake = 0;
  const tmp = new THREE.Vector3();

  function spawnSprite(mat, pos, size, life, vel, grow = 0) {
    const s = new THREE.Sprite(mat.clone());
    s.position.copy(pos);
    s.scale.set(size, size, 1);
    scene.add(s);
    particles.push({
      mesh: s,
      vel: vel.clone(),
      life,
      max: life,
      grow,
      size,
    });
  }

  function explode(pos, power = 1, tesla = false) {
    const p = Math.max(0.4, power);
    shake = Math.min(2.2, shake + 0.35 * p);
    const nFire = Math.floor(10 * p);
    const nSmoke = Math.floor(8 * p);
    const nSpark = Math.floor(16 * p);
    for (let i = 0; i < nFire; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 14 * p,
        6 + Math.random() * 12 * p,
        (Math.random() - 0.5) * 14 * p
      );
      spawnSprite(fireMat, pos, 3 + Math.random() * 4 * p, 0.45 + Math.random() * 0.4, v, 6);
    }
    for (let i = 0; i < nSmoke; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        3 + Math.random() * 6,
        (Math.random() - 0.5) * 6
      );
      spawnSprite(smokeMat, pos.clone().setY(pos.y + 1), 4 + Math.random() * 5, 1.2 + Math.random(), v, 8);
    }
    for (let i = 0; i < nSpark; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 28 * p,
        Math.random() * 22 * p,
        (Math.random() - 0.5) * 28 * p
      );
      spawnSprite(sparkMat, pos, 0.6 + Math.random() * 0.8, 0.35 + Math.random() * 0.3, v, 0);
    }
    const light = new THREE.PointLight(tesla ? 0xffeeaa : 0xff6a22, 40 * p, 60);
    light.position.copy(pos);
    scene.add(light);
    lights.push({ light, life: 0.45 * p });

    const ringGeo = new THREE.RingGeometry(0.4, 1.1, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: tesla ? 0xffe8a0 : 0xff7020,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(pos);
    scene.add(ring);
    shockwaves.push({ mesh: ring, life: 0.45, max: 0.45, scale: 2 + p * 4 });
  }

  function fireAt(pos, duration = 4) {
    const s = new THREE.Sprite(fireMat.clone());
    s.position.copy(pos);
    s.position.y += 1.2;
    s.scale.set(5, 6, 1);
    scene.add(s);
    const sm = new THREE.Sprite(smokeMat.clone());
    sm.position.copy(pos);
    sm.position.y += 2.4;
    sm.scale.set(4, 4, 1);
    scene.add(sm);
    const light = new THREE.PointLight(0xff5510, 8, 28);
    light.position.copy(pos);
    light.position.y += 2;
    scene.add(light);
    fires.push({ fire: s, smoke: sm, light, life: duration, t: 0 });
  }

  function splash(pos, power = 1) {
    const p = pos.clone();
    p.y = 0.4;
    for (let i = 0; i < 10 * power; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        6 + Math.random() * 10 * power,
        (Math.random() - 0.5) * 10
      );
      spawnSprite(foamMat, p, 1.5 + Math.random() * 2, 0.5 + Math.random() * 0.4, v, 2);
    }
  }

  function addDebris(mesh, pos, vel, angVel) {
    while (debris.length >= CFG.MAX_DEBRIS) {
      const old = debris.shift();
      scene.remove(old.mesh);
      old.mesh.geometry?.dispose?.();
    }
    mesh.position.copy(pos);
    scene.add(mesh);
    debris.push({
      mesh,
      vel: vel.clone(),
      ang: angVel.clone(),
      splashed: false,
      age: 0,
    });
  }

  function boxDebris(size, color, map) {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({
      color,
      map: map || null,
      metalness: 0.4,
      roughness: 0.6,
    });
    return new THREE.Mesh(geo, mat);
  }

  function update(dt) {
    shake = Math.max(0, shake - dt * 2.4);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.vel.y -= 8 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      const k = Math.max(0, p.life / p.max);
      p.mesh.material.opacity = k;
      const sz = p.size + p.grow * (1 - k);
      p.mesh.scale.set(sz, sz, 1);
      if (p.life <= 0) {
        scene.remove(p.mesh);
        p.mesh.material.dispose();
        particles.splice(i, 1);
      }
    }

    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      f.t += dt;
      f.life -= dt;
      const flicker = 0.85 + Math.sin(f.t * 18) * 0.15;
      f.fire.scale.set(5 * flicker, 6 * flicker, 1);
      f.fire.material.rotation += dt * 2;
      f.smoke.position.y += dt * 1.4;
      f.light.intensity = 7 * flicker;
      if (f.life <= 0) {
        scene.remove(f.fire, f.smoke, f.light);
        fires.splice(i, 1);
      }
    }

    for (let i = lights.length - 1; i >= 0; i--) {
      const l = lights[i];
      l.life -= dt;
      l.light.intensity = Math.max(0, l.light.intensity * (1 - dt * 6));
      if (l.life <= 0) {
        scene.remove(l.light);
        lights.splice(i, 1);
      }
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const s = shockwaves[i];
      s.life -= dt;
      const k = 1 - s.life / s.max;
      s.mesh.scale.setScalar(1 + k * s.scale);
      s.mesh.material.opacity = 0.7 * (1 - k);
      if (s.life <= 0) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        shockwaves.splice(i, 1);
      }
    }

    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i];
      d.age += dt;
      d.vel.y -= CFG.GRAVITY * dt;
      d.vel.multiplyScalar(1 - 0.12 * dt);
      d.mesh.position.addScaledVector(d.vel, dt);
      d.mesh.rotation.x += d.ang.x * dt;
      d.mesh.rotation.y += d.ang.y * dt;
      d.mesh.rotation.z += d.ang.z * dt;
      if (d.mesh.position.y < 0.6) {
        if (!d.splashed) {
          d.splashed = true;
          splash(d.mesh.position, 0.6);
        }
        const sub = Math.min(1, (0.6 - d.mesh.position.y) / 4);
        d.vel.y += 48 * sub * dt;
        d.vel.multiplyScalar(0.96);
        d.ang.multiplyScalar(0.96);
        if (d.mesh.position.y < -10 || d.age > 8) {
          scene.remove(d.mesh);
          d.mesh.geometry?.dispose?.();
          debris.splice(i, 1);
        }
      }
    }
  }

  function applyShake(camera) {
    if (shake <= 0) return;
    tmp.set(
      (Math.random() - 0.5) * shake * 1.4,
      (Math.random() - 0.5) * shake * 0.8,
      (Math.random() - 0.5) * shake * 1.4
    );
    camera.position.add(tmp);
  }

  function clear() {
    for (const p of particles) {
      scene.remove(p.mesh);
      p.mesh.material.dispose();
    }
    particles.length = 0;
    for (const d of debris) {
      scene.remove(d.mesh);
    }
    debris.length = 0;
    for (const f of fires) scene.remove(f.fire, f.smoke, f.light);
    fires.length = 0;
    for (const l of lights) scene.remove(l.light);
    lights.length = 0;
    for (const s of shockwaves) {
      scene.remove(s.mesh);
      s.mesh.geometry.dispose();
    }
    shockwaves.length = 0;
    shake = 0;
  }

  return {
    explode,
    fireAt,
    splash,
    addDebris,
    boxDebris,
    update,
    applyShake,
    clear,
    get shake() {
      return shake;
    },
  };
}

export function flashScreen(el, amount = 0.35) {
  if (!el) return;
  el.style.opacity = String(amount);
  requestAnimationFrame(() => {
    el.style.transition = "opacity 0.35s ease-out";
    el.style.opacity = "0";
    setTimeout(() => {
      el.style.transition = "none";
    }, 360);
  });
}
