export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", exact: true as const },
  { href: "/dashboard/pulse", label: "Pulse" },
  { href: "/dashboard/refunders", label: "Refunders" },
  { href: "/dashboard/suppliers", label: "Suppliers" },
  { href: "/dashboard/support", label: "Support messages" },
  { href: "/dashboard/orders", label: "Past orders" },
  { href: "/dashboard/campaigns", label: "Email campaigns" },
  { href: "/dashboard/concepts", label: "Design concepts" },
  { href: "/dashboard/china-market", label: "China market" },
] as const;

export type DashboardNavItem = (typeof DASHBOARD_NAV)[number];
