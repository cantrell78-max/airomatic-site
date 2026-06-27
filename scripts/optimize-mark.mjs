/**
 * Header logo mark from concepts/02-mark.png (smoke, no text):
 * trim white, keep upper swirl, export transparent webp + favicon png.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src =
  process.argv[2] ??
  path.join(root, "public/images/brand/concepts/02-mark.png");
const outMark = path.join(root, "public/images/brand/logo-mark.webp");
const outFavicon = path.join(root, "public/images/brand/favicon-192.png");

/** Matches --bg / header in global.css */
const HEADER_BG = { r: 6, g: 7, b: 11 };

function isWhiteBg(r, g, b, a) {
  if (a < 20) return true;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 235 && Math.max(r, g, b) - Math.min(r, g, b) < 30;
}

const trimmed = await sharp(src).trim({ threshold: 12 }).toBuffer();
const trimmedMeta = await sharp(trimmed).metadata();
const topHeight = Math.floor(trimmedMeta.height * 0.52);

const cropped = await sharp(trimmed)
  .extract({
    left: 0,
    top: 0,
    width: trimmedMeta.width,
    height: topHeight,
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
    const a = channels === 4 ? data[i + 3] : 255;
    if (isWhiteBg(r, g, b, a)) {
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