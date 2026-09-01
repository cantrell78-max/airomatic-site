import * as THREE from "three";
import { CFG } from "./config.js";

function heightNoise(x, z) {
  return (
    Math.sin(x * 0.018) * Math.cos(z * 0.014) * 18 +
    Math.sin(x * 0.04 + z * 0.03) * 8 +
    Math.sin(x * 0.09) * 3
  );
}

function makeTerrain({ w, d, sx, sz, ox, oz, hFn, color, map }) {
  const geo = new THREE.PlaneGeometry(w, d, sx, sz);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + ox;
    const z = pos.getZ(i) + oz;
    pos.setY(i, hFn(x, z));
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color,
    map: map || null,
    roughness: 0.92,
    metalness: 0.02,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(ox, 0, oz);
  mesh.receiveShadow = true;
  return mesh;
}

function makeSky() {
  const geo = new THREE.SphereGeometry(1400, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(CFG.SKY_TOP) },
      mid: { value: new THREE.Color(CFG.SKY_MID) },
      bot: { value: new THREE.Color(CFG.SKY_BOT) },
    },
    vertexShader: `
      varying vec3 vP;
      void main() {
        vP = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vP;
      uniform vec3 top;
      uniform vec3 mid;
      uniform vec3 bot;
      void main() {
        float h = normalize(vP).y;
        vec3 c = mix(bot, mid, smoothstep(-0.25, 0.12, h));
        c = mix(c, top, smoothstep(0.08, 0.72, h));
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeWater() {
  const geo = new THREE.PlaneGeometry(1600, 1600, 72, 72);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: CFG.WATER_DEEP,
    roughness: 0.18,
    metalness: 0.35,
    transparent: true,
    opacity: 0.94,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float w1 = sin(transformed.x * 0.055 + uTime * 0.65) * 0.32;
       float w2 = sin(transformed.z * 0.07 + uTime * 0.5) * 0.26;
       float w3 = sin((transformed.x + transformed.z) * 0.12 + uTime * 1.05) * 0.1;
       transformed.y += w1 + w2 + w3;`
    );
    mat.userData.shader = shader;
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.position.y = CFG.WATER_Y;
  return mesh;
}

function makeCity(textures) {
  const g = new THREE.Group();
  const win = textures.windows;
  for (let i = 0; i < 42; i++) {
    const h = 8 + Math.random() * 28 + (Math.random() > 0.85 ? 22 : 0);
    const w = 4 + Math.random() * 7;
    const d = 4 + Math.random() * 7;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2a3340,
      roughness: 0.7,
      metalness: 0.2,
      emissive: 0x221808,
      emissiveMap: win,
      emissiveIntensity: 0.9,
    });
    const m = new THREE.Mesh(geo, mat);
    const x = (Math.random() - 0.5) * 140;
    const z = -CFG.SPAN_HALF - 70 - Math.random() * 90;
    m.position.set(x, h * 0.5 - 2, z);
    g.add(m);
  }
  const trans = new THREE.Mesh(
    new THREE.BoxGeometry(8, 48, 8),
    new THREE.MeshStandardMaterial({
      color: 0x8899aa,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x334455,
      emissiveIntensity: 0.3,
    })
  );
  trans.position.set(-18, 22, -CFG.SPAN_HALF - 95);
  g.add(trans);
  return g;
}

function makeIsland(x, z, r, h, color) {
  const geo = new THREE.ConeGeometry(r, h, 7);
  geo.translate(0, h * 0.3, 0);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 0, z);
  m.rotation.y = Math.random() * 3;
  m.castShadow = true;
  return m;
}

function makeAlcatraz() {
  const g = new THREE.Group();
  g.add(makeIsland(210, -30, 18, 9, 0x6a6558));
  const keep = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4.5, 5),
    new THREE.MeshStandardMaterial({ color: 0xcfc8b8, roughness: 0.8 })
  );
  keep.position.set(210, 5.5, -30);
  g.add(keep);
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 6, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xb8b0a0 })
  );
  tower.position.set(206, 8, -28);
  g.add(tower);
  return g;
}

export function createWorld(canvas, textures) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CFG.FOG);
  scene.fog = new THREE.FogExp2(CFG.FOG, 0.00215);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.4,
    2500
  );
  camera.position.set(90, 38, 40);

  scene.add(makeSky());

  const hemi = new THREE.HemisphereLight(0xb8c8d8, 0x3a4030, 0.85);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd2a4, 2.15);
  sun.position.set(-160, 130, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 520;
  sun.shadow.camera.left = -220;
  sun.shadow.camera.right = 220;
  sun.shadow.camera.top = 180;
  sun.shadow.camera.bottom = -180;
  sun.shadow.bias = -0.0003;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x6a7a88, 0.28));

  const water = makeWater();
  scene.add(water);

  const marin = makeTerrain({
    w: 420,
    d: 220,
    sx: 28,
    sz: 18,
    ox: 10,
    oz: CFG.SPAN_HALF + 90,
    hFn: (x, z) => 6 + Math.max(0, heightNoise(x, z) + (z - CFG.SPAN_HALF) * 0.08),
    color: 0x5a6a40,
    map: textures.hill,
  });
  scene.add(marin);

  const sfHills = makeTerrain({
    w: 380,
    d: 180,
    sx: 24,
    sz: 16,
    ox: 0,
    oz: -CFG.SPAN_HALF - 80,
    hFn: (x, z) =>
      4 + Math.max(0, heightNoise(x * 1.1, z) * 0.7 + (-z - CFG.SPAN_HALF) * 0.04),
    color: 0x4e5c3c,
    map: textures.hill,
  });
  scene.add(sfHills);

  const eastBay = makeTerrain({
    w: 180,
    d: 500,
    sx: 10,
    sz: 18,
    ox: 340,
    oz: 0,
    hFn: (x, z) => 2 + Math.max(0, (x - 280) * 0.12 + heightNoise(x, z) * 0.4),
    color: 0x4a5840,
    map: textures.hill,
  });
  scene.add(eastBay);

  scene.add(makeCity(textures));
  scene.add(makeAlcatraz());
  scene.add(makeIsland(-70, CFG.SPAN_HALF + 20, 14, 16, 0x5a5344));
  scene.add(makeIsland(55, -CFG.SPAN_HALF - 8, 10, 12, 0x6a5a48));

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(18, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffc48a, fog: false })
  );
  sunDisc.position.set(-420, 90, 80);
  scene.add(sunDisc);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", resize);

  function update(t) {
    const sh = water.material.userData.shader;
    if (sh) sh.uniforms.uTime.value = t;
  }

  function render() {
    renderer.render(scene, camera);
  }

  return { scene, camera, renderer, water, sun, update, render, resize };
}
