/**
 * Turns the supplied logo — a white mark on solid black — into `public/logo.png`:
 * the same mark, trimmed to its own edges and carrying transparency.
 *
 *     node scripts/make-logo-mark.mjs
 *
 * Luminance becomes the alpha channel, so the black ground drops out and the
 * mark ships white. It then sits on the title card as-is and inverts to ink
 * with a CSS `invert(1)` wherever the ground is paper, which is why there is
 * only one file for both.
 */
import sharp from "sharp";

const SRC = "public/c231de0f-6e82-48eb-a306-bf06385f5616.png";
const OUT = "public/logo.png";

/** Below this the pixel is ground, not mark — keeps the trim off JPEG-ish fuzz. */
const INK_FLOOR = 24;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const out = Buffer.alloc(W * H * 4, 0);
let x0 = Infinity,
  y0 = Infinity,
  x1 = -1,
  y1 = -1;

for (let p = 0; p < W * H; p++) {
  const i = p * C;
  const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
  const o = p * 4;
  out[o] = out[o + 1] = out[o + 2] = 255;
  out[o + 3] = lum;

  if (lum > INK_FLOOR) {
    const x = p % W;
    const y = (p / W) | 0;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
}

const w = x1 - x0 + 1;
const h = y1 - y0 + 1;
await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: x0, top: y0, width: w, height: h })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`${OUT}  ${w}x${h}  (trimmed from ${W}x${H})`);
