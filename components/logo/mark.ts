/**
 * The monogram as vector outlines, traced from public/logo.png (851 × 523)
 * and squared up: every edge is axis-aligned except the two points of the
 * crossbar. Kept as separate closed loops, outer shapes and the one hole
 * alike, so each can be drawn as its own line; filled together with the
 * even-odd rule, the hole stays open.
 */
export const MARK_WIDTH = 851;
export const MARK_HEIGHT = 523;

export const MARK_LOOPS: readonly string[] = [
  // The left upright with its arms, the crossbar and the hook beneath it.
  "M154 28H333V66H200V104H357V145H200V182H357V223H200V289H819L850 312.5L819 336H200V480H595V431H333V356H377V394H637V522H154V336H32L1 312.5L32 289H154V171H102V104H154Z",
  // The cup above the crossbar.
  "M377 1H428V242H581V1H633V272H377Z",
  // The box inside it, and its hole.
  "M453 95H557V222H453Z",
  "M474 125V192H546V125Z",
  // The bar to its right.
  "M653 95H697V212H653Z",
];

/** All of it as one path, for filling and clipping (`evenodd`). */
export const MARK_PATH = MARK_LOOPS.join("");
