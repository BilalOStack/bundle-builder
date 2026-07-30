import type { Cents, CategoryId, Product, StepId, Variant } from './catalog';

/**
 * `productId::variantId` (or `productId::_` for products without variants).
 *
 * Keying selections by product **and** variant is the single decision the
 * whole variant spec rests on: Red and Blue are separate entries with
 * separate counts, the card's stepper simply re-points at a different entry
 * when the active chip changes, and the review panel renders every entry
 * with a quantity above zero.
 */
export type LineKey = string;

export interface BundleState {
  /** Only entries with qty > 0 are retained. */
  quantities: Record<LineKey, number>;
  /** Which chip is currently active per product. */
  activeVariant: Record<string, string>;
  openStepId: StepId | null;
}

export interface LineItem {
  key: LineKey;
  product: Product;
  variant?: Variant;
  qty: number;
  unitPrice: Cents;
  unitCompareAt?: Cents;
  lineTotal: Cents;
  lineCompareAtTotal: Cents;
}

export type GroupedLineItems = { category: CategoryId; label: string; items: LineItem[] }[];

export interface Totals {
  subtotal: Cents;
  compareAtTotal: Cents;
  savings: Cents;
  monthly: Cents;
}
