# Eye with blades

A horizontally stretched almond with a needle-thin blade off each end, drawn
as a white outline on black. The viewBox is `0 0 2266 1488`, and the shape
sits on a center line at y ≈ 820, spanning x 70–2215 and y 655–940.

- `eye-blades.svg`: the clean outline, one path.
- `eye-blades-sketch.svg`: the hand-drawn take, four overlapping pencil
  passes plus a few stray overshoots at the corners.
- `generate.mjs`: draws both from the same anchors. Edit it, then run
  `node generate.mjs` to rewrite the SVGs.

## The path

```
M 70 813                                   left tip
L 400 802                                  left blade, top edge
C 640 713.8  920 655  1200 655             almond, top-left quarter
C 1434.5 655  1669 721.8  1870 822         almond, top-right quarter
L 2215 825                                 right blade, top edge
L 1870 838                                 right blade, bottom edge
C 1669 899.2  1434.5 940  1200 940         almond, bottom-right quarter
C 920 940  640 891.2  400 818              almond, bottom-left quarter
L 70 813                                   left blade, bottom edge
Z
```

- **`M` / `Z`** start and close the loop on the left tip itself, so the
  point stays sharp rather than being rounded off by a join.
- **`L`, straight lines, for the blades.** Each blade is two edges from its
  corner on the almond to a shared tip. The base is only 16 units tall
  (802–818 on the left, 822–838 on the right), so the edges meet at a very
  acute angle. The right blade is 345 long against the left's 330, and sits a
  little lower, which makes it read as longer and more angular.
- **`C`, cubic Béziers, for the almond:** four quarters, each running from a
  blade corner to a peak.
  - The **first handle** leaves the corner 30% of the way across and 60% of
    the way up. That sets how steeply the almond lifts off the blade.
  - The **second handle** arrives at the peak level, from 35% of the way back.
    Because it's level, the top and bottom are smooth and widest at x = 1200.

## Tweaking it

All of these live at the top of `generate.mjs`.

| To change | Move |
| --- | --- |
| How tall the eye is | `ANCHORS.top` / `ANCHORS.bottom` (the peaks) |
| Where the blades start | the four corner anchors (`leftTop`, `leftBottom`, `rightTop`, `rightBottom`) |
| Blade length | `leftTip` / `rightTip` |
| Blade thickness at the base | the gap between each pair of corner anchors |
| How full or pointed the almond is | `BULGE.along`, `BULGE.rise`, `BULGE.level` (bigger is fuller) |
| The hand-drawn take | `SEED` for a different one; in `pass()`, the wobble size (±6) and how far from the tips it fades out (90) |
