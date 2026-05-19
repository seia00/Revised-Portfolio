/**
 * Programming projects shown inside <ProgrammingGrid /> and expanded in
 * <ProjectModal /> when the user clicks "view projects".
 */

export interface Project {
  id: string;
  title: string;
  category: "AI" | "Database" | "Web" | "Personal";
  summary: string;
  description: string;
  stack: string[];
  link?: { label: string; href: string };
  status: "shipped" | "building" | "research";
}

export const PROJECTS: Project[] = [
  {
    id: "debate-slm",
    title: "Debate SLM",
    category: "AI",
    summary:
      "A custom small language model built specifically for competitive debate.",
    description:
      "Started as a GPT wrapper for case-prep automation; now mid-way through fine-tuning a custom SLM on a hand-curated corpus of WSDC / WUDC motions, judges' RFDs, and structured argument flows. Currently in the data-extraction phase.",
    stack: ["Python", "PyTorch", "Transformers", "Custom dataset"],
    link: {
      label: "Early version on GitHub",
      href: "https://github.com/seia00",
    },
    status: "building",
  },
  {
    id: "debate-db",
    title: "Global Debate Archive",
    category: "Database",
    summary:
      "Free, open-source database of every WUDC and WSDC motion from 2001 to present.",
    description:
      "A single global hub for debaters everywhere — searchable by year, format, region, and theme. Built to lower the access barrier for debaters who don't have institutional case-prep infrastructure.",
    stack: ["Next.js", "Postgres", "Vercel"],
    status: "building",
  },
  {
    id: "en2u-site",
    title: "EN2U Website",
    category: "Web",
    summary:
      "Site for a youth-led non-profit connecting 13–18 year olds who teach English to peers in underserved Japanese communities.",
    description:
      "Co-founded EN2U as a peer-mentorship network. I designed and built the public site — landing, mentor matching, and community signups.",
    stack: ["Next.js", "Tailwind", "Vercel"],
    link: { label: "Visit en2u.vercel.app", href: "https://en2u.vercel.app/" },
    status: "shipped",
  },
  {
    id: "portfolio",
    title: "This Portfolio",
    category: "Personal",
    summary:
      "What you're reading right now. Built to give people a clean way to see what I'm working on.",
    description:
      "Next.js 16 + Tailwind v4 + Framer Motion. Designed around typographic transitions: each section is its own editorial chapter with its own font family and motion personality.",
    stack: ["Next.js", "Tailwind v4", "Framer Motion", "TypeScript"],
    status: "shipped",
  },
];
