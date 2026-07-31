/**
 * Sun emblem — the hero's centrepiece, in place of the Spline scene.
 *
 * Indigo sunburst with the SF monogram at its core. Entirely CSS (see the
 * `.sun-*` block in globals.css): two counter-rotating ray rings, a
 * breathing corona, and a solid disc carrying the mark. No client JS, no
 * WebGL, nothing to wait on — which is why the loading curtain no longer
 * has to gate anything.
 */
export default function SunEmblem() {
  return (
    <div className="sun" aria-hidden>
      <div className="sun-corona" />
      <div className="sun-rays" />
      <div className="sun-rays-fine" />
      <div className="sun-ring" />
      <div className="sun-disc">
        <span className="sun-mark">SF</span>
      </div>
    </div>
  );
}
