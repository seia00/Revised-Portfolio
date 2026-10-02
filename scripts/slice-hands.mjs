/**
 * Cuts `public/geometric-x-24-landscape-1280x720.png` into the layers that
 * HandsPlate animates in, writing them to `public/hands/`.
 *
 *     node scripts/slice-hands.mjs
 *
 * The source sits on a flat key colour, so dropping that colour leaves clean
 * transparent cutouts. Ownership is resolved in PANELS order — the first rect
 * containing a pixel claims it, and everything left over falls to one of the
 * two hands, split down the gap between them. Because every pixel lands in
 * exactly one layer, the pieces recompose into the original with no seams and
 * no duplicated artwork flying in twice.
 *
 * Printed percentages are the geometry to paste into `LAYERS` in
 * components/HandsPlate.tsx.
 *
 * sharp comes in with Next's image optimiser; this script is the only other
 * thing that uses it.
 */
import sharp from "sharp";

const SRC = "public/geometric-x-24-landscape-1280x720.png";
const OUT = "public/hands";

/** The flat ground the artwork was drawn on, and how far off it can drift. */
const BG = [200, 202, 200];
const TOL = 6;

/** Panels that read as instruments floating clear of the hands. */
const PANELS = [
  { name: "residue", x0: 16, y0: 219, x1: 124, y1: 270 },
  { name: "latency", x0: 470, y0: 184, x1: 630, y1: 318 },
  { name: "echo", x0: 712, y0: 483, x1: 839, y1: 563 },
  { name: "corner", x0: 1146, y0: 403, x1: 1267, y1: 494 },
];

/** The empty column between the two hands. */
const SPLIT = 660;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const names = [...PANELS.map((p) => p.name), "hand-left", "hand-right"];
const pixels = Object.fromEntries(names.map((n) => [n, Buffer.alloc(W * H * 4, 0)]));
const bounds = Object.fromEntries(
  names.map((n) => [n, { x0: Infinity, y0: Infinity, x1: -1, y1: -1 }])
);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const offKey =
      Math.abs(data[i] - BG[0]) + Math.abs(data[i + 1] - BG[1]) + Math.abs(data[i + 2] - BG[2]);
    if (offKey <= TOL) continue;

    const panel = PANELS.find((p) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1);
    const name = panel ? panel.name : x < SPLIT ? "hand-left" : "hand-right";

    const o = (y * W + x) * 4;
    pixels[name][o] = data[i];
    pixels[name][o + 1] = data[i + 1];
    pixels[name][o + 2] = data[i + 2];
    pixels[name][o + 3] = 255;

    const b = bounds[name];
    if (x < b.x0) b.x0 = x;
    if (x > b.x1) b.x1 = x;
    if (y < b.y0) b.y0 = y;
    if (y > b.y1) b.y1 = y;
  }
}

const geometry = [];
for (const name of names) {
  const b = bounds[name];
  const w = b.x1 - b.x0 + 1;
  const h = b.y1 - b.y0 + 1;
  await sharp(pixels[name], { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: b.x0, top: b.y0, width: w, height: h })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${name}.png`);
  geometry.push({
    name,
    left: +((b.x0 / W) * 100).toFixed(3),
    top: +((b.y0 / H) * 100).toFixed(3),
    width: +((w / W) * 100).toFixed(3),
    height: +((h / H) * 100).toFixed(3),
  });
}

console.table(geometry);
