import * as THREE from "three";

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

function texFrom(c, repeat = 1) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

function noise(ctx, w, h, alpha = 40) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * alpha;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

export function makeTextures() {
  const [asphaltC, a] = canvas(256, 256);
  a.fillStyle = "#2a2c31";
  a.fillRect(0, 0, 256, 256);
  noise(a, 256, 256, 28);
  a.fillStyle = "#d8c44a";
  a.fillRect(124, 0, 3, 256);
  a.fillRect(130, 0, 3, 256);
  a.fillStyle = "#c8cdd2";
  a.fillRect(18, 0, 4, 256);
  a.fillRect(234, 0, 4, 256);
  for (let y = 0; y < 256; y += 28) {
    a.fillStyle = "#c8cdd2";
    a.fillRect(70, y, 4, 16);
    a.fillRect(182, y, 4, 16);
  }

  const [rustC, r] = canvas(256, 256);
  r.fillStyle = "#5a3224";
  r.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i++) {
    r.fillStyle = `rgba(${90 + Math.random() * 80},${40 + Math.random() * 30},${20},0.4)`;
    r.beginPath();
    r.arc(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 28, 0, 6.3);
    r.fill();
  }
  noise(r, 256, 256, 36);

  const [ironC, i] = canvas(128, 128);
  i.fillStyle = "#3a3c40";
  i.fillRect(0, 0, 128, 128);
  noise(i, 128, 128, 22);

  const [winC, w] = canvas(64, 64);
  w.fillStyle = "#0a1018";
  w.fillRect(0, 0, 64, 64);
  for (let y = 4; y < 64; y += 10) {
    for (let x = 4; x < 64; x += 8) {
      if (Math.random() > 0.35) {
        w.fillStyle = Math.random() > 0.7 ? "#ffd090" : "#c8e4ff";
        w.fillRect(x, y, 5, 6);
      }
    }
  }

  const [fireC, f] = canvas(64, 64);
  const fg = f.createRadialGradient(32, 38, 2, 32, 30, 30);
  fg.addColorStop(0, "rgba(255,250,210,1)");
  fg.addColorStop(0.18, "rgba(255,180,40,0.95)");
  fg.addColorStop(0.45, "rgba(255,70,10,0.55)");
  fg.addColorStop(1, "rgba(40,0,0,0)");
  f.fillStyle = fg;
  f.fillRect(0, 0, 64, 64);

  const [smokeC, s] = canvas(64, 64);
  const sg = s.createRadialGradient(32, 32, 4, 32, 32, 30);
  sg.addColorStop(0, "rgba(60,58,54,0.55)");
  sg.addColorStop(1, "rgba(20,20,20,0)");
  s.fillStyle = sg;
  s.fillRect(0, 0, 64, 64);

  const [sparkC, k] = canvas(32, 32);
  const kg = k.createRadialGradient(16, 16, 0, 16, 16, 16);
  kg.addColorStop(0, "rgba(255,240,180,1)");
  kg.addColorStop(0.4, "rgba(255,140,40,0.8)");
  kg.addColorStop(1, "rgba(0,0,0,0)");
  k.fillStyle = kg;
  k.fillRect(0, 0, 32, 32);

  const [foamC, o] = canvas(64, 64);
  const og = o.createRadialGradient(32, 32, 2, 32, 32, 30);
  og.addColorStop(0, "rgba(230,240,245,0.85)");
  og.addColorStop(1, "rgba(180,200,210,0)");
  o.fillStyle = og;
  o.fillRect(0, 0, 64, 64);

  const [hillC, h] = canvas(256, 256);
  h.fillStyle = "#4a5a3a";
  h.fillRect(0, 0, 256, 256);
  for (let n = 0; n < 40; n++) {
    h.fillStyle = `rgba(${50 + Math.random() * 40},${70 + Math.random() * 40},${30},0.35)`;
    h.fillRect(Math.random() * 256, Math.random() * 256, 40, 18);
  }
  noise(h, 256, 256, 24);

  return {
    asphalt: texFrom(asphaltC, 1),
    rust: texFrom(rustC, 4),
    iron: texFrom(ironC, 2),
    windows: texFrom(winC, 4),
    fire: texFrom(fireC, 1),
    smoke: texFrom(smokeC, 1),
    spark: texFrom(sparkC, 1),
    foam: texFrom(foamC, 1),
    hill: texFrom(hillC, 8),
  };
}
