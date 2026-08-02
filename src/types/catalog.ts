/** All money in the app is integer cents. Never floats — see lib/money.ts. */
export type Cents = number;

export type StepId = 'cameras' | 'plan' | 'sensors' | 'protection';

/**
 * Review-panel grouping. Deliberately NOT derived from `stepId`: the panel
 * orders groups Cameras → Sensors → Accessories → Plan, while the builder
 * orders steps Cameras → Plan → Sensors → Protection, and step 4
 * ("Add extra protection") surfaces under the "Accessories" heading.
 */
export type CategoryId = 'cameras' | 'sensors' | 'accessories' | 'plan';

export type IconId =
  | 'camera'
  | 'shield'
  | 'sensor'
  | 'grid'
  | 'truck'
  | 'chevron'
  | 'minus'
  | 'plus'
  | 'seal'
  | 'wyze';

export interface Variant {
  id: string;
  label: string;
  /** Chips show a miniature product photo, not a flat colour swatch. */
  thumbnail: string;
  /** Swaps the main card image when this variant is active. */
  image: string;
  /** Falls back to `Product.price` when omitted. */
  price?: Cents;
  compareAtPrice?: Cents;
}

export type SelectionMode = 'quantity' | 'single';

export interface Product {
  id: string;
  stepId: StepId;
  category: CategoryId;
  title: string;
  description?: string;
  /** Absent for non-physical products such as subscription plans. */
  image?: string;
  /** 48×48 render used by the review panel. Absent alongside `image`. */
  thumbnail?: string;
  learnMoreUrl?: string;
  price: Cents;
  compareAtPrice?: Cents;
  variants?: Variant[];
  /** Rendered after the price, e.g. "/mo" for the subscription plan. */
  priceSuffix?: string;
  /** Shown instead of the price when the resolved price is 0. */
  freeLabel?: string;
  /** Escape hatch; the badge is normally derived from the discount. */
  badgeOverride?: string;
  /** Sense Hub: the stepper renders but is not operable. */
  locked?: boolean;
  /** The plan step is single-select rather than quantity-based. */
  selectionMode?: SelectionMode;
  minQty?: number;
  maxQty?: number;
  /** Renders the "Cam Unlimited" logo lockup instead of a plain title. */
  titleLockup?: { mark: IconId; lead: string; accent: string };
}

export interface Step {
  id: StepId;
  index: number;
  title: string;
  icon: IconId;
  /** Absent on the final step. */
  nextLabel?: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  order: number;
}

export interface SeedEntry {
  productId: string;
  variantId?: string;
  qty: number;
}

export interface Catalog {
  version: string;
  page: { title: string };
  review: { eyebrow: string; title: string; subtitle: string };
  steps: Step[];
  categories: Category[];
  products: Product[];
  /**
   * Rendered as a line in the review panel but excluded from both totals —
   * matching the design, whose $238.81 compare-at total omits it.
   */
  shipping: {
    label: string;
    icon: IconId;
    compareAtPrice: Cents;
    price: Cents;
    freeLabel: string;
  };
  guarantee: { headline: string; body: string; sealLines: string[]; sealImage?: string };
  financing: { months: number; apr: number; prefix: string };
  savingsTemplate: string;
  seed: SeedEntry[];
}
