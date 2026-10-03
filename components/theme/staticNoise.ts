/**
 * The colour the static is in: plain grey snow, or `blood` — the same snow
 * with about half its lines run red, each line its own red, from scarlet
 * through crimson to near-black maroon.
 */
export type StaticPalette = "grey" | "blood";

/** How a line is coloured: multipliers for its red, green and blue. */
type Tint = readonly [number, number, number];

const GREY: Tint = [1, 1, 1];

/** The share of lines that run red in `blood`. */
const BLOODIED = 0.5;

/** A red for one line: always full in red, with green and blue cut back by varying amounts. */
function bloodRed(): Tint {
  const red = 0.7 + Math.random() * 0.4;
  const rest = 0.04 + Math.random() * 0.3;
  return [red, rest, rest * 0.85];
}

/**
 * Frames of television static, made once and cycled.
 *
 * Snow with the texture of a dead channel: every other line darker, the way
 * a CRT's scanlines sit between the rows; some lines brighter or darker as a
 * whole, as the signal surges and drops; and the odd line torn sideways,
 * smeared from its own left edge, where the picture loses sync.
 */
export function makeStatic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  palette: StaticPalette = "grey"
): ImageData[] {
  const frames: ImageData[] = [];
  for (let f = 0; f < count; f++) {
    const frame = ctx.createImageData(width, height);
    const px = frame.data;
    for (let y = 0; y < height; y++) {
      const scan = y % 2 === 0 ? 1 : 0.62;
      const surge = Math.random() < 0.06 ? 1.5 : Math.random() < 0.06 ? 0.45 : 1;
      const torn = Math.random() < 0.025;
      const smear = 40 + Math.random() * 215;
      const [r, g, b] = palette === "blood" && Math.random() < BLOODIED ? bloodRed() : GREY;
      for (let x = 0; x < width; x++) {
        const v = torn ? smear : Math.random() * 255;
        const lum = Math.min(255, v * scan * surge);
        const i = (y * width + x) * 4;
        px[i] = Math.min(255, lum * r);
        px[i + 1] = lum * g;
        px[i + 2] = lum * b;
        px[i + 3] = 255;
      }
    }
    frames.push(frame);
  }
  return frames;
}
