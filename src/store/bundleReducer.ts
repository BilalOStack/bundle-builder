import type { Catalog, Product } from '@/types/catalog';
import type { BundleState } from '@/types/state';
import type { BundleAction } from './actions';
import { lineKey, resolveActiveVariant } from './keys';

/**
 * The reducer needs product constraints (min/max, locked, single-select
 * siblings), so it is built from the catalog rather than importing it. It
 * stays a pure function of (state, action), which keeps it trivially testable.
 */
export function createBundleReducer(catalog: Catalog) {
  const productsById = new Map(catalog.products.map((product) => [product.id, product]));

  function clamp(product: Product, qty: number): number {
    const min = product.minQty ?? 0;
    const max = product.maxQty ?? Number.MAX_SAFE_INTEGER;
    return Math.min(Math.max(Math.round(qty), min), max);
  }

  function writeQuantity(
    quantities: Record<string, number>,
    key: string,
    qty: number,
  ): Record<string, number> {
    const next = { ...quantities };
    // Only entries above zero are retained, so "is this selected?" is simply
    // "is the key present?" and persisted blobs stay small.
    if (qty > 0) next[key] = qty;
    else delete next[key];
    return next;
  }

  function setQuantity(
    state: BundleState,
    productId: string,
    variantId: string | undefined,
    qty: number,
  ): BundleState {
    const product = productsById.get(productId);
    if (!product || product.locked) return state;

    const clamped = clamp(product, qty);
    const key = lineKey(productId, variantId);

    if (product.selectionMode === 'single') {
      // Selecting one option in a single-select step clears its siblings.
      const siblings = catalog.products.filter(
        (candidate) =>
          candidate.stepId === product.stepId &&
          candidate.selectionMode === 'single' &&
          candidate.id !== product.id,
      );
      let quantities = { ...state.quantities };
      for (const sibling of siblings) {
        for (const existing of Object.keys(quantities)) {
          if (existing.startsWith(`${sibling.id}::`)) delete quantities[existing];
        }
      }
      quantities = writeQuantity(quantities, key, Math.min(clamped, 1));
      return { ...state, quantities };
    }

    if (state.quantities[key] === clamped || (!state.quantities[key] && clamped === 0)) {
      return state;
    }
    return { ...state, quantities: writeQuantity(state.quantities, key, clamped) };
  }

  return function bundleReducer(state: BundleState, action: BundleAction): BundleState {
    switch (action.type) {
      case 'setQuantity':
        return setQuantity(state, action.productId, action.variantId, action.qty);

      case 'adjustQuantity': {
        const key = lineKey(action.productId, action.variantId);
        const current = state.quantities[key] ?? 0;
        return setQuantity(state, action.productId, action.variantId, current + action.delta);
      }

      case 'selectVariant': {
        // Pure selection: it re-points the card's stepper at another variant's
        // count and never adds to the bundle by itself.
        const product = productsById.get(action.productId);
        if (!product?.variants?.some((variant) => variant.id === action.variantId)) return state;
        if (state.activeVariant[action.productId] === action.variantId) return state;
        return {
          ...state,
          activeVariant: { ...state.activeVariant, [action.productId]: action.variantId },
        };
      }

      case 'toggleStep':
        return {
          ...state,
          openStepId: state.openStepId === action.stepId ? null : action.stepId,
        };

      case 'openStep':
        return state.openStepId === action.stepId ? state : { ...state, openStepId: action.stepId };

      case 'hydrate':
        return action.state;

      case 'reset':
        return createInitialState(catalog);

      default:
        return state;
    }
  };
}

/** Seeded state, so a first visit renders exactly like the design. */
export function createInitialState(catalog: Catalog): BundleState {
  const productsById = new Map(catalog.products.map((product) => [product.id, product]));
  const quantities: Record<string, number> = {};
  const activeVariant: Record<string, string> = {};

  // Default every variant product to its first chip, then let the seed override.
  for (const product of catalog.products) {
    if (product.variants?.length) activeVariant[product.id] = product.variants[0].id;
  }

  for (const entry of catalog.seed) {
    const product = productsById.get(entry.productId);
    if (!product) continue;
    if (entry.variantId && product.variants?.some((v) => v.id === entry.variantId)) {
      activeVariant[product.id] = entry.variantId;
    }
    if (entry.qty > 0) quantities[lineKey(entry.productId, entry.variantId)] = entry.qty;
  }

  return {
    quantities,
    activeVariant,
    openStepId: catalog.steps[0]?.id ?? null,
  };
}

/** Re-exported for components that need the card's currently bound variant. */
export { resolveActiveVariant };
