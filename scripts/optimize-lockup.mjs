/**
 * Full header lockup from concepts/01-logo.png (ai mark + airomatic.ai text).
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src =
  process.argv[2] ??
  path.join(root, "public/images/brand/concepts/01-logo.png");
const out = path.join(root, "public/images/brand/logo-lockup.webp");

const HEADER_BG = { r: 6, g: 7, b: 11 };

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function isBackgroundPixel(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const isContent = lum > 42 && (g > r - 10 || b > r - 5 || (r > 130 && g > 100));
  if (isContent) return false;
  if (lum < 24) return true;
  return colorDistance(r, g, b, HEADER_BG.r, HEADER_BG.g, HEADER_BG.b) < 35;
}

const trimmed = await sharp(src).trim({ threshold: 10 }).toBuffer();
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

await sharp(outBuf, { raw: { width, height, channels } })
  .flatten({ background: HEADER_BG })
  .resize({ height: 64, withoutEnlargement: false })
  .webp({ quality: 92 })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(`Wrote ${out} (${meta.width}×${meta.height})`);