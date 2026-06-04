export const INTERNAL_TOOLS = [
  {
    href: "/dashboard",
    title: "Dashboard",
    description:
      "Control tower, inventory, marketing, support, China market, concepts.",
  },
  {
    href: "/internal/generate",
    title: "Generate",
    description: "AI creative director for new clothing concepts.",
  },
  {
    href: "/internal/designs",
    title: "Designs",
    description: "Generated concepts and per-design analysis.",
  },
  {
    href: "/internal/published",
    title: "Published",
    description: "Live storefront concepts ranked by customer demand signal.",
  },
] as const;

/** Shared list / table panel for internal pages */
export const internalPanelClass =
  "divide-y divide-neutral-200 border border-neutral-200 bg-white";
