/**
 * Generate public/og-image.jpg (1200×630) for Open Graph / Twitter Cards.
 *
 * Usage:
 *   npm run brand:og-image
 *   npm run brand:og-image -- /path/to/source.png
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { statSync, existsSync } from 'node:fs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/og-image.jpg');

const WIDTH = 1200;
const HEIGHT = 630;

const defaultSources = [
  path.join(root, 'public/images/brand/og-source.png'),
  '/mnt/c/Users/cantr/Downloads/Copilot_20260606_154530.png',
];

const src =
  process.argv[2] ??
  defaultSources.find((candidate) => existsSync(candidate));

if (!src) {
  console.error('No source image found. Pass a path: npm run brand:og-image -- ./source.png');
  process.exit(1);
}

// Fit the full artwork inside 1200×630 with black padding (preserves logo + wordmark).
await sharp(src)
  .resize(WIDTH, HEIGHT, {
    fit: 'contain',
    position: 'centre',
    background: { r: 0, g: 0, b: 0 },
  })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(out);

const meta = await sharp(out).metadata();
const bytes = statSync(out).size;
console.log(`Source: ${src}`);
console.log(`Wrote ${out} (${meta.width}×${meta.height}, ${Math.round(bytes / 1024)} KB)`);