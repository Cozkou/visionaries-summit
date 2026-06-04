export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  badge?: string;
};

export const CATEGORIES = [
  "All",
  "Jackets",
  "Hoodies",
  "Tees",
  "Headwear",
  "Accessories",
] as const;

export type ProductCategory = (typeof CATEGORIES)[number];

export const SORT_OPTIONS = [
  "Featured",
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const PRODUCTS: Product[] = [
  {
    id: "varsity-chosen-brown",
    name: "Chosen Varsity Jacket",
    category: "Jackets",
    price: 240,
    image: "/image.png",
    badge: "New",
  },
  {
    id: "varsity-flyrich-sky",
    name: "FlyRich Varsity — Sky",
    category: "Jackets",
    price: 240,
    image: "/varsity.PNG",
    badge: "New",
  },
  {
    id: "varsity-flyrich-alt",
    name: "FlyRich Varsity — Reverse",
    category: "Jackets",
    price: 250,
    image: "/varsity2.PNG",
  },
  {
    id: "boxy-overshirt",
    name: "Boxy Wool Overshirt",
    category: "Jackets",
    price: 160,
    image: "/placeholders/design-3.svg",
  },
  {
    id: "heavy-hoodie",
    name: "Heavyweight Hoodie",
    category: "Hoodies",
    price: 110,
    image: "/placeholders/design-1.svg",
    badge: "Last few",
  },
  {
    id: "logo-hoodie",
    name: "Arc Logo Hoodie",
    category: "Hoodies",
    price: 115,
    image: "/placeholders/design-1.svg",
  },
  {
    id: "box-tee",
    name: "Boxy Box-Logo Tee",
    category: "Tees",
    price: 55,
    image: "/placeholders/design-2.svg",
  },
  {
    id: "script-tee",
    name: "Script Graphic Tee",
    category: "Tees",
    price: 60,
    image: "/placeholders/design-2.svg",
  },
  {
    id: "fitted-cap",
    name: "Fitted Crest Cap",
    category: "Headwear",
    price: 45,
    image: "/placeholders/design-5.svg",
  },
  {
    id: "runner",
    name: "Cloud Runner Trainer",
    category: "Accessories",
    price: 145,
    image: "/placeholders/design-4.svg",
  },
];

export const EARLY_RELEASES: Product[] = [
  {
    id: "drop-aw26-varsity",
    name: "AW26 Varsity — Midnight",
    category: "Jackets",
    price: 260,
    image: "/jacket-cutout.png",
    badge: "Members only",
  },
  {
    id: "drop-flight-hoodie",
    name: "Flight Zip Hoodie",
    category: "Hoodies",
    price: 130,
    image: "/placeholders/design-1.svg",
    badge: "Jun 14",
  },
  {
    id: "drop-stratus-tee",
    name: "Stratus Tour Tee",
    category: "Tees",
    price: 65,
    image: "/placeholders/design-2.svg",
    badge: "Jun 21",
  },
];
