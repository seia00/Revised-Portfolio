/**
 * The river of light, drawn as a ribbon laid along its course.
 *
 * Every vertex carries where it is across the channel (0 mid-stream, ±1 at the
 * banks, further out for the glow) and how far it is down the course in px, so
 * the water can be made to move along the river however the course bends: the
 * texture is simply slid down that second coordinate over time.
 */

export const VERTEX = /* glsl */ `
attribute vec2 a_position; // section px
attribute vec2 a_flow;     // x: across, in bank half-widths; y: px down the course
attribute float a_half;    // the bank half-width here, px
uniform vec2 u_view;       // the canvas, CSS px
uniform float u_offset;    // section-y at the top of the canvas
varying vec2 v_flow;
varying float v_half;
void main() {
  vec2 p = a_position - vec2(0.0, u_offset);
  gl_Position = vec4(p.x / u_view.x * 2.0 - 1.0, 1.0 - p.y / u_view.y * 2.0, 0.0, 1.0);
  v_flow = a_flow;
  v_half = a_half;
}
`;

export const FRAGMENT = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float u_time;
uniform float u_head;  // px down the course the light has reached
uniform float u_calm;  // 1 when the river is shown complete and still
uniform float u_length; // the course's whole length, px
varying vec2 v_flow;
varying float v_half;

const mat2 TURN = mat2(0.8, 0.6, -0.6, 0.8);

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = TURN * p * 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  float u = v_flow.x;
  float s = v_flow.y;
  float w = v_half;
  float t = u_time;
  float bank = abs(u);

  // Mid-stream runs fastest and the water at the banks barely moves — the
  // velocity profile of any real channel, and what makes this read as a river
  // rather than a pattern sliding along a line.
  float pace = 1.0 - 0.65 * u * u;

  // The current: long streaks stretched down the channel and carried
  // downstream at the local pace, in two layers moving at different speeds.
  float slow = fbm(vec2(u * 2.6, (s - t * 110.0 * pace) / (w * 9.0)));
  float fast = fbm(vec2(u * 3.0 + 7.0, (s - t * 170.0 * pace) / (w * 5.0)));
  float lines = smoothstep(0.1, 0.4, slow) * 0.32 + smoothstep(0.2, 0.42, fast) * 0.22;

  // Ripples: crests running across the stream and travelling down it. The
  // water at the banks is slower, so the crests lag there and bend back into
  // chevrons; the current pushes them out of true as they go.
  float ripple = sin((s - t * 90.0 * pace) / (w * 0.65) + slow * 3.0 + u * u * 2.0);
  float crest = smoothstep(0.7, 1.0, ripple) * (0.4 + 0.35 * smoothstep(0.0, 0.4, fast));

  // Strands: three fine bright cords of current braiding down the channel,
  // each swinging across it and back over its own length, the braid
  // travelling downstream as it goes.
  float strands = 0.0;
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    float c = 0.55 * sin(s / (w * (6.0 + 1.7 * fk)) - t * (1.1 + 0.3 * fk) + fk * 2.1);
    float d = (u - c) / 0.07;
    strands += exp(-d * d) * 0.3 * (0.6 + 0.4 * slow);
  }

  // Glints: sparse, sharp points of light riding the fastest water.
  float g = noise(vec2(u * 6.0, (s - t * 260.0 * pace) / (w * 0.7)));
  float glint = pow(max(g, 0.0) * 2.0, 10.0) * 1.5;

  // The water itself is dim — deeper at the banks, a little lighter
  // mid-stream — so the moving light on it is what reads. A fine bright line
  // marks each shore, and a soft glow spills past it onto the dark.
  float inside = 1.0 - smoothstep(0.82, 1.0, bank);
  float depth = 0.06 + 0.1 * (1.0 - bank * bank);
  float shore = exp(-pow((bank - 0.92) / 0.05, 2.0)) * 0.35;
  float halo = exp(-pow(max(bank - 0.9, 0.0) * 1.6, 2.0)) * 0.12 * step(0.9, bank);
  float light = inside * (depth + lines + crest + strands + glint) + shore + halo;

  // Only as far as the light has reached, with a bloom at the frontier.
  float behind = u_head - s;
  light *= smoothstep(-w * 0.2, w * 1.5, behind);
  light += exp(-pow(behind / (w * 1.2), 2.0)) * exp(-bank * bank * 1.2) * 1.4 * (1.0 - u_calm);

  // Rising out of nothing at the source and dissolving into the dark at the
  // mouth, bloom and all, rather than starting and stopping on a cut.
  light *= smoothstep(0.0, w * 3.0, s) * smoothstep(u_length, u_length - w * 5.0, s);

  float a = clamp(light, 0.0, 1.0);
  gl_FragColor = vec4(vec3(0.92, 0.95, 1.0) * a, a);
}
`;
