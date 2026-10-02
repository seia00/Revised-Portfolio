/**
 * The scroll indicator, drawn as one object in one pass: a machined chrome
 * frame around a recessed channel of glossy black liquid, under glass.
 *
 * Everything is shaded the same way — a surface normal reflected into a
 * procedural studio — and both materials share its key light and strips, so
 * the frame's bevels and the liquid's crests read as parts of one physical
 * thing. The chrome sees the studio bright and blown out, which is what makes
 * it shine; the liquid sees the same lights as narrow strips on a dark ground.
 * Units are CSS pixels, scaled from a design height of 110 (`u`), so the object
 * keeps its proportions at any size.
 */

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

// ── Shapes ────────────────────────────────────────────────────────────────

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec2 sdBoxGrad(vec2 p, vec2 b, float r) {
  vec2 h = vec2(0.35, 0.0);
  vec2 g = vec2(sdBox(p + h.xy, b, r) - sdBox(p - h.xy, b, r),
                sdBox(p + h.yx, b, r) - sdBox(p - h.yx, b, r));
  return g / max(length(g), 1e-5);
}

// ── Light ─────────────────────────────────────────────────────────────────

float strip(float x, float from, float to) {
  return smoothstep(from - 0.04, from + 0.02, x) * (1.0 - smoothstep(to - 0.02, to + 0.06, x));
}

// Polished chrome: a mirror in a bright white studio. What makes metal read as
// shiny rather than grey is contrast, so the sky is blown nearly to white and
// the horizon is a hard, nearly black line just below eye level, with a mid
// grey floor beneath it. Two crisp light strips and a hot key glint sit on
// top. Any surface turning through the horizon draws a sharp dark line, and
// any facing up or toward a strip flashes white.
float mirror(vec3 r) {
  float sky = smoothstep(-0.2, 0.05, r.y);
  float lit = mix(0.12 + 0.4 * smoothstep(-0.9, -0.3, r.y),
                  1.9 + 0.9 * smoothstep(0.2, 0.9, r.y) + 0.5 * smoothstep(-0.3, 0.4, r.x), sky);
  lit *= 1.0 - 0.92 * exp(-pow((r.y + 0.22) / 0.11, 2.0));
  lit += strip(r.x, 0.34, 0.41) * 2.5 + strip(-r.x, 0.52, 0.58) * 1.6;
  lit += pow(max(dot(r, normalize(vec3(0.5, 0.62, 0.6))), 0.0), 120.0) * 8.0;
  return lit;
}

vec3 mirrorOf(vec3 n, vec3 v) {
  return vec3(mirror(reflect(-v, n))) * vec3(0.95, 0.97, 1.0);
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

// ── The frame ─────────────────────────────────────────────────────────────

// Three raised strokes across a corner of the frame's face. q is in a space
// where the corner in question is the top-left one.
vec3 notches(vec2 q, float flip, vec2 hs, float u, float bead, float face,
             vec3 base, vec3 v, float px) {
  vec2 c0 = vec2(-hs.x + bead + face * 0.5, hs.y - bead - face * 0.5);
  vec2 along = vec2(0.70710678, 0.70710678);
  vec2 across = vec2(0.70710678, -0.70710678);
  // Never thinner than a hairline, or they vanish at small sizes.
  float r = max(1.0 * u, 0.7);
  float gap = max(3.3 * u, 2.0);
  float reach = max(4.2 * u, 2.6);
  float best = 1e5;
  vec2 grad = vec2(0.0);
  for (int k = -1; k <= 1; k++) {
    vec2 m = c0 + across * float(k) * gap;
    vec2 a = m - along * reach;
    vec2 ba = along * reach * 2.0;
    float h = clamp(dot(q - a, ba) / dot(ba, ba), 0.0, 1.0);
    vec2 off = q - (a + ba * h);
    float d = length(off) - r;
    if (d < best) {
      best = d;
      grad = off / max(length(off), 1e-5);
    }
  }
  // A cut either side, so the strokes read as set into the face.
  vec3 col = base * (0.45 + 0.55 * smoothstep(0.0, 0.7 * u, best));
  vec3 stroke = mirrorOf(tilt(grad * flip, beadSlope(-best / r)), v);
  return mix(col, stroke, clamp(0.5 - best / px, 0.0, 1.0));
}

vec3 frame(vec2 p, vec2 hs, float u, float rOut, float bead, float face,
           float bevel, vec2 chHalf, float rCh, vec3 v, float px) {
  float e = -sdBox(p, hs, rOut);   // depth in from the outer edge
  float dCh = sdBox(p, chHalf, rCh); // distance out from the channel

  if (e < bead) {
    // The outer lip.
    return mirrorOf(tilt(sdBoxGrad(p, hs, rOut), beadSlope(e / bead)), v);
  }

  if (dCh < bevel) {
    // The inner bevel, falling into the channel.
    float t = 1.0 - dCh / bevel;
    float slope = t / sqrt(max(1.0 - t * t, 0.03));
    return mirrorOf(tilt(-sdBoxGrad(p, chHalf, rCh), slope), v);
  }

  // The face: crowned, so as it turns across its width it runs from white
  // through the studio's dark horizon line — the banding that reads as chrome.
  float w = (e - bead) / max(e - bead + dCh - bevel, 1e-3);
  vec3 col = mirrorOf(tilt(sdBoxGrad(p, hs, rOut), 0.5 * cos(PI * w)), v);
  col = notches(p, 1.0, hs, u, bead, face, col, v, px);
  col = notches(-p, -1.0, hs, u, bead, face, col, v, px);
  return col;
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

vec3 channel(vec2 p, vec2 chHalf, float rCh, float u, vec3 v, float px) {
  float hc = chHalf.y * 2.0;
  float wc = chHalf.x * 2.0;
  float t = u_time;
  vec2 c = vec2(p.x + chHalf.x, p.y);
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

  // Recessed: shaded along the walls, and in the shadow of the upper lip.
  float inset = -sdBox(p, chHalf, rCh);
  col *= mix(0.5, 1.0, smoothstep(0.0, 6.0 * u, inset));
  col *= mix(0.75, 1.0, smoothstep(0.0, 14.0 * u, chHalf.y - p.y));

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

void main() {
  vec2 p = gl_FragCoord.xy / u_dpr - u_canvas * 0.5;
  float px = 1.0 / u_dpr;
  float u = u_size.y / 110.0;
  vec2 hs = u_size * 0.5;

  // The bevels keep a minimum width in px, so the frame still draws its lines
  // at the small sizes the indicator is shown at.
  float rOut = max(6.0 * u, 2.5);
  float bead = max(3.0 * u, 1.6);
  float face = 11.0 * u;
  float bevel = max(2.4 * u, 1.3);
  vec2 chHalf = hs - (bead + face + bevel);
  float rCh = max(3.0 * u, 1.5);

  // A perspective eye a little further off than the object is wide, so a
  // flat face still sweeps through the reflections from one end to the other.
  vec3 v = normalize(vec3(-p, u_size.x * 1.1));

  float dOut = sdBox(p, hs, rOut);
  float cover = clamp(0.5 - dOut / px, 0.0, 1.0);

  vec3 col = vec3(0.0);
  if (cover > 0.0) {
    bool metal = sdBox(p, chHalf, rCh) > 0.0;
    col = metal
      ? frame(p, hs, u, rOut, bead, face, bevel, chHalf, rCh, v, px)
      : channel(p, chHalf, rCh, u, v, px);
    col += vec3(sweep(p, hs)) * (metal ? 1.0 : 0.08);
  }
  col = 1.0 - exp(-col * 1.15);

  // Outside it: a pocket of shadow, so it sits in its own darkness on a light
  // page, and glints flaring off the corners the light hits.
  float shadow = 0.6 * exp(-max(dOut, 0.0) / (7.0 * u));
  float glow = glint(p - vec2(-hs.x + 1.5 * u, hs.y - 1.5 * u), u)
             + glint(p - vec2(hs.x - 1.5 * u, hs.y - 1.5 * u), u) * 0.8
             + glint(p - vec2(hs.x - 1.5 * u, -hs.y + 1.5 * u), u) * 0.55;
  glow *= 0.85;

  vec3 rgb = col * cover + vec3(glow);
  float a = cover + (1.0 - cover) * shadow;
  a = max(a, clamp(glow, 0.0, 1.0));
  gl_FragColor = vec4(min(rgb, vec3(a)), a);
}
`;
