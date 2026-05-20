/**
 * Life milestones rendered by <Timeline />. Each entry illuminates as the
 * user scrolls past it.
 */

export interface Milestone {
  year: string;
  place: string;
  title: string;
  body: string;
}

export const TIMELINE: Milestone[] = [
  {
    year: "—",
    place: "Kyoto → Yokohama, Japan",
    title: "Roots.",
    body: "Born in Kyoto, but moved to Yokohama shortly after.",
  },
  {
    year: "—",
    place: "Cupertino, California",
    title: "Crossing.",
    body: "In my years in Cupertino I fell in love with technology and entrepreneurship — and with the idea that you can just build the thing you wish existed.",
  },
  {
    year: "—",
    place: "Shibuya Makuhari",
    title: "Prestigious high school.",
    body: "Accepted into a prestigious high school in Japan. The first time the work I put in actually compounded.",
  },
  {
    year: "2024 → now",
    place: "International circuit",
    title: "Debate.",
    body: "Top 8 candidate for WSDC Team Japan '26. Rookie Finalist and 2nd Best Speaker at Keio Debate Open — and many more across the circuit. Years of reading suddenly had somewhere to go.",
  },
  {
    year: "2025",
    place: "EN2U · Japan",
    title: "Built EN2U.",
    body: "Co-founded a non-profit connecting youth in underserved Japanese communities with peer-led English education. Built the platform end-to-end.",
  },
  {
    year: "2026",
    place: "AXYZ · Kythera Ventures",
    title: "CTO.",
    body: "Took on Chief Technology Officer at AXYZ and the Stratum AI solutions arm of Kythera Ventures. Currently shipping infrastructure for the people who shape the next decade of Japanese tech.",
  },
];
