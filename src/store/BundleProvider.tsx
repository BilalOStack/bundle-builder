import { useCallback, useMemo, useReducer, useState, type ReactNode } from 'react';
import type { Catalog } from '@/types/catalog';
import { createBundleReducer, createInitialState } from './bundleReducer';
import { loadBundle, saveBundle } from './persistence';
import { BundleDispatchContext, BundleStateContext, type BundleContextValue } from './context';

interface Props {
  catalog: Catalog;
  children: ReactNode;
  /** Test seam: skips reading localStorage so specs start from the seed. */
  skipRestore?: boolean;
}

export function BundleProvider({ catalog, children, skipRestore = false }: Props) {
  const reducer = useMemo(() => createBundleReducer(catalog), [catalog]);

  const [state, dispatch] = useReducer(reducer, { catalog, skipRestore }, (init) => {
    // A previously saved system wins over the seed; anything the catalog no
    // longer recognises has already been dropped by loadBundle.
    const restored = init.skipRestore ? null : loadBundle(init.catalog);
    return restored ?? createInitialState(init.catalog);
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const save = useCallback(() => {
    const ok = saveBundle(catalog, state);
    if (ok) setLastSavedAt(new Date().toISOString());
    return ok;
  }, [catalog, state]);

  const value = useMemo<BundleContextValue>(
    () => ({ catalog, state, save, lastSavedAt }),
    [catalog, state, save, lastSavedAt],
  );

  return (
    <BundleStateContext.Provider value={value}>
      <BundleDispatchContext.Provider value={dispatch}>{children}</BundleDispatchContext.Provider>
    </BundleStateContext.Provider>
  );
}
