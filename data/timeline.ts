/**
 * Life milestones rendered by <RiverLife />.
 *
 * `stage` names the milestone's place in the river the section draws — the
 * narrative runs left to right along a single moving line of light, and these
 * are the points it passes through.
 */

export interface Milestone {
  age: number;
  place: string;
  stage: string;
  title: string;
  body: string;
}

export const TIMELINE: Milestone[] = [
  {
    age: 7,
    place: "Japan → United States",
    stage: "Source",
    title: "Moved to America.",
    body: "Left Japan for the United States at seven — the first of several resets that taught me how to adapt fast and start over.",
  },
  {
    age: 10,
    place: "United States",
    stage: "First current",
    title: "Wrote my first line of code.",
    body: "Started programming at ten. The first time building something out of nothing felt like a superpower — I haven't stopped since.",
  },
  {
    age: 12,
    place: "United States → Japan",
    stage: "The bend",
    title: "Moved back to Japan.",
    body: "Returned to Japan at twelve, rebuilding a sense of home for the second time and relearning the language and culture from the inside.",
  },
  {
    age: 14,
    place: "Japan",
    stage: "Open water",
    title: "Started my first business.",
    body: "Launched my first business at fourteen — the point where ideas stopped being things I had and started being things I shipped.",
  },
];
