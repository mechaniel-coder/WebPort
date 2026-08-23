export type Site = {
  slug: string;
  category: string;
  name: string;
  headline: string;
  accent: string;
};

export const SITES: Site[] = [
  {
    slug: "saas",
    category: "SaaS",
    name: "Aperture",
    headline: "See the number before it happens.",
    accent: "#7dd3fc",
  },
  {
    slug: "portfolio",
    category: "Portfolio",
    name: "Noctis",
    headline: "Stillness, held a second too long.",
    accent: "#e8c27a",
  },
  {
    slug: "launch",
    category: "Launch",
    name: "Fragment",
    headline: "Five hundred. Then it's gone.",
    accent: "#c9ff5e",
  },
  {
    slug: "agency",
    category: "Agency",
    name: "Halide",
    headline: "We take twelve clients a year. On purpose.",
    accent: "#ff5a5f",
  },
  {
    slug: "ecommerce",
    category: "E-commerce",
    name: "Fennimore",
    headline: "A bag you'll hand down, not replace.",
    accent: "#d99a6c",
  },
  {
    slug: "app",
    category: "App",
    name: "Cadence",
    headline: "Your plan, rewritten every morning.",
    accent: "#b39dff",
  },
  {
    slug: "event",
    category: "Event",
    name: "Meridian",
    headline: "Four hundred seats. No livestream.",
    accent: "#ffb84d",
  },
  {
    slug: "luxury",
    category: "Luxury",
    name: "Solace",
    headline: "We don't sell trips. We arrange access.",
    accent: "#d4b483",
  },
];
