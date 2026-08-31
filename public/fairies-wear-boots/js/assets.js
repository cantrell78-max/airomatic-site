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
    fairy: {
      idle: img(ASSET_PATHS.fairy.idle),
      jump: img(ASSET_PATHS.fairy.jump),
      stomp: img(ASSET_PATHS.fairy.stomp),
      dance: img(ASSET_PATHS.fairy.dance),
      walk: ASSET_PATHS.fairy.walk.map(img),
    },
    punk: img(ASSET_PATHS.punk),
    bottle: img(ASSET_PATHS.bottle),
    dwarf: img(ASSET_PATHS.dwarf),
    dwarfB: img(ASSET_PATHS.dwarfB),
    bigFairy: img(ASSET_PATHS.bigFairy),
    orb: img(ASSET_PATHS.orb),
    lamp: img(ASSET_PATHS.lamp),
    fence: img(ASSET_PATHS.fence),
    mushroom: img(ASSET_PATHS.mushroom),
    window: img(ASSET_PATHS.window),
    cobble: img(ASSET_PATHS.cobble),
    brick: img(ASSET_PATHS.brick),
    wet: img(ASSET_PATHS.wet),
    tripWall: img(ASSET_PATHS.tripWall),
    street: img(ASSET_PATHS.street),
  };
}
