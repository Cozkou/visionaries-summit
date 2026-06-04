/** Canonical Pretty Fly hackathon data pack references shown in the UI. */

export const DATA_PACK_ROOT = "hackathon_assets/pretty_fly_data_pack";
export const REPO_URL =
  "https://github.com/Cozkou/visionaries-summit";

export interface DataSourceRef {
  id: string;
  label: string;
  file: string;
  description: string;
  githubUrl: string;
}

export const PRETTY_FLY_DATA_SOURCES: DataSourceRef[] = [
  {
    id: "line_items",
    label: "Order line items",
    file: "data/line_items.csv",
    description: "Units sold and line revenue (24 months)",
    githubUrl: `${REPO_URL}/blob/main/hackathon_assets/pretty_fly_data_pack/data/line_items.csv`,
  },
  {
    id: "products",
    label: "Product catalogue",
    file: "data/products.csv",
    description: "Product titles, types, collections, gender",
    githubUrl: `${REPO_URL}/blob/main/hackathon_assets/pretty_fly_data_pack/data/products.csv`,
  },
  {
    id: "variants",
    label: "SKU variants",
    file: "data/variants.csv",
    description: "Variant list prices and inventory",
    githubUrl: `${REPO_URL}/blob/main/hackathon_assets/pretty_fly_data_pack/data/variants.csv`,
  },
  {
    id: "refunds",
    label: "Refunds",
    file: "data/refunds.csv",
    description: "Refund amounts and reasons",
    githubUrl: `${REPO_URL}/blob/main/hackathon_assets/pretty_fly_data_pack/data/refunds.csv`,
  },
  {
    id: "po_line_items",
    label: "PO line items",
    file: "data/po_line_items.csv",
    description: "Landed unit cost per variant (GBP)",
    githubUrl: `${REPO_URL}/blob/main/hackathon_assets/pretty_fly_data_pack/data/po_line_items.csv`,
  },
  {
    id: "purchase_orders",
    label: "Purchase orders",
    file: "data/purchase_orders.csv",
    description: "Supplier links per purchase order",
    githubUrl: `${REPO_URL}/blob/main/hackathon_assets/pretty_fly_data_pack/data/purchase_orders.csv`,
  },
  {
    id: "suppliers",
    label: "Suppliers",
    file: "data/suppliers.csv",
    description: "Supplier lead times (days)",
    githubUrl: `${REPO_URL}/blob/main/hackathon_assets/pretty_fly_data_pack/data/suppliers.csv`,
  },
];

export function getSourceById(id: string): DataSourceRef | undefined {
  return PRETTY_FLY_DATA_SOURCES.find((s) => s.id === id);
}
