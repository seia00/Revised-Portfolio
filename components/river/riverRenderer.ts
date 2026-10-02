import { FRAGMENT, VERTEX } from "./riverShader";

/** What the renderer reads from the page each time it draws. */
export type RiverInput = {
  /** Section-y at the top of the canvas, px. */
  offset: number;
  /** How far down the course the light has reached, px. */
  head: number;
};

export type RiverRenderer = {
  /**
   * Lay the river along a course: `points` is x, y pairs in section px,
   * evenly spaced along it, `length` its total length, and `widest` the bank
   * half-width it grows to by the mouth.
   */
  setCourse(points: Float32Array, length: number, widest: number): void;
  resize(width: number, height: number, dpr: number): void;
  /** Animate continuously until `stop`. */
  start(): void;
  stop(): void;
  /** Draw once at the current time — on scroll, and for reduced motion. */
  draw(): void;
  destroy(): void;
};

/** How far past each bank the glow is laid, in bank half-widths. */
const OUTER = 2.4;

/** The source is a trickle: the river widens from this to `widest`, px. */
const NARROWEST = 2.5;

/** How quickly it widens: under 1, so most of the widening is early on. */
const WIDENING = 0.6;

/**
 * The river's bank half-width, px, a `fraction` of the way down a course that
 * widens to `widest`: a trickle at the source, broadening as it goes.
 */
export function bankHalfWidth(fraction: number, widest: number): number {
  return NARROWEST + (widest - NARROWEST) * Math.max(0, fraction) ** WIDENING;
}

/** The longest step the animation will take, so a stalled tab does not lurch. */
const MAX_STEP = 1 / 20;

/** Floats per vertex: position (2), flow (2), half-width (1). */
const STRIDE = 5;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error("RiverLife: shader failed to compile", gl.getShaderInfoLog(shader));
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
  console.error("RiverLife: program failed to link", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

/**
 * A strip of quads along the course: each sample becomes a pair of vertices
 * either side of it, pushed out along the course's normal to the glow's edge.
 */
function ribbon(points: Float32Array, length: number, widest: number): Float32Array {
  const count = points.length / 2;
  const out = new Float32Array(count * 2 * STRIDE);
  for (let i = 0; i < count; i++) {
    const prev = Math.max(0, i - 1);
    const next = Math.min(count - 1, i + 1);
    const tx = points[next * 2] - points[prev * 2];
    const ty = points[next * 2 + 1] - points[prev * 2 + 1];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;

    const along = (i / (count - 1)) * length;
    const half = bankHalfWidth(along / length, widest);
    const x = points[i * 2];
    const y = points[i * 2 + 1];

    for (let side = 0; side < 2; side++) {
      const across = side === 0 ? -OUTER : OUTER;
      const o = (i * 2 + side) * STRIDE;
      out[o] = x + nx * half * across;
      out[o + 1] = y + ny * half * across;
      out[o + 2] = across;
      out[o + 3] = along;
      out[o + 4] = half;
    }
  }
  return out;
}

/**
 * Draws the river into `canvas`, or returns null where WebGL is not available
 * so the caller can fall back. `onLost` fires if the browser takes the context
 * away later.
 */
export function createRiverRenderer(
  canvas: HTMLCanvasElement,
  read: () => RiverInput,
  options: { calm: boolean; onLost: () => void }
): RiverRenderer | null {
  const context = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const program = link(gl);
  if (!program) return null;
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const bytes = Float32Array.BYTES_PER_ELEMENT;
  const attribute = (name: string, size: number, offset: number) => {
    const at = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, size, gl.FLOAT, false, STRIDE * bytes, offset * bytes);
  };
  attribute("a_position", 2, 0);
  attribute("a_flow", 2, 2);
  attribute("a_half", 1, 4);

  const uniform = {
    view: gl.getUniformLocation(program, "u_view"),
    offset: gl.getUniformLocation(program, "u_offset"),
    time: gl.getUniformLocation(program, "u_time"),
    head: gl.getUniformLocation(program, "u_head"),
    calm: gl.getUniformLocation(program, "u_calm"),
    length: gl.getUniformLocation(program, "u_length"),
  };

  let vertices = 0;
  let course = 0;
  let width = 0;
  let height = 0;
  let time = 20;
  let frame = 0;
  let last = 0;
  let running = false;

  function paint() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (vertices === 0 || width === 0 || height === 0) return;
    const { offset, head } = read();
    gl.uniform2f(uniform.view, width, height);
    gl.uniform1f(uniform.offset, offset);
    gl.uniform1f(uniform.time, time);
    gl.uniform1f(uniform.head, head);
    gl.uniform1f(uniform.calm, options.calm ? 1 : 0);
    gl.uniform1f(uniform.length, course);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices);
  }

  function tick(now: number) {
    const step = last === 0 ? 0 : Math.min((now - last) / 1000, MAX_STEP);
    last = now;
    time += step;
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
    options.onLost();
  }
  canvas.addEventListener("webglcontextlost", lost);

  return {
    setCourse(points, length, widest) {
      const data = ribbon(points, length, widest);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      vertices = data.length / STRIDE;
      course = length;
      paint();
    },
    resize(w, h, dpr) {
      width = w;
      height = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      paint();
    },
    start() {
      if (running || options.calm) return;
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
