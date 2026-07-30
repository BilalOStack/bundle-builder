import { useContext, useMemo } from 'react';
import { BundleDispatchContext, BundleStateContext } from '@/store/context';
import { lineKey, resolveActiveVariant, variantPrice } from '@/store/keys';
import {
  selectGroupedLineItems,
  selectLineItems,
  selectStepCount,
  selectTotals,
} from '@/store/selectors';
import type { Product, StepId } from '@/types/catalog';

export function useBundle() {
  const context = useContext(BundleStateContext);
  if (!context) throw new Error('useBundle must be used inside <BundleProvider>.');
  return context;
}

export function useBundleDispatch() {
  const dispatch = useContext(BundleDispatchContext);
  if (!dispatch) throw new Error('useBundleDispatch must be used inside <BundleProvider>.');
  return dispatch;
}

export function useLineItems() {
  const { catalog, state } = useBundle();
  return useMemo(() => selectLineItems(catalog, state), [catalog, state]);
}

export function useGroupedLineItems() {
  const { catalog, state } = useBundle();
  return useMemo(() => selectGroupedLineItems(catalog, state), [catalog, state]);
}

export function useTotals() {
  const { catalog, state } = useBundle();
  return useMemo(() => selectTotals(catalog, state), [catalog, state]);
}

export function useStepCount(stepId: StepId) {
  const { catalog, state } = useBundle();
  return useMemo(() => selectStepCount(catalog, state, stepId), [catalog, state, stepId]);
}

/**
 * Everything a product card needs: the variant its stepper is bound to, that
 * variant's own quantity, and the price to display.
 *
 * This is where the variant spec lands — the stepper reads
 * `quantities[product::activeVariant]`, so switching chips re-points it at a
 * different count while the other variants' counts stay untouched.
 */
export function useProductCardState(product: Product) {
  const { state } = useBundle();

  return useMemo(() => {
    const variant = resolveActiveVariant(product, state.activeVariant);
    const key = lineKey(product.id, variant?.id);
    const { price, compareAtPrice } = variantPrice(product, variant);
    return {
      variant,
      key,
      qty: state.quantities[key] ?? 0,
      price,
      compareAtPrice,
      image: variant?.image ?? product.image,
    };
  }, [product, state.activeVariant, state.quantities]);
}
