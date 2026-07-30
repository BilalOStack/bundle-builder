import type { Catalog, Product, StepId } from '@/types/catalog';
import type { BundleState, GroupedLineItems, LineItem, Totals } from '@/types/state';
import { monthlyPayment, sum } from '@/lib/money';
import { lineKey, variantPrice } from './keys';

/**
 * Every selected variant with a quantity above zero, as its own line.
 *
 * Built by walking the catalog rather than the quantities map so ordering is
 * stable and independent of the order things were added in.
 */
export function selectLineItems(catalog: Catalog, state: BundleState): LineItem[] {
  const items: LineItem[] = [];

  for (const product of catalog.products) {
    const variants = product.variants?.length ? product.variants : [undefined];

    for (const variant of variants) {
      const key = lineKey(product.id, variant?.id);
      const qty = state.quantities[key] ?? 0;
      if (qty <= 0) continue;

      const { price, compareAtPrice } = variantPrice(product, variant);
      items.push({
        key,
        product,
        variant,
        qty,
        unitPrice: price,
        unitCompareAt: compareAtPrice,
        lineTotal: price * qty,
        // Products with no compare-at contribute their own price, so they add
        // nothing to the savings figure.
        lineCompareAtTotal: (compareAtPrice ?? price) * qty,
      });
    }
  }

  return items;
}

export function selectGroupedLineItems(catalog: Catalog, state: BundleState): GroupedLineItems {
  const items = selectLineItems(catalog, state);
  return [...catalog.categories]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category: category.id,
      label: category.label,
      items: items.filter((item) => item.product.category === category.id),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * The step header's "N selected" count.
 *
 * Counts distinct **products**, not variants — a product with 2 Red and 1 Blue
 * counts once. Confirmed against the design: step 1 reads "2 selected" with
 * Wyze Cam v4 (×1) and Wyze Cam Pan v3 (×2) in the bundle.
 */
export function selectStepCount(catalog: Catalog, state: BundleState, stepId: StepId): number {
  const selected = new Set<string>();

  for (const product of catalog.products) {
    if (product.stepId !== stepId) continue;
    const variants = product.variants?.length ? product.variants : [undefined];
    for (const variant of variants) {
      if ((state.quantities[lineKey(product.id, variant?.id)] ?? 0) > 0) {
        selected.add(product.id);
        break;
      }
    }
  }

  return selected.size;
}

/** Total quantity of one product across all of its variants. */
export function selectProductTotalQty(state: BundleState, product: Product): number {
  const variants = product.variants?.length ? product.variants : [undefined];
  return sum(variants.map((variant) => state.quantities[lineKey(product.id, variant?.id)] ?? 0));
}

/**
 * Shipping is intentionally excluded from both totals: the design's compare-at
 * total of $238.81 is the sum of the product lines only — adding shipping's
 * $5.99 would make it $244.80. Its savings figure agrees. See the README.
 */
export function selectTotals(catalog: Catalog, state: BundleState): Totals {
  const items = selectLineItems(catalog, state);
  const subtotal = sum(items.map((item) => item.lineTotal));
  const compareAtTotal = sum(items.map((item) => item.lineCompareAtTotal));

  return {
    subtotal,
    compareAtTotal,
    savings: Math.max(0, compareAtTotal - subtotal),
    monthly: monthlyPayment(subtotal, catalog.financing.months, catalog.financing.apr),
  };
}

export function selectHasSelection(catalog: Catalog, state: BundleState): boolean {
  return selectLineItems(catalog, state).length > 0;
}
