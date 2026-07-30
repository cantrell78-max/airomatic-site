/**
 * Build Open Graph image for /startups/ from the newest 3 announcements.
 *
 * Writes:
 *   public/og/startups-latest.jpg          (stable name, always overwritten)
 *   public/og/startups-{co1}-{co2}-{co3}.jpg  (cache-bust path used in meta)
 *   public/og/startups-og.json             (path + alt + description for Astro)
 *
 * Usage:
 *   node scripts/generate-startups-og.mjs
 *   npm run og:startups
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
} from "node:fs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "og");
const jsonPath = path.join(outDir, "startups-og.json");
const WIDTH = 1200;
const HEIGHT = 630;

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const startups = JSON.parse(
  readFileSync(path.join(root, "src/data/startups.json"), "utf8"),
);
const top = startups.slice(0, 3);
if (top.length < 1) {
  console.error("No startups in startups.json");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const portraitSize = 300;
const gap = 36;
const totalW = top.length * portraitSize + (top.length - 1) * gap;
const startX = Math.round((WIDTH - totalW) / 2);
const portraitY = 118;

const composites = [];
const labelSvgs = [];
const borderSvgParts = [];

for (let i = 0; i < top.length; i++) {
  const s = top[i];
  const imgRel = (s.image || "").replace(/^\//, "");
  const imgPath = path.join(root, "public", imgRel);
  if (!existsSync(imgPath)) {
    console.error(`Missing portrait: ${imgPath}`);
    process.exit(1);
  }
  const x = startX + i * (portraitSize + gap);
  const buf = await sharp(imgPath)
    .resize(portraitSize, portraitSize, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90 })
    .toBuffer();
  composites.push({ input: buf, left: x, top: portraitY });

  borderSvgParts.push(
    `<rect x="${x - 3}" y="${portraitY - 3}" width="${portraitSize + 6}" height="${portraitSize + 6}" fill="none" stroke="#5eead4" stroke-width="2" opacity="0.55"/>`,
  );

  const name = esc(s.companyName);
  const round = esc(s.round || "");
  const labelY = portraitY + portraitSize + 28;
  labelSvgs.push(`
    <text x="${x + portraitSize / 2}" y="${labelY}" text-anchor="middle"
      fill="#f4f4f5" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
      font-size="26" font-weight="700">${name}</text>
    <text x="${x + portraitSize / 2}" y="${labelY + 32}" text-anchor="middle"
      fill="#5eead4" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
      font-size="18">${round}</text>
  `);
}

const namesLine = top.map((s) => s.companyName).join(" · ");
const headlineBits = top
  .map((s) => `${s.companyName} (${s.round})`)
  .join(" · ");

const baseSvg = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06070b"/>
      <stop offset="100%" stop-color="#0f1419"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="#5eead4"/>
  <text x="60" y="48" fill="#5eead4"
    font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
    font-size="18" font-weight="600" letter-spacing="3">AIROMATIC</text>
  <text x="60" y="84" fill="#e4e4e7"
    font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
    font-size="28" font-weight="700">Agentic AI Startup News</text>
  <text x="${WIDTH - 60}" y="48" text-anchor="end" fill="#71717a"
    font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
    font-size="16">Latest announcements</text>
  ${borderSvgParts.join("\n")}
  <text x="60" y="${HEIGHT - 36}" fill="#a1a1aa"
    font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
    font-size="16">airomatic.ai/startups</text>
</svg>
`);

const labelsSvg = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${labelSvgs.join("\n")}
</svg>
`);

const slug = top.map((s) => slugify(s.companyName)).join("-") || "latest";
const versionedName = `startups-${slug}.jpg`;
const versionedPath = path.join(outDir, versionedName);
const latestPath = path.join(outDir, "startups-latest.jpg");

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 3,
    background: { r: 6, g: 7, b: 11 },
  },
})
  .composite([
    { input: baseSvg, top: 0, left: 0 },
    ...composites,
    { input: labelsSvg, top: 0, left: 0 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(versionedPath);

await sharp(versionedPath).toFile(latestPath);

// Prune old versioned startups-*.jpg except latest + current versioned
for (const f of readdirSync(outDir)) {
  if (
    f.startsWith("startups-") &&
    f.endsWith(".jpg") &&
    f !== "startups-latest.jpg" &&
    f !== versionedName
  ) {
    try {
      unlinkSync(path.join(outDir, f));
    } catch {
      /* ignore */
    }
  }
}

const meta = {
  ogImage: `/og/${versionedName}`,
  ogImageLatest: "/og/startups-latest.jpg",
  ogImageAlt: `Latest Agentic AI Startup News: ${namesLine}`,
  description: `${headlineBits}. Living archive of satirical AI startup funding announcements on Airomatic.`,
  title: "Agentic AI Startup News",
  companies: top.map((s) => ({
    companyName: s.companyName,
    round: s.round,
    id: s.id,
  })),
  generatedAt: new Date().toISOString(),
};

writeFileSync(jsonPath, JSON.stringify(meta, null, 2) + "\n");

console.log(`Wrote ${versionedPath}`);
console.log(`Wrote ${latestPath}`);
console.log(`Wrote ${jsonPath}`);
console.log(`OG path: ${meta.ogImage}`);
console.log(`Alt: ${meta.ogImageAlt}`);
