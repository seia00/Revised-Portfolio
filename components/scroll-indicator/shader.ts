/**
 * The scroll indicator, drawn as one object in one pass: a machined chrome
 * frame around a recessed channel of glossy black liquid, under glass.
 *
 * Everything is shaded the same way — a surface normal reflected into a single
 * procedural studio environment — so the frame's bevels and the liquid's crests
 * catch the same lights and read as parts of one physical thing. Units are CSS
 * pixels, scaled from a design height of 110 (`u`), so the object keeps its
 * proportions at any size.
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

const float PI = 3.14159265;
const mat2 TURN = mat2(0.8, 0.6, -0.6, 0.8);

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

// ── Noise ─────────────────────────────────────────────────────────────────

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

// Gradient noise with a quintic fade, so its slopes are smooth too — the
// liquid is lit by its slopes, and a cubic fade leaves creases in them.
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = TURN * p * 2.03;
    a *= 0.5;
  }
  return v;
}

float fbm4(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = TURN * p * 2.03;
    a *= 0.5;
  }
  return v;
}

// ── Light ─────────────────────────────────────────────────────────────────

// A dark studio: a wide softbox overhead, a strip to the right, dimmer fills
// left and below, a hard key up and to the right, and a little light from
// every grazing angle so every bevel draws a line.
float env(vec3 r) {
  float top = smoothstep(0.2, 0.8, r.y) * (1.0 - smoothstep(0.35, 1.0, abs(r.x)));
  float right = smoothstep(0.5, 0.95, r.x) * (1.0 - smoothstep(0.3, 0.9, abs(r.y)));
  float left = smoothstep(0.6, 0.98, -r.x) * 0.45;
  float bottom = smoothstep(0.55, 0.95, -r.y) * 0.4;
  float rim = smoothstep(0.75, 0.98, length(r.xy)) * 0.35;
  float key = pow(max(dot(r, normalize(vec3(0.5, 0.62, 0.6))), 0.0), 80.0) * 5.0;
  return 0.015 + top * 1.4 + right * 0.95 + left + bottom + rim + key;
}

vec3 chrome(vec3 n, vec3 v) {
  return vec3(env(reflect(-v, n))) * vec3(0.93, 0.95, 0.98);
}

float strip(float x, float from, float to) {
  return smoothstep(from - 0.04, from + 0.02, x) * (1.0 - smoothstep(to - 0.02, to + 0.06, x));
}

// The same studio seen in something glossier: the lights resolve into narrow
// strips, so a curved surface draws them out into long, clean streaks.
float gloss(vec3 r) {
  float top = strip(r.y, 0.38, 0.62) * (1.0 - smoothstep(0.4, 0.9, abs(r.x)));
  float side = strip(r.x, 0.5, 0.62) * 0.8;
  float under = strip(-r.y, 0.55, 0.65) * 0.25;
  float key = pow(max(dot(r, normalize(vec3(0.45, 0.6, 0.66))), 0.0), 160.0) * 6.0;
  return 0.008 + top * 1.6 + side + under + key;
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
  float r = 1.0 * u;
  float best = 1e5;
  vec2 grad = vec2(0.0);
  for (int k = -1; k <= 1; k++) {
    vec2 m = c0 + across * float(k) * 3.3 * u;
    vec2 a = m - along * 4.2 * u;
    vec2 ba = along * 8.4 * u;
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
  vec3 stroke = chrome(tilt(grad * flip, beadSlope(-best / r)), v);
  return mix(col, stroke, clamp(0.5 - best / px, 0.0, 1.0));
}

vec3 frame(vec2 p, vec2 hs, float u, float rOut, float bead, float face,
           float bevel, vec2 chHalf, float rCh, vec3 v, float px) {
  float e = -sdBox(p, hs, rOut);   // depth in from the outer edge
  float dCh = sdBox(p, chHalf, rCh); // distance out from the channel

  if (e < bead) {
    // The outer lip.
    return chrome(tilt(sdBoxGrad(p, hs, rOut), beadSlope(e / bead)), v);
  }

  if (dCh < bevel) {
    // The inner bevel, falling into the channel.
    float t = 1.0 - dCh / bevel;
    float slope = t / sqrt(max(1.0 - t * t, 0.03));
    return chrome(tilt(-sdBoxGrad(p, chHalf, rCh), slope), v);
  }

  // The face: smoked, polished, and very slightly crowned, so it carries a
  // soft band of reflection rather than reading as a flat fill — brightest
  // toward the upper right, with a fainter answer at the lower left.
  float w = (e - bead) / max(e - bead + dCh - bevel, 1e-3);
  vec3 n = tilt(sdBoxGrad(p, hs, rOut), 0.3 * cos(PI * w));
  vec3 r = reflect(-v, n);
  vec3 col = chrome(n, v) * 0.75
           + 0.3 * smoothstep(0.1, 0.55, 0.9 * (r.x + r.y))
           + 0.16 * smoothstep(0.15, 0.55, -0.9 * (r.x + r.y));
  col = notches(p, 1.0, hs, u, bead, face, col, v, px);
  col = notches(-p, -1.0, hs, u, bead, face, col, v, px);
  return col;
}

// ── The liquid ────────────────────────────────────────────────────────────

// Where the liquid's leading edge is, at height y. It advances with the scroll,
// wavers on its own, and is rounded off against the walls like a drop.
float frontEdge(float y, float t, float hc, float wc) {
  float yn = clamp(y / (hc * 0.5), -1.0, 1.0);
  float x = mix(hc * 0.55, wc + hc * 1.6, u_progress);
  x += fbm3(vec2(yn * 1.2 + 7.0, t * 0.2)) * hc * 0.7;
  x -= hc * 0.4 * (1.0 - sqrt(max(1.0 - yn * yn, 0.0)));
  return x;
}

// Where two flows meet they fuse with a fillet, as liquid does, rather than
// crossing with a crease.
float smax(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(a, b, h) + k * h * (1.0 - h);
}

// The body of the liquid: three ribbons running along the channel, each on its
// own winding course at its own speed, swelling and thinning into tendrils as
// they go, and fusing wherever their courses meet. Three bulbs drift up and
// down the channel through them, each on its own slow period, so blobs gather
// and separate. A slow swell underneath keeps the gaps from going dead flat.
// len is the channel's length in channel heights.
float flow(vec2 q, float t, float len) {
  float h = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float x = q.x * (0.42 + 0.1 * fi) - t * (0.045 + 0.014 * fi);
    float centre = 1.0 * noise(vec2(x * 1.0, fi * 3.7 + t * 0.03))
                 + 0.25 * noise(vec2(x * 2.0, fi * 9.1 - t * 0.05));
    centre = clamp(centre, -0.3, 0.3);
    float width = 0.13 + 0.2 * smoothstep(-0.2, 0.4,
      noise(vec2(x * 1.1 + 5.0, fi * 2.3 + t * 0.04)));
    float d = (q.y - centre) / width;
    h = smax(h, exp(-d * d) * (0.8 + 0.2 * fi / 2.0), 0.25);
  }
  for (int j = 0; j < 3; j++) {
    float fj = float(j);
    vec2 at = vec2(len * (0.5 + 0.46 * sin(t * (0.021 + 0.009 * fj) + fj * 2.1)),
                   0.2 * sin(t * (0.05 + 0.017 * fj) + fj * 1.7));
    float r = 0.24 + 0.07 * sin(t * 0.07 + fj * 2.9);
    vec2 d = (q - at) / r;
    h = smax(h, exp(-dot(d, d)) * 0.95, 0.28);
  }
  return h + 0.08 * noise(vec2(q.x * 0.45 - t * 0.02, q.y * 1.2 + t * 0.03));
}

// Height of the liquid at c (channel px, x from the left wall): crowned across
// the channel, swelling with the flow, and rising sharply at its front edge.
float liquid(vec2 c, float t, float hc, float wc) {
  float ahead = frontEdge(c.y, t, hc, wc) - c.x;
  if (ahead <= 0.0) return 0.0;
  float k = 1.0 - clamp(ahead / (hc * 0.5), 0.0, 1.0);
  float head = 1.0 - k * k * k;
  float yn = c.y / (hc * 0.5);
  float crown = 1.0 - yn * yn;
  return head * (0.2 * crown + flow(c / hc, t, wc / hc));
}

vec3 channel(vec2 p, vec2 chHalf, float rCh, float u, vec3 v, float px) {
  float hc = chHalf.y * 2.0;
  float wc = chHalf.x * 2.0;
  float t = u_time;
  vec2 c = vec2(p.x + chHalf.x, p.y);

  float eps = max(0.6, hc * 0.012);
  float h0 = liquid(c, t, hc, wc);
  float hx = liquid(c + vec2(eps, 0.0), t, hc, wc);
  float hy = liquid(c + vec2(0.0, eps), t, hc, wc);
  float lift = hc * 0.16;
  vec3 n = normalize(vec3(-(hx - h0) / eps * lift, -(hy - h0) / eps * lift, 1.0));

  // Black, and almost a mirror: what reads is the light it throws back,
  // strongest where the surface turns away at its crests.
  float fres = 0.04 + 0.96 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 5.0);
  vec3 wet = vec3(0.006, 0.007, 0.009)
           + gloss(reflect(-v, n)) * mix(0.35, 1.0, fres) * vec3(0.9, 0.93, 0.97)
           + fres * 0.12;

  // The empty channel ahead of it: dark smoked metal, a shade lighter.
  vec3 dry = vec3(0.028, 0.029, 0.032) + env(reflect(-v, vec3(0.0, 0.0, 1.0))) * 0.04;

  float cover = clamp((frontEdge(c.y, t, hc, wc) - c.x) / px + 0.5, 0.0, 1.0);
  vec3 col = mix(dry, wet, cover);

  // Recessed: dark along the walls, and in the shadow of the upper lip.
  float inset = -sdBox(p, chHalf, rCh);
  col *= mix(0.3, 1.0, smoothstep(0.0, 6.0 * u, inset));
  col *= mix(0.55, 1.0, smoothstep(0.0, 14.0 * u, chHalf.y - p.y));

  // The glass over it: one soft diagonal sheen, a finer one beside it, and a
  // hairline catching the light just inside the walls.
  vec2 g = vec2(c.x / wc, p.y / hc + 0.5);
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

  float rOut = 6.0 * u;
  float bead = 3.0 * u;
  float face = 11.0 * u;
  float bevel = 2.4 * u;
  vec2 chHalf = hs - (bead + face + bevel);
  float rCh = 3.0 * u;

  // A perspective eye a little further off than the object is wide, so a
  // flat face still sweeps through the reflections from one end to the other.
  vec3 v = normalize(vec3(-p, u_size.x * 1.1));

  float dOut = sdBox(p, hs, rOut);
  float cover = clamp(0.5 - dOut / px, 0.0, 1.0);

  vec3 col = vec3(0.0);
  if (cover > 0.0) {
    col = sdBox(p, chHalf, rCh) > 0.0
      ? frame(p, hs, u, rOut, bead, face, bevel, chHalf, rCh, v, px)
      : channel(p, chHalf, rCh, u, v, px);
  }
  col = 1.0 - exp(-col * 1.15);

  // Outside it: a pocket of shadow, so it sits in its own darkness on a light
  // page, and glints flaring off the corners the light hits.
  float shadow = 0.6 * exp(-max(dOut, 0.0) / (7.0 * u));
  float glow = glint(p - vec2(-hs.x + 1.5 * u, hs.y - 1.5 * u), u)
             + glint(p - vec2(hs.x - 1.5 * u, hs.y - 1.5 * u), u) * 0.8
             + glint(p - vec2(hs.x - 1.5 * u, -hs.y + 1.5 * u), u) * 0.55;
  glow *= 0.55;

  vec3 rgb = col * cover + vec3(glow);
  float a = cover + (1.0 - cover) * shadow;
  a = max(a, clamp(glow, 0.0, 1.0));
  gl_FragColor = vec4(min(rgb, vec3(a)), a);
}
`;
