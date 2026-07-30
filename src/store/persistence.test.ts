import { beforeEach, describe, expect, it } from 'vitest';
import { createBundleReducer, createInitialState } from './bundleReducer';
import { loadBundle, saveBundle, STORAGE_KEY } from './persistence';
import { lineKey } from './keys';
import { catalog, ids } from '@/test/catalog';
import type { BundleAction } from './actions';
import type { BundleState } from '@/types/state';

const reducer = createBundleReducer(catalog);
const seeded = () => createInitialState(catalog);
const run = (state: BundleState, ...actions: BundleAction[]) =>
  actions.reduce((current, action) => reducer(current, action), state);

beforeEach(() => window.localStorage.clear());

describe('save and restore', () => {
  it('round-trips quantities and the active chip exactly', () => {
    const configured = run(
      seeded(),
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'white', qty: 2 },
      { type: 'selectVariant', productId: ids.floodlight, variantId: 'black' },
      { type: 'setQuantity', productId: ids.floodlight, variantId: 'black', qty: 1 },
    );

    expect(saveBundle(catalog, configured)).toBe(true);
    const restored = loadBundle(catalog)!;
    expect(restored.quantities).toEqual(configured.quantities);
    expect(restored.activeVariant).toEqual(configured.activeVariant);
  });

  it('returns null when nothing was ever saved', () => {
    expect(loadBundle(catalog)).toBeNull();
  });

  it('always reopens step 1, whatever was open when the system was saved', () => {
    // The accordion's open step is session UI state, not part of the system.
    for (const stepId of ['protection', 'sensors', 'cameras'] as const) {
      window.localStorage.clear();
      saveBundle(catalog, run(seeded(), { type: 'openStep', stepId }));
      expect(loadBundle(catalog)?.openStepId).toBe('cameras');
    }
  });

  it('reopens step 1 even when every step was collapsed at save time', () => {
    saveBundle(catalog, run(seeded(), { type: 'toggleStep', stepId: 'cameras' }));
    expect(loadBundle(catalog)?.openStepId).toBe('cameras');
  });
});

describe('reconciliation against the catalog', () => {
  const write = (payload: unknown) =>
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  const validPayload = (overrides: Record<string, unknown> = {}) => ({
    schemaVersion: 1,
    catalogVersion: catalog.version,
    savedAt: new Date().toISOString(),
    quantities: { [lineKey(ids.camV4, 'white')]: 2 },
    activeVariant: { [ids.camV4]: 'white' },
    openStepId: 'cameras',
    ...overrides,
  });

  it('drops products that no longer exist', () => {
    write(validPayload({ quantities: { 'ghost-product::white': 3 } }));
    expect(loadBundle(catalog)?.quantities).toEqual({});
  });

  it('drops variants that no longer exist', () => {
    write(validPayload({ quantities: { [lineKey(ids.camV4, 'chartreuse')]: 3 } }));
    expect(loadBundle(catalog)?.quantities).toEqual({});
  });

  it('drops a variantless key for a product that has variants', () => {
    write(validPayload({ quantities: { [lineKey(ids.camV4)]: 3 } }));
    expect(loadBundle(catalog)?.quantities).toEqual({});
  });

  it('clamps a quantity that exceeds the product maximum', () => {
    write(validPayload({ quantities: { [lineKey(ids.hub)]: 99 } }));
    expect(loadBundle(catalog)?.quantities[lineKey(ids.hub)]).toBe(1);
  });

  it('ignores non-numeric and negative quantities', () => {
    write(validPayload({ quantities: { [lineKey(ids.camV4, 'white')]: 'three' } }));
    expect(loadBundle(catalog)?.quantities).toEqual({});
  });

  it('backfills a default active chip for products the blob never mentioned', () => {
    write(validPayload({ activeVariant: {} }));
    expect(loadBundle(catalog)?.activeVariant[ids.floodlight]).toBe('white');
  });

  it('ignores an open step left in an older saved blob', () => {
    write(validPayload({ openStepId: 'protection' }));
    expect(loadBundle(catalog)?.openStepId).toBe('cameras');
  });
});

describe('resilience', () => {
  it('falls back when the stored value is not JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{{{ not json');
    expect(loadBundle(catalog)).toBeNull();
  });

  it('falls back on a schema version it does not understand', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, quantities: {} }));
    expect(loadBundle(catalog)).toBeNull();
  });

  it('falls back when the payload is not an object', () => {
    window.localStorage.setItem(STORAGE_KEY, '"just a string"');
    expect(loadBundle(catalog)).toBeNull();
  });
});
