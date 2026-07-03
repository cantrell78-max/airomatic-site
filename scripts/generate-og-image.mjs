/**
 * Generate public/og-image.jpg (1200×630) for Open Graph / Twitter Cards.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, statSync } from 'node:fs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/og-image.jpg');
const logoPath = path.join(root, 'public/images/brand/logo-lockup.webp');

const WIDTH = 1200;
const HEIGHT = 630;
const TAGLINE = 'AI That Smells Success';

const backgroundSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cosmos" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#1a1530"/>
      <stop offset="45%" stop-color="#0c0e14"/>
      <stop offset="100%" stop-color="#06070b"/>
    </radialGradient>
    <radialGradient id="glow" cx="78%" cy="22%" r="40%">
      <stop offset="0%" stop-color="#8b7cf8" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#8b7cf8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="18%" cy="78%" r="35%">
      <stop offset="0%" stop-color="#3ee0d0" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#3ee0d0" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#8b7cf8" stroke-width="0.5" opacity="0.12"/>
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.2"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#cosmos)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect width="100%" height="100%" fill="url(#glow2)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>

  <!-- Sacred geometry: seed of life / flower of life -->
  <g transform="translate(900 310)" fill="none" stroke="#8b7cf8" stroke-width="1.2" opacity="0.28">
    <circle cx="0" cy="0" r="72"/>
    <circle cx="72" cy="0" r="72"/>
    <circle cx="36" cy="62.35" r="72"/>
    <circle cx="-36" cy="62.35" r="72"/>
    <circle cx="-72" cy="0" r="72"/>
    <circle cx="-36" cy="-62.35" r="72"/>
    <circle cx="36" cy="-62.35" r="72"/>
  </g>

  <!-- Metatron-style axes -->
  <g stroke="#5c4fd4" stroke-width="0.8" opacity="0.2" fill="none">
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <polygon points="600,120 720,315 600,510 480,315"/>
    <circle cx="600" cy="315" r="180" stroke-dasharray="6 10"/>
  </g>

  <!-- Neural nodes (matches site schematic) -->
  <g stroke="#8b7cf8" stroke-width="1" opacity="0.35" fill="#8b7cf8">
    <circle cx="140" cy="480" r="5" opacity="0.5"/>
    <circle cx="280" cy="380" r="5" opacity="0.5"/>
    <circle cx="420" cy="460" r="5" opacity="0.5"/>
    <line x1="140" y1="480" x2="280" y2="380"/>
    <line x1="280" y1="380" x2="420" y2="460"/>
  </g>

  <!-- Accent frame -->
  <rect x="32" y="32" width="1136" height="566" fill="none" stroke="#8b7cf8" stroke-width="1" opacity="0.18" rx="4"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#3ee0d0" stroke-width="0.5" opacity="0.1" rx="2"/>

  <!-- Tagline -->
  <text x="80" y="520" fill="#e8ecf4" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-style="italic" letter-spacing="0.5">
    ${TAGLINE}
  </text>
  <text x="80" y="560" fill="#8b93a8" font-family="Consolas, monospace" font-size="18" letter-spacing="3">
    AIROMATIC.AI
  </text>

  <!-- Corner label -->
  <text x="80" y="88" fill="#8b7cf8" font-family="Consolas, monospace" font-size="13" letter-spacing="4" opacity="0.7">
    OPEN GRAPH · 1200×630
  </text>
</svg>
`;

const background = await sharp(Buffer.from(backgroundSvg)).png().toBuffer();

const logo = await sharp(readFileSync(logoPath))
  .resize({ height: 140, withoutEnlargement: false })
  .png()
  .toBuffer();

const logoMeta = await sharp(logo).metadata();

await sharp(background)
  .composite([
    {
      input: logo,
      left: 80,
      top: Math.round(HEIGHT / 2 - (logoMeta.height ?? 140) / 2 - 40),
    },
  ])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(out);

const meta = await sharp(out).metadata();
const bytes = statSync(out).size;
console.log(`Wrote ${out} (${meta.width}×${meta.height}, ${Math.round(bytes / 1024)} KB)`);