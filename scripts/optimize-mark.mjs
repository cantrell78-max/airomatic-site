/**
 * Header logo mark + favicon from concepts/01-logo.png (ai monogram).
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src =
  process.argv[2] ??
  path.join(root, "public/images/brand/concepts/01-logo.png");
const outMark = path.join(root, "public/images/brand/logo-mark.webp");
const outFavicon = path.join(root, "public/images/brand/favicon-192.png");

/** Matches --bg / header in global.css */
const HEADER_BG = { r: 6, g: 7, b: 11 };

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function isBackgroundPixel(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const isGraphic = lum > 45 && (g > r - 5 || b > r);
  const isSparkle = lum > 185;
  if (isGraphic || isSparkle) return false;
  if (lum < 24) return true;
  if (colorDistance(r, g, b, HEADER_BG.r, HEADER_BG.g, HEADER_BG.b) < 35) return true;
  return lum < 40;
}

const trimmed = await sharp(src).trim({ threshold: 10 }).toBuffer();
const trimmedMeta = await sharp(trimmed).metadata();
const markHeight = Math.floor(trimmedMeta.height * 0.62);

const cropped = await sharp(trimmed)
  .extract({
    left: 0,
    top: 0,
    width: trimmedMeta.width,
    height: markHeight,
  })
  .toBuffer();

const { data, info } = await sharp(cropped)
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

const markPipeline = sharp(outBuf, { raw: { width, height, channels } })
  .flatten({ background: HEADER_BG })
  .resize({ height: 96, withoutEnlargement: false });

await markPipeline.clone().webp({ quality: 92 }).toFile(outMark);

await markPipeline
  .clone()
  .resize(192, 192, { fit: "contain", background: { r: 6, g: 7, b: 11, alpha: 1 } })
  .png()
  .toFile(outFavicon);

const meta = await sharp(outMark).metadata();
console.log(`Wrote ${outMark} (${meta.width}×${meta.height})`);
console.log(`Wrote ${outFavicon}`);