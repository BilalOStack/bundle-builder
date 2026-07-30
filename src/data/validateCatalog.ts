import type { Catalog } from '@/types/catalog';

/**
 * Structural validation for catalogs arriving over the wire. Deliberately
 * hand-rolled rather than pulling in a schema library — this checks the
 * invariants the UI actually depends on and reports every problem at once so
 * a malformed catalog fails loudly instead of rendering half a page.
 */
export function validateCatalog(input: unknown): { catalog: Catalog | null; errors: string[] } {
  const errors: string[] = [];
  const fail = (message: string) => {
    errors.push(message);
    return null;
  };

  if (!input || typeof input !== 'object') {
    return { catalog: null, errors: ['Catalog is not an object.'] };
  }

  const candidate = input as Partial<Catalog>;
  const required: (keyof Catalog)[] = [
    'version',
    'steps',
    'categories',
    'products',
    'shipping',
    'financing',
    'seed',
  ];
  for (const key of required) {
    if (candidate[key] == null) fail(`Missing required field "${String(key)}".`);
  }
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) {
    fail('Catalog must define at least one step.');
  }
  if (!Array.isArray(candidate.products) || candidate.products.length === 0) {
    fail('Catalog must define at least one product.');
  }
  if (errors.length) return { catalog: null, errors };

  const catalog = candidate as Catalog;
  const stepIds = new Set(catalog.steps.map((step) => step.id));
  const categoryIds = new Set(catalog.categories.map((category) => category.id));
  const productIds = new Set<string>();

  for (const product of catalog.products) {
    if (!product.id) fail('A product is missing an id.');
    if (productIds.has(product.id)) fail(`Duplicate product id "${product.id}".`);
    productIds.add(product.id);

    if (!stepIds.has(product.stepId)) {
      fail(`Product "${product.id}" references unknown step "${product.stepId}".`);
    }
    if (!categoryIds.has(product.category)) {
      fail(`Product "${product.id}" references unknown category "${product.category}".`);
    }
    if (!Number.isInteger(product.price) || product.price < 0) {
      fail(`Product "${product.id}" has a non-integer or negative price (must be cents).`);
    }
    if (
      product.compareAtPrice != null &&
      (!Number.isInteger(product.compareAtPrice) || product.compareAtPrice < product.price)
    ) {
      fail(`Product "${product.id}" has a compare-at price below its price.`);
    }

    const variantIds = new Set<string>();
    for (const variant of product.variants ?? []) {
      if (variantIds.has(variant.id)) {
        fail(`Product "${product.id}" has duplicate variant "${variant.id}".`);
      }
      variantIds.add(variant.id);
    }
  }

  for (const entry of catalog.seed) {
    const product = catalog.products.find((candidate) => candidate.id === entry.productId);
    if (!product) {
      fail(`Seed references unknown product "${entry.productId}".`);
      continue;
    }
    if (entry.variantId && !product.variants?.some((v) => v.id === entry.variantId)) {
      fail(`Seed references unknown variant "${entry.variantId}" on "${entry.productId}".`);
    }
    if (!entry.variantId && product.variants?.length) {
      fail(`Seed for "${entry.productId}" must name a variant.`);
    }
  }

  return { catalog: errors.length ? null : catalog, errors };
}
