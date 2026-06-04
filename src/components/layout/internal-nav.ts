import { DASHBOARD_NAV } from "@/components/dashboard/nav";

export const INTERNAL_MAIN_NAV = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    description: "Operations, inventory, campaigns, and support.",
    isActive: (pathname: string) =>
      pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
  },
  {
    id: "generate",
    href: "/generate",
    label: "Generate",
    description: "Create new concepts from sales data and your brief.",
    isActive: (pathname: string) => pathname === "/generate",
  },
  {
    id: "designs",
    href: "/designs",
    label: "Designs",
    description: "Browse generated concepts and open commercial analysis.",
    isActive: (pathname: string) =>
      pathname === "/designs" || pathname.startsWith("/design/"),
  },
] as const;

export type InternalPageContext = {
  title: string;
  description: string;
  breadcrumbs?: { label: string; href?: string }[];
};

export function getInternalPageContext(pathname: string): InternalPageContext {
  if (pathname === "/internal") {
    return {
      title: "Tools",
      description: "Choose a workspace — dashboard, generation, or design review.",
    };
  }

  if (pathname === "/generate") {
    return {
      title: "Generate",
      description: INTERNAL_MAIN_NAV.find((n) => n.id === "generate")!.description,
    };
  }

  if (pathname === "/designs") {
    return {
      title: "Designs",
      description: INTERNAL_MAIN_NAV.find((n) => n.id === "designs")!.description,
    };
  }

  if (pathname.startsWith("/design/")) {
    const id = pathname.split("/")[2] ?? "";
    return {
      title: "Design analysis",
      description: "Revenue, margin, and refund signals for this concept.",
      breadcrumbs: [
        { label: "Designs", href: "/designs" },
        { label: id || "Concept" },
      ],
    };
  }

  if (pathname === "/dashboard") {
    return {
      title: "Dashboard overview",
      description: INTERNAL_MAIN_NAV.find((n) => n.id === "dashboard")!.description,
    };
  }

  if (pathname.startsWith("/dashboard/")) {
    const segment = pathname.replace("/dashboard/", "").split("/")[0];
    const item = DASHBOARD_NAV.find((n) => n.href === `/dashboard/${segment}`);
    const label =
      item?.label ??
      segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
      title: label,
      description: "Dashboard section — operations and retail intelligence.",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label },
      ],
    };
  }

  return {
    title: "Internal",
    description: "Pretty Fly creative director workspace.",
  };
}
