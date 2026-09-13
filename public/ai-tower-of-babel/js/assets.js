import { ASSET_PATHS } from "./config.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load " + src));
    img.src = src;
  });
}

export async function loadAssets() {
  const entries = Object.entries(ASSET_PATHS);
  const map = {};
  await Promise.all(
    entries.map(async ([k, p]) => {
      map[k] = await loadImage(p);
    })
  );
  return {
    ...map,
    floors: { a: map.floorA, b: map.floorB, c: map.floorC, d: map.floorD },
  };
}
