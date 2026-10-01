/**
 * Life milestones rendered by <Timeline />.
 */

export interface Milestone {
  age: string;
  place: string;
  title: string;
  body: string;
}

export const TIMELINE: Milestone[] = [
  {
    age: "Age 7",
    place: "Japan → United States",
    title: "Moved to America.",
    body: "Left Japan for the United States at seven — the first of several resets that taught me how to adapt fast and start over.",
  },
  {
    age: "Age 10",
    place: "United States",
    title: "Wrote my first line of code.",
    body: "Started programming at ten. The first time building something out of nothing felt like a superpower — I haven't stopped since.",
  },
  {
    age: "Age 12",
    place: "United States → Japan",
    title: "Moved back to Japan.",
    body: "Returned to Japan at twelve, rebuilding a sense of home for the second time and relearning the language and culture from the inside.",
  },
  {
    age: "Age 14",
    place: "Japan",
    title: "Started my first business.",
    body: "Launched my first business at fourteen — the point where ideas stopped being things I had and started being things I shipped.",
  },
];
