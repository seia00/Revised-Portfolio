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
    id: "kythera",
    title: "Kythera Ventures",
    category: "Web",
    summary:
      "Homepage for my venture company — spanning tech and humanitarian work.",
    description:
      "The public face of Kythera Ventures — the umbrella covering AXYZ, Stratum AI Solutions, and the humanitarian arms. One cohesive home for everything we ship.",
    stack: ["Next.js", "Tailwind", "Vercel"],
    link: {
      label: "Visit kytheraventures.vercel.app",
      href: "https://kytheraventures.vercel.app/",
    },
    status: "shipped",
  },
  {
    id: "axis-japan",
    title: "Axis Japan",
    category: "Web",
    summary:
      "LinkedIn, Facebook, and Y Combinator — for student orgs in Japan, all in one.",
    description:
      "An advanced solution to the polarized student-organization environment within Japan. Profiles, communication, funding-style discovery — built to break the silos and connect the people actually doing the work.",
    stack: ["Next.js", "Tailwind", "Postgres", "Vercel"],
    link: {
      label: "Visit axisjapan.vercel.app",
      href: "https://axisjapan.vercel.app/",
    },
    status: "shipped",
  },
  {
    id: "backgain",
    title: "Backgain",
    category: "AI",
    summary:
      "AI solution that tracks your optimal posture through a webcam.",
    description:
      "Real-time posture tracking through your webcam. Catches when you slouch, nudges you back, and builds the muscle memory for better posture without making you think about it.",
    stack: ["Next.js", "MediaPipe", "Webcam API", "Vercel"],
    link: {
      label: "Visit backgain.vercel.app",
      href: "https://backgain.vercel.app/",
    },
    status: "shipped",
  },
  {
    id: "en2u-site",
    title: "EN2U",
    category: "Web",
    summary:
      "Homepage for the EN2U non-profit — free English education for underserved communities.",
    description:
      "Home page for the non-profit EN2U, specializing in service for underprivileged groups and communities through free, peer-led English education. I co-founded EN2U and built the platform end-to-end.",
    stack: ["Next.js", "Tailwind", "Vercel"],
    link: { label: "Visit en2u.vercel.app", href: "https://en2u.vercel.app/" },
    status: "shipped",
  },
  {
    id: "supercards",
    title: "SuperCards",
    category: "AI",
    summary:
      "Simple AI tool on the OpenAI API — my first build with Google OAuth.",
    description:
      "Lightweight AI card-generation tool built on the OpenAI API. The project that taught me how to wire up Google OAuth and ship a working auth flow end-to-end.",
    stack: ["Next.js", "OpenAI API", "Google OAuth", "Vercel"],
    link: {
      label: "Visit supercards123.vercel.app",
      href: "https://supercards123.vercel.app/",
    },
    status: "shipped",
  },
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
