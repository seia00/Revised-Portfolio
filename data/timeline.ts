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
    place: "Chiba, Japan",
    title: "Roots.",
    body: "Born in Chiba. The version of me that exists now was first shaped by an island that values precision, deference, and the long view.",
  },
  {
    year: "—",
    place: "Cupertino, California",
    title: "Crossing.",
    body: "Spent formative years in Cupertino. The collision of two cultures — one quiet, one loud — became the lens I see most things through.",
  },
  {
    year: "—",
    place: "Shibuya Makuhari",
    title: "Top 10 high school.",
    body: "Accepted into one of the top high schools in Japan. The first time the work I put in actually compounded.",
  },
  {
    year: "2024",
    place: "International circuit",
    title: "Debate.",
    body: "Started competing seriously. Grand Finalist at Sophistry WSDC. 2nd Best Speaker. Years of reading suddenly had somewhere to go.",
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
