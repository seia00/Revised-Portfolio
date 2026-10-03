/**
 * The indicator's shape: an eye with blades — a long almond with a
 * needle-thin blade off each end (design/eye-blades). Everything here is in
 * that drawing's own viewBox units, and both the WebGL object and its
 * fallback are built from it, so they always agree with the drawing.
 */

type Point = readonly [number, number];

/** The outline's fixed points: the blade tips, the corners where each blade
 *  meets the almond, and the almond's two peaks. */
export const EYE = {
  leftTip: [70, 813],
  leftTop: [400, 802],
  leftBottom: [400, 818],
  top: [1200, 655],
  bottom: [1200, 940],
  rightTop: [1870, 822],
  rightBottom: [1870, 838],
  rightTip: [2215, 825],
} as const satisfies Record<string, Point>;

/** The box the outline fills: the object's proportions. */
export const EYE_BOX = { x: 70, y: 655, width: 2145, height: 285 } as const;

/** The outline itself, as drawn: straight blades, the almond in cubics. */
export const EYE_PATH =
  "M 70 813 L 400 802 C 640 713.8 920 655 1200 655 C 1434.5 655 1669 721.8 1870 822 " +
  "L 2215 825 L 1870 838 C 1669 899.2 1434.5 940 1200 940 C 920 940 640 891.2 400 818 Z";

/** The almond alone, without its blades: the channel the liquid fills. */
export const ALMOND_PATH =
  "M 400 802 C 640 713.8 920 655 1200 655 C 1434.5 655 1669 721.8 1870 822 " +
  "L 1870 838 C 1669 899.2 1434.5 940 1200 940 C 920 940 640 891.2 400 818 Z";

/** A circle, as its centre and radius. */
export type Circle = { x: number; y: number; r: number };

/** The circle through three points. */
function circleThrough([ax, ay]: Point, [bx, by]: Point, [cx, cy]: Point): Circle {
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  const a = ax * ax + ay * ay;
  const b = bx * bx + by * by;
  const c = cx * cx + cy * cy;
  const x = (a * (by - cy) + b * (cy - ay) + c * (ay - by)) / d;
  const y = (a * (cx - bx) + b * (ax - cx) + c * (bx - ax)) / d;
  return { x, y, r: Math.hypot(ax - x, ay - y) };
}

/**
 * The almond as the WebGL object draws it: the overlap of two great circles,
 * one arcing over its top through both corners and the top peak, one under
 * its bottom through the bottom peak. They follow the drawing's curves to
 * within half a percent of its length.
 */
export const TOP_ARC = circleThrough(EYE.leftTop, EYE.top, EYE.rightTop);
export const BOTTOM_ARC = circleThrough(EYE.leftBottom, EYE.bottom, EYE.rightBottom);
