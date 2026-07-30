import type { Product, Variant } from '@/types/catalog';
import type { LineKey } from '@/types/state';

const NO_VARIANT = '_';

/** `productId::variantId`, or `productId::_` for products with no variants. */
export function lineKey(productId: string, variantId?: string | null): LineKey {
  return `${productId}::${variantId ?? NO_VARIANT}`;
}

export function parseLineKey(key: LineKey): { productId: string; variantId?: string } {
  const separator = key.indexOf('::');
  if (separator === -1) return { productId: key };
  const productId = key.slice(0, separator);
  const variantId = key.slice(separator + 2);
  return variantId === NO_VARIANT ? { productId } : { productId, variantId };
}

/** The variant a card's stepper is currently bound to, if the product has any. */
export function resolveActiveVariant(
  product: Product,
  activeVariant: Record<string, string>,
): Variant | undefined {
  if (!product.variants?.length) return undefined;
  const activeId = activeVariant[product.id];
  return product.variants.find((variant) => variant.id === activeId) ?? product.variants[0];
}

export function variantPrice(product: Product, variant?: Variant) {
  return {
    price: variant?.price ?? product.price,
    compareAtPrice: variant?.compareAtPrice ?? product.compareAtPrice,
  };
}
