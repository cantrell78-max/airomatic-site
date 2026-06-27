/**
 * Header wordmark from concepts/01-wordmark.jpg:
 * trim, match site header bg, export webp.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src =
  process.argv[2] ??
  path.join(root, "public/images/brand/concepts/01-wordmark.jpg");
const out = path.join(root, "public/images/brand/wordmark.webp");

/** Matches --bg / header in global.css */
const HEADER_BG = { r: 6, g: 7, b: 11 };

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function isBackgroundPixel(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const isGoldText = r > 140 && g > 110 && b < 120 && lum > 120;
  const isTealSmoke = g > r + 10 && g > b + 5 && lum > 55;
  const isBrightSparkle = lum > 200 && Math.max(r, g, b) - Math.min(r, g, b) > 25;
  if (isGoldText || isTealSmoke || isBrightSparkle) return false;
  if (lum < 48) return true;
  if (colorDistance(r, g, b, HEADER_BG.r, HEADER_BG.g, HEADER_BG.b) < 42) return true;
  return lum < 65 && Math.max(r, g, b) - Math.min(r, g, b) < 22;
}

const trimmed = await sharp(src).trim({ threshold: 18 }).toBuffer();
const { data, info } = await sharp(trimmed)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const outBuf = Buffer.from(data);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isBackgroundPixel(r, g, b)) {
      outBuf[i] = HEADER_BG.r;
      outBuf[i + 1] = HEADER_BG.g;
      outBuf[i + 2] = HEADER_BG.b;
      if (channels === 4) outBuf[i + 3] = 255;
    }
  }
}

/** Tight crop around the centered wordmark text */
const bandTop = Math.floor(height * 0.36);
const bandHeight = Math.floor(height * 0.2);

await sharp(outBuf, { raw: { width, height, channels } })
  .extract({ left: 0, top: bandTop, width, height: bandHeight })
  .flatten({ background: HEADER_BG })
  .resize({ width: 520, withoutEnlargement: false })
  .webp({ quality: 90 })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(`Wrote ${out} (${meta.width}×${meta.height})`);