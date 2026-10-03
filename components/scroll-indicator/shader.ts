import { BLADES, BOTTOM_ARC, EYE_BOX, TOP_ARC } from "./eye";

/**
 * The scroll indicator, drawn as one object in one pass: an eye in machined
 * chrome — a long almond with a blade off each end — holding a
 * recessed channel of glossy black liquid, under glass.
 *
 * Everything is shaded the same way — a surface normal reflected into a
 * procedural studio — and both materials share its key light and strips, so
 * the rim's bevels and the liquid's crests read as parts of one physical
 * thing. The chrome sees the studio bright, which is what makes it shine; the
 * liquid sees the same lights as narrow strips on a dark ground.
 * Units are CSS pixels, with detail scaled from a design height of 110 (`u`),
 * so the object keeps its proportions at any size.
 */

/**
 * The eye's geometry, written into the shader in hundredths of its drawing's
 * units — small enough numbers that squared distances stay in range at medium
 * precision.
 */
const E = 100;
const num = (n: number) => (n / E).toFixed(4);
const vec = ([x, y]: readonly [number, number]) => `vec2(${num(x)}, ${num(y)})`;

export const VERTEX = /* glsl */ `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_canvas;    // canvas size, CSS px
uniform float u_dpr;
uniform vec2 u_size;      // the object itself, CSS px
uniform float u_time;
uniform float u_progress; // 0..1
uniform float u_slosh;    // the liquid's surge: + forward, - back, wobbling to rest
uniform float u_stir;     // how hard the page is moving, 0 at rest

const float PI = 3.14159265;

// ── The shape ─────────────────────────────────────────────────────────────
// The eye, in its drawing's own units (hundredths of them; y runs down): an
// almond — the overlap of a great circle arcing over its top and another
// under its bottom — with a thin triangular blade off each end.

const vec2 CENTRE = vec2(${num(EYE_BOX.x + EYE_BOX.width / 2)}, ${num(EYE_BOX.y + EYE_BOX.height / 2)});
const vec2 TOP_C = vec2(${num(TOP_ARC.x)}, ${num(TOP_ARC.y)});
const float TOP_R = ${num(TOP_ARC.r)};
const vec2 BOTTOM_C = vec2(${num(BOTTOM_ARC.x)}, ${num(BOTTOM_ARC.y)});
const float BOTTOM_R = ${num(BOTTOM_ARC.r)};
const vec2 LEFT_TIP = ${vec(BLADES.left.tip)};
const vec2 LEFT_TOP = ${vec(BLADES.left.base[0])};
const vec2 LEFT_BOTTOM = ${vec(BLADES.left.base[1])};
const vec2 RIGHT_TIP = ${vec(BLADES.right.tip)};
const vec2 RIGHT_TOP = ${vec(BLADES.right.base[0])};
const vec2 RIGHT_BOTTOM = ${vec(BLADES.right.base[1])};
const vec2 CREST = vec2(${num(TOP_ARC.x)}, ${num(TOP_ARC.y - TOP_ARC.r)});
const float EYE_WIDTH = ${num(EYE_BOX.width)};

// The drawing's units per CSS px, at the size the object is drawn.
float unit;

vec2 toEye(vec2 p) {
  return vec2(CENTRE.x + p.x * unit, CENTRE.y - p.y * unit);
}

vec2 fromEye(vec2 q) {
  return vec2(q.x - CENTRE.x, CENTRE.y - q.y) / unit;
}

float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
  vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                   vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                   vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}

// Signed distance to the eye's outline, in CSS px: negative inside.
float sdEye(vec2 p) {
  vec2 q = toEye(p);
  float almond = max(length(q - TOP_C) - TOP_R, length(q - BOTTOM_C) - BOTTOM_R);
  float blades = min(sdTriangle(q, LEFT_TIP, LEFT_TOP, LEFT_BOTTOM),
                     sdTriangle(q, RIGHT_TIP, RIGHT_TOP, RIGHT_BOTTOM));
  return min(almond, blades) / unit;
}

// Which way is out, at p.
vec2 sdEyeGrad(vec2 p) {
  vec2 h = vec2(0.35, 0.0);
  vec2 g = vec2(sdEye(p + h.xy) - sdEye(p - h.xy), sdEye(p + h.yx) - sdEye(p - h.yx));
  return g / max(length(g), 1e-5);
}

// Where the channel ends either side, in CSS px across from the middle: the
// points where the two circles, each brought in by the rim, cross.
vec2 channelEnds(float rim) {
  float r1 = TOP_R - rim * unit;
  float r2 = BOTTOM_R - rim * unit;
  vec2 d = BOTTOM_C - TOP_C;
  float l = length(d);
  float a = (r1 * r1 - r2 * r2 + l * l) / (2.0 * l);
  float h = sqrt(max(r1 * r1 - a * a, 0.0));
  vec2 m = TOP_C + d * (a / l);
  vec2 across = vec2(-d.y, d.x) / l;
  float x1 = (m + across * h).x;
  float x2 = (m - across * h).x;
  return (vec2(min(x1, x2), max(x1, x2)) - CENTRE.x) / unit;
}

// ── Light ─────────────────────────────────────────────────────────────────

float strip(float x, float from, float to) {
  return smoothstep(from - 0.04, from + 0.02, x) * (1.0 - smoothstep(to - 0.02, to + 0.06, x));
}

// Polished chrome: a mirror in a bright studio, reflected crisply. What reads
// as polish is contrast with a clean edge to it, so the studio is a sky blown
// nearly to white over a sharp horizon, with a floor of clean steel grey below
// it — never dark, so no black band runs along the metal — a broad softbox
// overhead, two strips off to the sides and a hot key glint. Each band of the
// rim turns through that horizon across its width, so it runs from white to
// steel over one crisp line, evenly from end to end, the way the header's
// mark does. The rim is too narrow at this size to hold anything finer: thin
// bars of light would only fall between the pixels and sparkle.
float mirror(vec3 r) {
  float below = 0.42 + 0.25 * smoothstep(-0.2, -0.9, r.y);
  float above = 1.9 + 1.0 * smoothstep(0.15, 0.8, r.y) + 0.3 * smoothstep(-0.4, 0.5, r.x);
  float lit = mix(below, above, smoothstep(-0.06, 0.04, r.y));
  lit += strip(r.y, 0.3, 0.38) * 1.8;
  lit += strip(r.x, 0.6, 0.68) * 1.2 + strip(-r.x, 0.6, 0.66) * 0.8;
  lit += pow(max(dot(r, normalize(vec3(0.5, 0.62, 0.6))), 0.0), 120.0) * 8.0;
  return lit;
}

// Where the surface turns nearly edge-on it sees past the studio into the dark
// room around it, so every rounded edge draws one thin, even dark line right
// round the object. Measured off the surface itself rather than the reflection,
// so the line is the same width along the whole length.
vec3 mirrorOf(vec3 n, vec3 v) {
  float edgeOn = smoothstep(0.42, 0.18, n.z);
  return vec3(mirror(reflect(-v, n)) * mix(1.0, 0.15, edgeOn)) * vec3(0.95, 0.97, 1.0);
}

// The black liquid's studio: the same lights, resolved into narrow strips on a
// dark ground, so its curves draw them out into long, clean streaks.
float gloss(vec3 r) {
  float across = 1.0 - smoothstep(0.4, 0.9, abs(r.x));
  float top = strip(r.y, 0.38, 0.62) * across;
  // The softbox's far edge, a second thin line above the first — the doubled
  // highlight that makes a surface read as wet rather than just shiny.
  float edge = strip(r.y, 0.7, 0.75) * across;
  float side = strip(r.x, 0.5, 0.62);
  float under = strip(-r.y, 0.55, 0.65) * 0.25;
  float key = pow(max(dot(r, normalize(vec3(0.45, 0.6, 0.66))), 0.0), 220.0) * 9.0;
  return 0.008 + top * 2.2 + edge * 1.4 + side + under + key;
}

// A surface falling away in direction dir with the given slope.
vec3 tilt(vec2 dir, float slope) {
  return normalize(vec3(dir * min(slope, 6.0), 1.0));
}

// A rounded bead: steep at its edge, flat on top. t is 0 at the edge.
float beadSlope(float t) {
  float k = 1.0 - clamp(t, 0.0, 1.0);
  return k / sqrt(max(1.0 - k * k, 0.03));
}

// ── The rim ───────────────────────────────────────────────────────────────

// The chrome around the liquid, like a lid: a rounded outer lip, a crowned
// face, and a bevel falling into the channel. d is the distance to the
// outline (negative inside) and n which way is out. The blades are too thin
// to hold any liquid, so they are lip and face alone: a rounded edge either
// side and a crowned spine down the middle.
vec3 rim(float d, vec2 n, float bead, float face, float bevel, vec3 v) {
  float e = -d;                          // depth in from the outer edge
  float dCh = d + bead + face + bevel;   // distance out from the channel

  if (e < bead) {
    // The outer lip.
    return mirrorOf(tilt(n, beadSlope(e / bead)), v);
  }

  if (dCh < bevel) {
    // The inner bevel, falling into the channel.
    float t = 1.0 - dCh / bevel;
    float slope = t / sqrt(max(1.0 - t * t, 0.03));
    return mirrorOf(tilt(-n, slope), v);
  }

  // The face: crowned, so as it turns across its width it sweeps through the
  // studio — past the horizon and the bars — rather than reading as one flat
  // tone.
  float w = (e - bead) / max(face, 1e-3);
  return mirrorOf(tilt(n, 0.7 * cos(PI * w)), v);
}

// A band of light sweeping diagonally across the metal every few seconds of
// the liquid's clock — so more often while the page is moving.
float sweep(vec2 p, vec2 hs) {
  float at = fract(u_time * 0.09) * 3.2 - 1.1;
  float x = p.x / hs.x * 0.5 + p.y / hs.y * 0.05;
  return exp(-pow((x - at) / 0.035, 2.0)) * 1.6 + exp(-pow((x - at + 0.07) / 0.012, 2.0)) * 0.9;
}

// ── The liquid ────────────────────────────────────────────────────────────
// Thick black goo: everything below is a field, summed, that the channel
// thresholds into liquid. Summing rather than taking the larger value is what
// makes it goo — two shapes near each other swell together and stay joined by
// a neck that thins as they part, rather than meeting at a crease.

const int BLOBS = 16;

// Where the liquid's front sits, in channel heights from the left wall:
// advanced by the scroll, and thrown forward or drawn back as it sloshes.
float frontAt(float hc, float wc) {
  return (mix(hc * 0.5, wc + hc * 0.4, u_progress) + u_slosh * hc * 0.55) / hc;
}

// The mass: a chain of soft blobs strung from the left wall to the front. Each
// wanders about its place in the chain and swells and shrinks on its own beat,
// so lobes bulge, necks pinch, and the mass is never still. Every blob carries
// its share of the liquid for its stretch of channel: a short chain gathers
// into one swollen body, and a long one stretches into lobes joined by necks.
float mass(vec2 q, float t, float front) {
  float f = 0.0;
  float gap = max(front, 0.05) / float(BLOBS - 1);
  float share = clamp(gap / 0.53, 0.2, 1.05);
  for (int i = 0; i < BLOBS; i++) {
    float fi = float(i);
    vec2 at = vec2(fi * gap + 0.12 * sin(t * (0.6 + 0.11 * fi) + fi * 2.3),
                   0.2 * sin(t * (0.8 + 0.13 * fi) + fi * 1.7));
    float r = 0.25 + 0.17 * fract(fi * 0.618034)
            + 0.07 * sin(t * (1.1 + 0.19 * fi) + fi * 4.1);
    vec2 d = (q - at) / r;
    f += exp(-dot(d, d)) * share;
  }
  return f;
}

// Tendrils: two short strands reaching out of the front, thick at the root and
// tapering to a point, with a slow whip running along them. They stretch out
// while the page moves and draw back in when it rests.
float tendrils(vec2 q, float t, float front) {
  float f = 0.0;
  float reach = 0.25 + 0.7 * clamp(u_stir + abs(u_slosh) * 0.5, 0.0, 1.5);
  for (int k = 0; k < 2; k++) {
    float fk = float(k);
    vec2 root = vec2(front - 0.3, 0.25 * sin(fk * 2.1 + t * 0.45));
    float l = reach * (0.5 + 0.5 * sin(t * (0.5 + 0.17 * fk) + fk * 3.3));
    vec2 dir = normalize(vec2(1.0, 0.4 * sin(t * 0.7 + fk * 1.9)));
    float along = clamp(dot(q - root, dir), 0.0, l);
    float lean = along / max(l, 1e-3);
    vec2 side = vec2(-dir.y, dir.x);
    vec2 nearest = root + dir * along + side * 0.06 * sin(along * 7.0 - t * 2.5 + fk * 2.0) * lean;
    vec2 d = (q - nearest) / mix(0.14, 0.03, lean);
    f += exp(-dot(d, d)) * 0.95;
  }
  return f;
}

// Spray: drops flung off the front and drawn back into it, each on its own
// cycle, flung further while the page moves. Each trails a strand of goo back
// to the front that thins as it stretches and snaps well before the drop is at
// its furthest. Each leaves and returns through the front, so no cycle shows a
// seam.
float spray(vec2 q, float t, float front) {
  float f = 0.0;
  float fling = 0.3 + 0.9 * clamp(u_stir + abs(u_slosh) * 0.6, 0.0, 1.6);
  for (int j = 0; j < 4; j++) {
    float fj = float(j);
    float phase = fract(t * (0.21 + 0.06 * fj) + fj * 0.37);
    float arc = 4.0 * phase * (1.0 - phase);
    vec2 root = vec2(front - 0.3, 0.3 * sin(fj * 2.7 + t * 0.4));
    vec2 at = root + vec2(arc * fling * (0.7 + 0.3 * sin(fj * 4.1)), 0.12 * arc * sin(fj * 5.3));
    vec2 d = (q - at) / mix(0.15, 0.08, arc);
    f += exp(-dot(d, d)) * 0.9;

    vec2 ba = at - root;
    float h = clamp(dot(q - root, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
    float s = length(q - root - ba * h) / (0.07 * (1.0 - arc) + 0.005);
    f += exp(-s * s) * 0.7 * (1.0 - arc);
  }
  return f;
}

// Rings spreading across the surface from two points that wander through the
// liquid: a faint shimmer at rest, a stronger one while the page moves.
float ripples(vec2 q, float t, float len) {
  float r = 0.0;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    vec2 o = vec2(len * (0.3 + 0.4 * fi) + sin(t * 0.13 + fi * 2.0) * len * 0.2,
                  0.15 * sin(t * 0.21 + fi));
    float d = length((q - o) * vec2(0.6, 1.0));
    r += sin(d * 18.0 - t * 4.0 + fi * 1.3) * exp(-d * 1.2);
  }
  return r;
}

// How much liquid there is at c (channel px, x from the left wall). Ripples
// only move what is already there, so the bare floor stays clean.
float liquid(vec2 c, float t, float hc, float wc) {
  vec2 q = c / hc;
  float front = frontAt(hc, wc);
  float f = mass(q, t, front) + tendrils(q, t, front) + spray(q, t, front);
  float shimmer = ripples(q, t, wc / hc) * (0.02 + 0.04 * min(u_stir, 1.5));
  return f + shimmer * smoothstep(0.2, 0.8, f);
}

// Where there is enough of it, the liquid stands up off the floor: past THRESHOLD
// it rises over RISE to its full depth, steeply at first, so every lobe, strand
// and drop has a rounded rim that catches the light.
const float THRESHOLD = 0.42;
const float RISE = 0.4;

// The channel runs between ends.x and ends.y, its widest depth hc across the
// middle; the liquid is laid out in it from its left end.
vec3 channel(vec2 p, float d, float rimWidth, vec2 ends, float u, vec3 v, float px) {
  float hc = u_size.y - 2.0 * rimWidth;
  float wc = ends.y - ends.x;
  float t = u_time;
  vec2 c = vec2(p.x - ends.x, p.y);
  vec2 g = vec2(c.x / wc, p.y / hc + 0.5);

  float eps = max(0.6, hc * 0.012);
  float f0 = liquid(c, t, hc, wc);
  float fx = liquid(c + vec2(eps, 0.0), t, hc, wc);
  float fy = liquid(c + vec2(0.0, eps), t, hc, wc);
  vec2 grad = vec2(fx - f0, fy - f0) / eps;

  // The edge is antialiased off the field's own gradient, so it stays one
  // pixel soft however steep or shallow the liquid is there.
  float cover = clamp((f0 - THRESHOLD) / max(length(grad) * px, 1e-4) + 0.5, 0.0, 1.0);

  float rise = clamp((f0 - THRESHOLD) / RISE, 0.0, 1.0);
  float k = 1.0 - rise;
  float rim = rise > 0.0 && rise < 1.0 ? 3.0 * k * k / RISE : 0.0;
  float lift = hc * 0.16;
  vec2 slope = grad * (rim * 0.6 + 0.4) * lift;
  vec3 n = normalize(vec3(-slope, 1.0));

  // Black, and almost a mirror: what reads is the light it throws back,
  // strongest where the surface turns away at its rims and crests.
  float fres = 0.04 + 0.96 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 5.0);
  vec3 wet = vec3(0.006, 0.007, 0.009)
           + gloss(reflect(-v, n)) * mix(0.35, 1.0, fres) * vec3(0.9, 0.93, 0.97)
           + fres * 0.2;

  // The floor: a grey plate under the glass, lit from above, with a soft
  // shadow gathering wherever the liquid is about to rise from it, and a bright
  // film right at the edge where the plate is wet.
  vec3 plate = vec3(mix(0.42, 0.54, g.y)) * vec3(0.97, 0.98, 1.0);
  plate *= 1.0 - 0.45 * smoothstep(THRESHOLD - 0.28, THRESHOLD, f0);
  plate += 0.22 * exp(-pow((f0 - (THRESHOLD - 0.06)) / 0.03, 2.0));

  vec3 col = mix(plate, wet, cover);

  // Recessed: shaded along the walls, and in the shadow of the upper lid.
  float inset = -(d + rimWidth);
  float underLid = (TOP_R - length(toEye(p) - TOP_C)) / unit - rimWidth;
  col *= mix(0.5, 1.0, smoothstep(0.0, 6.0 * u, inset));
  col *= mix(0.75, 1.0, smoothstep(0.0, 14.0 * u, underLid));

  // The glass over it: one soft diagonal sheen, a finer one beside it, and a
  // hairline catching the light just inside the walls.
  float sheen = exp(-pow((g.x - g.y * 0.3 - 0.64) / 0.05, 2.0)) * 0.05
              + exp(-pow((g.x - g.y * 0.3 - 0.71) / 0.012, 2.0)) * 0.035;
  float hairline = exp(-pow((inset - 1.2 * u) / (0.7 * u), 2.0)) * 0.1;
  return col + sheen + hairline * (0.5 + 0.5 * g.y);
}

// ── Glints ────────────────────────────────────────────────────────────────

float glint(vec2 d, float u) {
  float core = exp(-dot(d, d) / (2.0 * 4.8 * u * u));
  float wide = exp(-abs(d.y) / (0.45 * u)) * exp(-abs(d.x) / (16.0 * u));
  float tall = exp(-abs(d.x) / (0.45 * u)) * exp(-abs(d.y) / (7.0 * u));
  return core * 0.9 + (wide + tall) * 0.35;
}

// One sample of the rim at q, swept by the band of light.
vec3 metal(vec2 q, float d, float bead, float face, float bevel, vec3 v, vec2 hs) {
  return rim(d, sdEyeGrad(q), bead, face, bevel, v) + vec3(sweep(q, hs));
}

void main() {
  vec2 p = gl_FragCoord.xy / u_dpr - u_canvas * 0.5;
  float px = 1.0 / u_dpr;
  float u = u_size.y / 110.0;
  vec2 hs = u_size * 0.5;
  unit = EYE_WIDTH / u_size.x;

  // The rim keeps a minimum width in px, so it still draws its lines at the
  // small sizes the indicator is shown at.
  float bead = max(0.05 * u_size.y, 1.4);
  float face = 0.085 * u_size.y;
  float bevel = max(0.05 * u_size.y, 1.2);
  float rimWidth = bead + face + bevel;

  // A perspective eye a little further off than the object is wide, so a
  // flat face still sweeps through the reflections from one end to the other.
  vec3 v = normalize(vec3(-p, u_size.x * 1.1));

  float dOut = sdEye(p);
  float cover = clamp(0.5 - dOut / px, 0.0, 1.0);

  vec3 col = vec3(0.0);
  if (cover > 0.0) {
    // Four samples a pixel, on a rotated grid. The rim's lip, face and bevel
    // meet along curves, and shaded once a pixel those seams step from pixel
    // to pixel and read as a row of dashes; averaged, they run smooth. The
    // liquid is soft already, so it is shaded once, where it is needed.
    vec3 chrome = vec3(0.0);
    float metals = 0.0;
    float wets = 0.0;
    for (int i = 0; i < 4; i++) {
      vec2 o = i == 0 ? vec2(0.125, 0.375)
             : i == 1 ? vec2(-0.375, 0.125)
             : i == 2 ? vec2(0.375, -0.125)
             : vec2(-0.125, -0.375);
      vec2 q = p + o * px;
      float d = sdEye(q);
      if (d > 0.0) continue;
      if (d > -rimWidth) {
        chrome += metal(q, d, bead, face, bevel, v, hs);
        metals += 1.0;
      } else {
        wets += 1.0;
      }
    }
    if (metals + wets == 0.0) {
      // Only just inside the edge: the lip, at its very rim.
      col = metal(p, -0.01, bead, face, bevel, v, hs);
    } else {
      vec3 wet = wets > 0.0
        ? channel(p, dOut, rimWidth, channelEnds(rimWidth), u, v, px) + vec3(sweep(p, hs)) * 0.08
        : vec3(0.0);
      col = (chrome + wet * wets) / (metals + wets);
    }
  }
  col = 1.0 - exp(-col * 1.15);

  // Outside it: a pocket of shadow, so it sits in its own darkness on a light
  // page, and glints flaring where the light catches it — on the crest of the
  // upper lid, and along the spine of each blade.
  float shadow = 0.6 * exp(-max(dOut, 0.0) / (7.0 * u));
  vec2 rightSpine = mix(mix(RIGHT_TOP, RIGHT_BOTTOM, 0.5), RIGHT_TIP, 0.5);
  vec2 leftSpine = mix(mix(LEFT_TOP, LEFT_BOTTOM, 0.5), LEFT_TIP, 0.55);
  float glow = glint(p - (fromEye(CREST) - vec2(0.0, bead)), u)
             + glint(p - fromEye(rightSpine), u) * 0.8
             + glint(p - fromEye(leftSpine), u) * 0.55;
  glow *= 0.85;

  vec3 rgb = col * cover + vec3(glow);
  float a = cover + (1.0 - cover) * shadow;
  a = max(a, clamp(glow, 0.0, 1.0));
  gl_FragColor = vec4(min(rgb, vec3(a)), a);
}
`;
