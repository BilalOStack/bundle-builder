import { describe, expect, it } from 'vitest';
import { createBundleReducer, createInitialState } from './bundleReducer';
import {
  selectGroupedLineItems,
  selectLineItems,
  selectStepCount,
  selectTotals,
} from './selectors';
import { catalog, ids } from '@/test/catalog';
import type { BundleAction } from './actions';
import type { BundleState } from '@/types/state';

const reducer = createBundleReducer(catalog);
const seeded = () => createInitialState(catalog);
const run = (state: BundleState, ...actions: BundleAction[]) =>
  actions.reduce((current, action) => reducer(current, action), state);

describe('"N selected" step counts', () => {
  it('matches the design on load', () => {
    const state = seeded();
    expect(selectStepCount(catalog, state, 'cameras')).toBe(2);
    expect(selectStepCount(catalog, state, 'plan')).toBe(1);
    expect(selectStepCount(catalog, state, 'sensors')).toBe(2);
    expect(selectStepCount(catalog, state, 'protection')).toBe(1);
  });

  it('counts distinct products, not variants', () => {
    // Two variants of one product must still read as a single selection.
    const state = run(
      seeded(),
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'white', qty: 2 },
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'black', qty: 3 },
    );
    expect(selectStepCount(catalog, state, 'cameras')).toBe(3);
  });

  it('drops a product from the count once every variant is back to zero', () => {
    const state = run(seeded(), {
      type: 'setQuantity',
      productId: ids.panV3,
      variantId: 'white',
      qty: 0,
    });
    expect(selectStepCount(catalog, state, 'cameras')).toBe(1);
  });
});

describe('line items', () => {
  it('renders every variant above zero as its own line', () => {
    const state = run(
      seeded(),
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'white', qty: 2 },
      { type: 'selectVariant', productId: ids.floodlight, variantId: 'black' },
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'black', qty: 1 },
    );

    const floodlightLines = selectLineItems(catalog, state).filter(
      (item) => item.product.id === ids.floodlight,
    );
    expect(floodlightLines.map((line) => [line.variant?.id, line.qty])).toEqual([
      ['white', 2],
      ['black', 1],
    ]);
  });

  it('keeps a variant visible after the card switches away from it', () => {
    const state = run(
      seeded(),
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'white', qty: 2 },
      { type: 'selectVariant', productId: ids.floodlight, variantId: 'black' },
    );
    const lines = selectLineItems(catalog, state);
    expect(lines.some((line) => line.variant?.id === 'white' && line.qty === 2)).toBe(true);
  });

  it('multiplies unit price by quantity', () => {
    const state = seeded();
    const panV3 = selectLineItems(catalog, state).find((item) => item.product.id === ids.panV3);
    expect(panV3?.qty).toBe(2);
    expect(panV3?.unitPrice).toBe(3498);
    expect(panV3?.lineTotal).toBe(6996);
  });

  it('groups in review-panel order, not step order', () => {
    const groups = selectGroupedLineItems(catalog, seeded());
    expect(groups.map((group) => group.category)).toEqual([
      'cameras',
      'sensors',
      'accessories',
      'plan',
    ]);
  });

  it('omits groups with nothing selected', () => {
    const state = run(seeded(), { type: 'setQuantity', productId: ids.microSd, qty: 0 });
    const groups = selectGroupedLineItems(catalog, state);
    expect(groups.map((group) => group.category)).not.toContain('accessories');
  });
});

describe('totals', () => {
  it('computes the seeded bundle', () => {
    const { subtotal, compareAtTotal, savings } = selectTotals(catalog, seeded());

    // 27.98 + 69.96 + 59.98 + 0.00 + 41.96 + 9.99
    expect(subtotal).toBe(20987);
    // 35.98 + 79.96 + 59.98 + 29.92 + 41.96 + 12.99
    expect(compareAtTotal).toBe(26079);
    // Matches the design's "$50.92" savings callout exactly.
    expect(savings).toBe(5092);
  });

  it('excludes shipping from both totals', () => {
    // The design's $238.81 compare-at total is the product lines alone;
    // including shipping's $5.99 would make it $244.80.
    const { compareAtTotal } = selectTotals(catalog, seeded());
    expect(compareAtTotal).not.toBe(26079 + catalog.shipping.compareAtPrice);
  });

  it('counts the free hub as $0 while still crediting its compare-at price', () => {
    const state = run(seeded(), { type: 'setQuantity', productId: ids.motionSensor, qty: 0 });
    const hub = selectLineItems(catalog, state).find((item) => item.product.id === ids.hub);
    expect(hub?.lineTotal).toBe(0);
    expect(hub?.lineCompareAtTotal).toBe(2992);
  });

  it('recalculates as quantities change', () => {
    const before = selectTotals(catalog, seeded()).subtotal;
    const state = run(seeded(), {
      type: 'adjustQuantity',
      productId: ids.camV4,
      variantId: 'white',
      delta: 1,
    });
    expect(selectTotals(catalog, state).subtotal).toBe(before + 2798);
  });

  it('produces zeroes for an empty bundle', () => {
    const totals = selectTotals(catalog, {
      quantities: {},
      activeVariant: {},
      openStepId: null,
    });
    expect(totals).toMatchObject({ subtotal: 0, compareAtTotal: 0, savings: 0 });
  });
});
