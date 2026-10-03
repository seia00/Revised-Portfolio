/**
 * The indicator's shape: an eye with blades — a long almond with a blade off
 * each end, after the drawing in design/eye-blades. Everything here is in that
 * drawing's own viewBox units, and both the WebGL object and its fallback are
 * built from it, so the two always agree.
 */

type Point = readonly [number, number];

/** The box the eye fills: the object's proportions. */
export const EYE_BOX = { x: 70, y: 655, width: 2145, height: 285 } as const;

/** The almond: its two peaks, and the corners at either end it is fitted through. */
const ALMOND = {
  top: [1200, 655],
  bottom: [1200, 940],
  leftTop: [400, 802],
  leftBottom: [400, 818],
  rightTop: [1870, 822],
  rightBottom: [1870, 838],
} as const satisfies Record<string, Point>;

/**
 * The blades: each a long triangle from its tip back into the almond. The
 * drawing's are needles, 16 units across where they leave the almond; at the
 * indicator's size that is under two pixels, so these are drawn thicker, their
 * bases sunk into the almond's ends so they grow out of it. Where each edge
 * crosses the almond's outline is worked out below.
 */
export const BLADES = {
  left: { tip: [70, 813], base: [[580, 765], [580, 861]] },
  right: { tip: [2215, 825], base: [[1730, 777], [1730, 873]] },
} as const satisfies Record<string, { tip: Point; base: readonly [Point, Point] }>;

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
 * The almond as both the WebGL object and the fallback draw it: the overlap
 * of two great circles, one arcing over its top through its upper corners and
 * the top peak, one under its bottom through the bottom peak. They follow the
 * drawing's curves to within half a percent of its length.
 */
export const TOP_ARC = circleThrough(ALMOND.leftTop, ALMOND.top, ALMOND.rightTop);
export const BOTTOM_ARC = circleThrough(ALMOND.leftBottom, ALMOND.bottom, ALMOND.rightBottom);

/** Where the edge from `tip` to `base` first meets the circle, coming in from the tip. */
function entersCircle(tip: Point, base: Point, { x, y, r }: Circle): Point {
  const dx = base[0] - tip[0];
  const dy = base[1] - tip[1];
  const fx = tip[0] - x;
  const fy = tip[1] - y;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  const t = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  return [tip[0] + dx * t, tip[1] + dy * t];
}

const round = ([x, y]: Point) => `${+x.toFixed(1)} ${+y.toFixed(1)}`;
const arc = (circle: Circle, to: Point) =>
  `A ${+circle.r.toFixed(1)} ${+circle.r.toFixed(1)} 0 0 1 ${round(to)}`;

/**
 * The outline, for the fallback: each blade's edges in from its tip to where
 * they meet the almond, joined by the almond's own arcs.
 */
export const EYE_PATH = (() => {
  const { left, right } = BLADES;
  const leftUpper = entersCircle(left.tip, left.base[0], TOP_ARC);
  const rightUpper = entersCircle(right.tip, right.base[0], TOP_ARC);
  const rightLower = entersCircle(right.tip, right.base[1], BOTTOM_ARC);
  const leftLower = entersCircle(left.tip, left.base[1], BOTTOM_ARC);
  return [
    `M ${round(left.tip)}`,
    `L ${round(leftUpper)}`,
    arc(TOP_ARC, rightUpper),
    `L ${round(right.tip)}`,
    `L ${round(rightLower)}`,
    arc(BOTTOM_ARC, leftLower),
    "Z",
  ].join(" ");
})();

/** The almond alone, without its blades: the channel the liquid fills. */
export const ALMOND_PATH = [
  `M ${round(ALMOND.leftTop)}`,
  arc(TOP_ARC, ALMOND.rightTop),
  `L ${round(ALMOND.rightBottom)}`,
  arc(BOTTOM_ARC, ALMOND.leftBottom),
  "Z",
].join(" ");
