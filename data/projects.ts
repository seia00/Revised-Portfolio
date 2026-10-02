/**
 * Projects rendered by <ScrollMorph />, in the order they sit on the arc.
 *
 * `slug` names the screenshot at /public/projects/<slug>.webp. `kind` is the
 * line on the back of the card, taken from each project's own pitch.
 */

export interface Project {
  slug: string;
  name: string;
  kind: string;
}

export const PROJECTS: Project[] = [
  { slug: "brillick", name: "Brillick", kind: "A platform for Japan's student founders" },
  { slug: "memora", name: "Memora", kind: "A badge that turns care conversations into records" },
  { slug: "rikuaccel", name: "rikuaccel", kind: "Non-dilutive funding, ranked by how fast cash lands" },
  { slug: "en2u", name: "EN2U", kind: "Youth-led English curricula for teachers" },
  { slug: "larplink", name: "LarpLink", kind: "A career, composed as a story" },
  { slug: "kythera", name: "Kythera Ventures", kind: "A student-founded venture collective" },
  { slug: "youflix", name: "Youflix", kind: "A streaming front end" },
  { slug: "ai-impact-quest", name: "AI Impact Quest", kind: "The hidden cost of AI, as a game" },
  { slug: "backgain", name: "BackGainAI", kind: "Posture tracking that never leaves the browser" },
];
