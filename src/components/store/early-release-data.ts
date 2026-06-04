/** Featured drop on the storefront — under the countdown */
export const CURRENT_EARLY_RELEASE = {
  id: "drop-aw26-varsity",
  name: "AW26 Varsity — Midnight",
  category: "Jackets",
  image: "/image.png",
  description:
    "Ranked #1 this cycle from sales velocity, low returns, and waitlist demand. Limited run — no restock after early access closes.",
  preorderPrice: 260,
  retailPrice: 280,
  baseUpvotes: 2847,
  basePreorders: 142,
  sizes: ["S", "M", "L", "XL"] as const,
};

export const STORAGE_KEYS = {
  upvoted: "pf-early-release-upvoted",
  preordered: "pf-early-release-preordered",
  size: "pf-early-release-size",
} as const;
