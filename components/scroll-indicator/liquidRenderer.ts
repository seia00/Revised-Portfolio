import { FRAGMENT, VERTEX } from "./shader";

/** What the renderer reads from the page on every frame. */
export type LiquidInput = {
  /** How far down the page the reader is, 0..1. */
  progress: number;
  /** How fast that is changing, in progress per second; signed. */
  velocity: number;
};

export type LiquidRenderer = {
  /** Size the object, in CSS px, with `margin` of room around it for its glow. */
  resize(width: number, height: number, margin: number, dpr: number): void;
  /** Animate continuously until `stop`. */
  start(): void;
  stop(): void;
  /** Draw a single frame without advancing time — for reduced motion. */
  draw(): void;
  destroy(): void;
};

/** The longest step the animation will take, so a stalled tab does not lurch. */
const MAX_STEP = 1 / 20;

/** The liquid's own pace, before the page stirs it. */
const PACE = 1.6;

/** How much the page's speed stirs the liquid, the most it can, and how fast
 *  the stirring dies away once the page stops (per second). */
const STIR = 18;
const MAX_STIR = 2.5;
const STIR_DECAY = 4;

/**
 * The slosh: a spring the scroll speed pulls on, damped well short of critical
 * so the liquid surges with the page and rocks back and forth a few times
 * after it stops, settling in about a second and a half.
 */
const SLOSH_GAIN = 14;
const MAX_SURGE = 1.4;
const SLOSH_STIFFNESS = 38;
const SLOSH_DAMPING = 3.6;
const SLOSH_SUBSTEP = 1 / 120;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error("ScrollIndicator: shader failed to compile", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function link(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.error("ScrollIndicator: program failed to link", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

/**
 * Draws the indicator into `canvas`, or returns null where WebGL is not
 * available so the caller can fall back. `onLost` fires if the browser takes
 * the context away later (a GPU reset, too many contexts).
 */
export function createLiquidRenderer(
  canvas: HTMLCanvasElement,
  read: () => LiquidInput,
  onLost: () => void
): LiquidRenderer | null {
  const context = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const program = link(gl);
  if (!program) return null;
  gl.useProgram(program);

  // One triangle that covers the whole canvas.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = {
    canvas: gl.getUniformLocation(program, "u_canvas"),
    dpr: gl.getUniformLocation(program, "u_dpr"),
    size: gl.getUniformLocation(program, "u_size"),
    time: gl.getUniformLocation(program, "u_time"),
    progress: gl.getUniformLocation(program, "u_progress"),
    slosh: gl.getUniformLocation(program, "u_slosh"),
    stir: gl.getUniformLocation(program, "u_stir"),
  };

  let width = 0;
  let height = 0;
  let margin = 0;
  let dpr = 1;
  // Start somewhere into the flow rather than at its origin, where the noise
  // field is at its least interesting.
  let time = 40;
  let frame = 0;
  let last = 0;
  let running = false;
  let slosh = 0;
  let sloshSpeed = 0;
  let stir = 0;

  function paint() {
    if (width === 0 || height === 0) return;
    const { progress } = read();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniform.canvas, width + margin * 2, height + margin * 2);
    gl.uniform1f(uniform.dpr, dpr);
    gl.uniform2f(uniform.size, width, height);
    gl.uniform1f(uniform.time, time);
    gl.uniform1f(uniform.progress, clamp(progress, 0, 1));
    gl.uniform1f(uniform.slosh, slosh);
    gl.uniform1f(uniform.stir, stir);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Advance the liquid's motion by `step` seconds. */
  function advance(step: number) {
    const { velocity } = read();

    const surge = clamp(velocity * SLOSH_GAIN, -MAX_SURGE, MAX_SURGE);
    for (let left = step; left > 0; left -= SLOSH_SUBSTEP) {
      const h = Math.min(left, SLOSH_SUBSTEP);
      sloshSpeed += (SLOSH_STIFFNESS * (surge - slosh) - SLOSH_DAMPING * sloshSpeed) * h;
      slosh += sloshSpeed * h;
    }

    const stirred = Math.min(Math.abs(velocity) * STIR, MAX_STIR);
    stir = stirred > stir ? stirred : stir + (stirred - stir) * (1 - Math.exp(-step * STIR_DECAY));

    time += step * (PACE + stir);
  }

  function tick(now: number) {
    const step = last === 0 ? 0 : Math.min((now - last) / 1000, MAX_STEP);
    last = now;
    advance(step);
    paint();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  function lost(event: Event) {
    event.preventDefault();
    stop();
    onLost();
  }
  canvas.addEventListener("webglcontextlost", lost);

  return {
    resize(w, h, m, ratio) {
      width = w;
      height = h;
      margin = m;
      dpr = ratio;
      canvas.width = Math.round((w + m * 2) * ratio);
      canvas.height = Math.round((h + m * 2) * ratio);
      paint();
    },
    start() {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    },
    stop,
    draw: paint,
    destroy() {
      stop();
      canvas.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
