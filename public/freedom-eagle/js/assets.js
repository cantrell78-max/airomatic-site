import { ASSET_PATHS } from "./config.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load " + src));
    img.src = src;
  });
}

function flatten(obj, out = []) {
  if (typeof obj === "string") out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((v) => flatten(v, out));
  else if (obj && typeof obj === "object") Object.values(obj).forEach((v) => flatten(v, out));
  return out;
}

export async function loadAssets() {
  const paths = flatten(ASSET_PATHS);
  const unique = [...new Set(paths)];
  const map = {};
  await Promise.all(
    unique.map(async (p) => {
      map[p] = await loadImage(p);
    })
  );
  const img = (p) => map[p];
  return {
    heroIdle: img(ASSET_PATHS.heroIdle),
    heroShoot: ASSET_PATHS.heroShoot.map(img),
    plane: img(ASSET_PATHS.plane),
    eagle: ASSET_PATHS.eagle.map(img),
    flag: ASSET_PATHS.flag.map(img),
    firework: ASSET_PATHS.firework.map(img),
    liberty: img(ASSET_PATHS.liberty),
    towerNorth: img(ASSET_PATHS.towerNorth),
    towerSouth: img(ASSET_PATHS.towerSouth),
    towerNorthDmg: img(ASSET_PATHS.towerNorthDmg),
    towerSouthDmg: img(ASSET_PATHS.towerSouthDmg),
    sky: img(ASSET_PATHS.sky),
    manhattan: img(ASSET_PATHS.manhattan),
  };
}
