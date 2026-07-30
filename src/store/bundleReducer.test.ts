import { describe, expect, it } from 'vitest';
import { createBundleReducer, createInitialState } from './bundleReducer';
import { lineKey } from './keys';
import { catalog, ids } from '@/test/catalog';
import type { BundleAction } from './actions';
import type { BundleState } from '@/types/state';

const reducer = createBundleReducer(catalog);
const seeded = () => createInitialState(catalog);
const run = (state: BundleState, ...actions: BundleAction[]) =>
  actions.reduce((current, action) => reducer(current, action), state);

const qty = (state: BundleState, productId: string, variantId?: string) =>
  state.quantities[lineKey(productId, variantId)] ?? 0;

describe('seeded state', () => {
  it('matches the quantities shown in the design', () => {
    const state = seeded();
    expect(qty(state, ids.camV4, 'white')).toBe(1);
    expect(qty(state, ids.panV3, 'white')).toBe(2);
    expect(qty(state, ids.motionSensor)).toBe(2);
    expect(qty(state, ids.hub)).toBe(1);
    expect(qty(state, ids.microSd)).toBe(2);
    expect(qty(state, ids.camUnlimited)).toBe(1);
  });

  it('opens step 1 on load', () => {
    expect(seeded().openStepId).toBe('cameras');
  });

  it('defaults every variant product to its first chip', () => {
    const state = seeded();
    expect(state.activeVariant[ids.floodlight]).toBe('white');
    expect(state.activeVariant[ids.doorbell]).toBeUndefined();
  });
});

describe('quantity', () => {
  it('increments and decrements', () => {
    const state = run(
      seeded(),
      { type: 'adjustQuantity', productId: ids.camV4, variantId: 'white', delta: 1 },
      { type: 'adjustQuantity', productId: ids.camV4, variantId: 'white', delta: 1 },
    );
    expect(qty(state, ids.camV4, 'white')).toBe(3);
  });

  it('clamps at zero and never goes negative', () => {
    const state = run(seeded(), {
      type: 'adjustQuantity',
      productId: ids.camV4,
      variantId: 'white',
      delta: -5,
    });
    expect(qty(state, ids.camV4, 'white')).toBe(0);
  });

  it('deletes the key at zero rather than storing a 0', () => {
    const state = run(seeded(), {
      type: 'setQuantity',
      productId: ids.camV4,
      variantId: 'white',
      qty: 0,
    });
    expect(lineKey(ids.camV4, 'white') in state.quantities).toBe(false);
  });

  it('ignores changes to a locked product', () => {
    const state = run(seeded(), {
      type: 'adjustQuantity',
      productId: ids.hub,
      delta: 3,
    });
    expect(qty(state, ids.hub)).toBe(1);
  });

  it('handles products with no variants', () => {
    const state = run(seeded(), {
      type: 'adjustQuantity',
      productId: ids.doorbell,
      delta: 1,
    });
    expect(qty(state, ids.doorbell)).toBe(1);
  });

  it('ignores unknown products', () => {
    const state = seeded();
    expect(run(state, { type: 'adjustQuantity', productId: 'nope', delta: 1 })).toBe(state);
  });
});

describe('variant isolation', () => {
  it('keeps a separate count per variant', () => {
    // The scenario from the brief: add 2 Red, switch to Blue, Blue reads 0.
    const state = run(
      seeded(),
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'white', qty: 2 },
      { type: 'selectVariant', productId: ids.floodlight, variantId: 'black' },
    );

    expect(state.activeVariant[ids.floodlight]).toBe('black');
    expect(qty(state, ids.floodlight, 'black')).toBe(0);
    expect(qty(state, ids.floodlight, 'white')).toBe(2);
  });

  it('does not add anything when a chip is selected', () => {
    const before = seeded();
    const after = run(before, {
      type: 'selectVariant',
      productId: ids.floodlight,
      variantId: 'black',
    });
    expect(Object.keys(after.quantities)).toEqual(Object.keys(before.quantities));
  });

  it('tracks both variants of the same product at once', () => {
    const state = run(
      seeded(),
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'white', qty: 2 },
      { type: 'selectVariant', productId: ids.floodlight, variantId: 'black' },
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'black', qty: 3 },
    );
    expect(qty(state, ids.floodlight, 'white')).toBe(2);
    expect(qty(state, ids.floodlight, 'black')).toBe(3);
  });

  it('ignores a variant that does not belong to the product', () => {
    const state = seeded();
    expect(
      run(state, { type: 'selectVariant', productId: ids.floodlight, variantId: 'purple' }),
    ).toBe(state);
  });
});

describe('single-select plan step', () => {
  it('clears siblings when another plan is chosen', () => {
    const state = run(seeded(), {
      type: 'setQuantity',
      productId: ids.camPlus,
      qty: 1,
    });
    expect(qty(state, ids.camPlus)).toBe(1);
    expect(qty(state, ids.camUnlimited)).toBe(0);
  });

  it('never exceeds a quantity of one', () => {
    const state = run(seeded(), {
      type: 'adjustQuantity',
      productId: ids.camUnlimited,
      delta: 4,
    });
    expect(qty(state, ids.camUnlimited)).toBe(1);
  });
});

describe('accordion', () => {
  it('toggles the open step closed', () => {
    const state = run(seeded(), { type: 'toggleStep', stepId: 'cameras' });
    expect(state.openStepId).toBeNull();
  });

  it('switches directly between steps', () => {
    const state = run(seeded(), { type: 'toggleStep', stepId: 'sensors' });
    expect(state.openStepId).toBe('sensors');
  });
});

describe('reset', () => {
  it('returns to the seeded configuration', () => {
    const state = run(
      seeded(),
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'white', qty: 9 },
      { type: 'reset' },
    );
    expect(state).toEqual(seeded());
  });
});
