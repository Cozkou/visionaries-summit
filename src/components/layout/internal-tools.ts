export const INTERNAL_TOOLS = [
  {
    href: "/dashboard",
    title: "Dashboard",
    description:
      "Control tower, inventory, marketing, support, China market, concepts.",
  },
  {
    href: "/generate",
    title: "Generate",
    description: "AI creative director — new clothing concepts.",
  },
  {
    href: "/designs",
    title: "Designs",
    description: "Generated concepts and per-design analysis.",
  },
] as const;

/** Shared list / table panel for internal pages */
export const internalPanelClass =
  "divide-y divide-neutral-200 border border-neutral-200 bg-white";
