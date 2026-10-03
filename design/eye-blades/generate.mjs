// Draws the eye-with-blades outline twice: once clean, once as a hand-drawn
// sketch, both from the anchors below. Run with `node generate.mjs`; it writes
// eye-blades.svg and eye-blades-sketch.svg next to itself.
//
// Tweak the shape by moving ANCHORS (and BULGE for how full the almond is);
// the sketch follows. Change SEED for a different hand-drawn take.

import { writeFileSync } from "node:fs";

const VIEW = { width: 2266, height: 1488 };

/** The outline's fixed points, in viewBox units. Center line at y ≈ 820. */
const ANCHORS = {
  leftTip: [70, 813],
  // Where the left blade meets the almond: its top edge and its bottom edge.
  leftTop: [400, 802],
  leftBottom: [400, 818],
  top: [1200, 655], // the almond's top peak
  bottom: [1200, 940], // and its bottom peak
  rightTop: [1870, 822],
  rightBottom: [1870, 838],
  rightTip: [2215, 825],
};

/**
 * How full the almond's curves are. Each quarter of it is a cubic Bézier from
 * a blade corner to a peak: the first handle leaves the corner `along` of the
 * way across and `rise` of the way up, the second arrives level at the peak
 * from `level` of the way back. Bigger numbers make a rounder, fuller eye.
 */
const BULGE = { along: 0.3, rise: 0.6, level: 0.35 };

const STROKE = 4;
const SEED = 20261003;

// ── The clean outline ────────────────────────────────────────────────────

/** The cubic from a blade corner to a peak, as [start, c1, c2, end]. */
function quarter(corner, peak) {
  const dx = peak[0] - corner[0];
  const dy = peak[1] - corner[1];
  return [
    corner,
    [corner[0] + BULGE.along * dx, corner[1] + BULGE.rise * dy],
    [peak[0] - BULGE.level * dx, peak[1]],
    peak,
  ];
}

const reverse = ([a, b, c, d]) => [d, c, b, a];

/** The outline as segments, clockwise from the left tip. */
function segments() {
  const a = ANCHORS;
  return [
    { line: [a.leftTip, a.leftTop] },
    { cubic: quarter(a.leftTop, a.top) },
    { cubic: reverse(quarter(a.rightTop, a.top)) },
    { line: [a.rightTop, a.rightTip] },
    { line: [a.rightTip, a.rightBottom] },
    { cubic: quarter(a.rightBottom, a.bottom) },
    { cubic: reverse(quarter(a.leftBottom, a.bottom)) },
    { line: [a.leftBottom, a.leftTip] },
  ];
}

const fmt = (p) => `${+p[0].toFixed(1)} ${+p[1].toFixed(1)}`;

function cleanPath() {
  const parts = [`M ${fmt(ANCHORS.leftTip)}`];
  for (const s of segments()) {
    if (s.line) parts.push(`L ${fmt(s.line[1])}`);
    else parts.push(`C ${fmt(s.cubic[1])} ${fmt(s.cubic[2])} ${fmt(s.cubic[3])}`);
  }
  // Back at the left tip: closing on the point itself keeps the tip sharp.
  parts.push("Z");
  return parts.join(" ");
}

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" width="${VIEW.width}" height="${VIEW.height}">
  <rect width="100%" height="100%" fill="#000"/>
${body}
</svg>
`;
}

// ── The sketch ───────────────────────────────────────────────────────────

/** A small seeded random generator, so the sketch is the same on every run. */
function random(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const bezier = ([a, b, c, d], t) => {
  const s = 1 - t;
  return [0, 1].map(
    (i) => s * s * s * a[i] + 3 * s * s * t * b[i] + 3 * s * t * t * c[i] + t * t * t * d[i]
  );
};

/** The outline as a dense polyline, with each point's distance along it. */
function outline() {
  const pts = [];
  for (const s of segments()) {
    const steps = s.line ? 60 : 160;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      pts.push(
        s.line
          ? [s.line[0][0] + (s.line[1][0] - s.line[0][0]) * t, s.line[0][1] + (s.line[1][1] - s.line[0][1]) * t]
          : bezier(s.cubic, t)
      );
    }
  }
  let run = 0;
  return pts.map((p, i) => {
    if (i > 0) run += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
    return { p, s: run };
  });
}

/**
 * One pass of the pencil: the outline pushed off itself by a slow, smooth
 * wobble of up to ±6 units, which dies away near the two tips so they stay
 * crisp. It starts somewhere along the loop and runs a little past where it
 * began, the way a drawn loop overlaps itself.
 */
function pass(line, total, rand) {
  const waves = Array.from({ length: 3 }, (_, i) => ({
    cycles: 2 + i * 3 + rand() * 3,
    phase: rand() * Math.PI * 2,
    size: (6 / (i + 1.6)) * (0.6 + 0.4 * rand()),
  }));
  const tips = [0, line.find((q) => q.p[0] === ANCHORS.rightTip[0])?.s ?? total / 2];
  const near = (s) => Math.min(...tips.map((t) => Math.min(Math.abs(s - t), total - Math.abs(s - t))));
  const start = rand() * total;
  const overlap = 25 + rand() * 45;
  const out = [];
  const n = line.length;
  const first = line.findIndex((q) => q.s >= start);
  for (let k = 0; k < n * 1.2; k++) {
    const q = line[(first + k) % n];
    const along = (q.s - start + total) % total + (k >= n ? total : 0);
    if (along > total + overlap) break;
    const prev = line[(first + k - 1 + n) % n].p;
    const next = line[(first + k + 1) % n].p;
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const len = Math.hypot(tx, ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;
    const wobble = waves.reduce((sum, w) => sum + w.size * Math.sin((q.s / total) * w.cycles * Math.PI * 2 + w.phase), 0);
    const calm = Math.min(1, near(q.s) / 90);
    const off = wobble * calm * calm;
    out.push([q.p[0] + nx * off, q.p[1] + ny * off]);
  }
  return out;
}

/**
 * The stray lines at the corners, where the pencil carried on past the join:
 * each almond curve continued a short way out past its blade corner.
 */
function overshoots(rand) {
  const a = ANCHORS;
  const corners = [
    [a.leftTop, quarter(a.leftTop, a.top)[1]],
    [a.leftBottom, quarter(a.leftBottom, a.bottom)[1]],
    [a.rightTop, quarter(a.rightTop, a.top)[1]],
    [a.rightBottom, quarter(a.rightBottom, a.bottom)[1]],
  ];
  return corners.flatMap(([corner, handle]) => {
    const dx = corner[0] - handle[0];
    const dy = corner[1] - handle[1];
    const len = Math.hypot(dx, dy);
    return Array.from({ length: 1 + Math.round(rand()) }, () => {
      const back = 30 + rand() * 30;
      const reach = 34 + rand() * 30;
      const lift = (rand() - 0.5) * 6;
      const from = [corner[0] - (dx / len) * back, corner[1] - (dy / len) * back + lift];
      const to = [corner[0] + (dx / len) * reach, corner[1] + (dy / len) * reach + lift * 1.5];
      return [from, corner.map((v, i) => v + (i ? lift : 0)), to];
    });
  });
}

const polyline = (pts) => "M " + pts.map(fmt).join(" L ");

function sketchBody() {
  const rand = random(SEED);
  const line = outline();
  const total = line[line.length - 1].s;
  const strokes = [];
  const passes = 4;
  for (let i = 0; i < passes; i++) {
    const width = (STROKE * (0.75 + 0.35 * rand())).toFixed(2);
    const opacity = (0.72 + 0.28 * rand()).toFixed(2);
    strokes.push(
      `  <path d="${polyline(pass(line, total, rand))}" stroke-width="${width}" stroke-opacity="${opacity}"/>`
    );
  }
  for (const stray of overshoots(rand)) {
    strokes.push(`  <path d="${polyline(stray)}" stroke-width="${(STROKE * 0.7).toFixed(2)}" stroke-opacity="0.8"/>`);
  }
  return `  <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
${strokes.join("\n")}
  </g>`;
}

const here = new URL(".", import.meta.url);
writeFileSync(
  new URL("eye-blades.svg", here),
  svg(`  <path d="${cleanPath()}" fill="none" stroke="#fff" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`)
);
writeFileSync(new URL("eye-blades-sketch.svg", here), svg(sketchBody()));
console.log("clean path:", cleanPath());
