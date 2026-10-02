/**
 * A drifting liquid-metal ground.
 *
 * Chrome has no colour of its own — it is only the light it bends — so this is
 * built entirely from the neutral scale the rest of the site uses: one slow
 * conic sweep for the specular ramp, and two highlights riding over it at
 * different rates and in different directions, so the surface never quite
 * repeats. Every layer moves on `transform` alone to stay on the compositor.
 *
 * The hands were cut off a flat key colour, so their transparent ground lets
 * this read straight through the composition rather than behind a grey card.
 */
export default function LiquidMetal({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`liquid-metal ${className}`}>
      <span className="lm-sweep" />
      <span className="lm-pool-a" />
      <span className="lm-pool-b" />
    </div>
  );
}
