/**
 * "Where I'm at right now" — current work, rendered by <Activities />.
 */

export interface Activity {
  n: string;
  title: string;
  tag: string;
  summary: string;
  points: string[];
}

export const ACTIVITIES: Activity[] = [
  {
    n: "01",
    title: "Memora",
    tag: "Research",
    summary:
      "Research on industrial implementations of memory graphs and machine learning principles in workflow optimization at care facilities.",
    points: ["Affiliated with UTokyo, Waseda & Ritsumeikan"],
  },
  {
    n: "02",
    title: "Debate",
    tag: "Competitive speech & debate",
    summary:
      "Multiple international awards at collegiate tournaments, competing at the top of the circuit.",
    points: ["WSDC Team Japan finalist", "Published in the Asahi Shimbun"],
  },
  {
    n: "03",
    title: "EN2U",
    tag: "Non-profit",
    summary:
      "Co-founded a peer-led English education network, now running across three continents.",
    points: [
      "Asia, South America & Africa",
      "Guatemala, Palestine & Afghanistan",
      "300+ students reached and climbing",
    ],
  },
];
