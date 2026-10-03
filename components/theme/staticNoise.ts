/**
 * Frames of television static, made once and cycled.
 *
 * Grey snow with the texture of a dead channel: every other line darker, the
 * way a CRT's scanlines sit between the rows; some lines brighter or darker
 * as a whole, as the signal surges and drops; and the odd line torn sideways,
 * smeared from its own left edge, where the picture loses sync.
 */
export function makeStatic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number
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
      for (let x = 0; x < width; x++) {
        const v = torn ? smear : Math.random() * 255;
        const lum = Math.min(255, v * scan * surge);
        const i = (y * width + x) * 4;
        px[i] = lum;
        px[i + 1] = lum;
        px[i + 2] = lum;
        px[i + 3] = 255;
      }
    }
    frames.push(frame);
  }
  return frames;
}
