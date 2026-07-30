import type { Catalog } from '@/types/catalog';
import type { BundleState } from '@/types/state';
import { parseLineKey, lineKey } from './keys';

export const STORAGE_KEY = 'wyze-bundle-builder:v1';
const SCHEMA_VERSION = 1;

/**
 * Note what is absent: which accordion step was open.
 *
 * That's shopping-session UI state, not part of the shopper's system, and the
 * brief is explicit that step 1 is open on load. Persisting it meant saving
 * while step 4 was expanded reopened step 4 on the next visit.
 */
interface SavedBundle {
  schemaVersion: number;
  catalogVersion: string;
  savedAt: string;
  quantities: Record<string, number>;
  activeVariant: Record<string, string>;
}

/** localStorage throws in private mode and in some embedded webviews. */
function storage(): Storage | null {
  try {
    const probe = window.localStorage;
    const key = '__probe__';
    probe.setItem(key, '1');
    probe.removeItem(key);
    return probe;
  } catch {
    return null;
  }
}

export function saveBundle(catalog: Catalog, state: BundleState): boolean {
  const store = storage();
  if (!store) return false;

  const payload: SavedBundle = {
    schemaVersion: SCHEMA_VERSION,
    catalogVersion: catalog.version,
    savedAt: new Date().toISOString(),
    quantities: state.quantities,
    activeVariant: state.activeVariant,
  };

  try {
    store.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads a saved bundle and reconciles it against the catalog that is actually
 * loaded. A blob referencing a product or variant that has since been removed
 * must not crash the app, so unknown entries are dropped rather than trusted.
 *
 * Returns null when there is nothing usable, in which case the caller falls
 * back to the seeded state.
 */
export function loadBundle(catalog: Catalog): BundleState | null {
  const store = storage();
  if (!store) return null;

  let parsed: unknown;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const saved = parsed as Partial<SavedBundle>;
  if (saved.schemaVersion !== SCHEMA_VERSION) return null;

  const productsById = new Map(catalog.products.map((product) => [product.id, product]));

  const quantities: Record<string, number> = {};
  for (const [key, value] of Object.entries(saved.quantities ?? {})) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) continue;

    const { productId, variantId } = parseLineKey(key);
    const product = productsById.get(productId);
    if (!product) continue;

    // A variant key must still exist; a non-variant key must belong to a
    // product that genuinely has no variants.
    if (variantId) {
      if (!product.variants?.some((variant) => variant.id === variantId)) continue;
    } else if (product.variants?.length) {
      continue;
    }

    const min = product.minQty ?? 0;
    const max = product.maxQty ?? Number.MAX_SAFE_INTEGER;
    quantities[lineKey(productId, variantId)] = Math.min(Math.max(Math.round(value), min), max);
  }

  const activeVariant: Record<string, string> = {};
  for (const [productId, variantId] of Object.entries(saved.activeVariant ?? {})) {
    const product = productsById.get(productId);
    if (product?.variants?.some((variant) => variant.id === variantId)) {
      activeVariant[productId] = variantId;
    }
  }

  // Products the saved blob never mentioned still need a default active chip.
  for (const product of catalog.products) {
    if (product.variants?.length && !activeVariant[product.id]) {
      activeVariant[product.id] = product.variants[0].id;
    }
  }

  // Step 1 always opens on load, restored system or not.
  return { quantities, activeVariant, openStepId: catalog.steps[0]?.id ?? null };
}

export function clearBundle(): void {
  storage()?.removeItem(STORAGE_KEY);
}

export function hasSavedBundle(): boolean {
  const store = storage();
  if (!store) return false;
  return store.getItem(STORAGE_KEY) !== null;
}
