import { useEffect, useState } from 'react';
import { getLocalCatalog, loadCatalog } from '@/data/loadCatalog';
import type { Catalog } from '@/types/catalog';

type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; catalog: Catalog; source: 'api' | 'local' }
  | { status: 'error'; message: string };

const usesApi = Boolean(import.meta.env.VITE_API_URL);

/**
 * With no API configured the bundled catalog resolves synchronously, so the
 * first paint is the finished page — no loading flash for the default setup.
 * The async path only runs when the optional backend is in play.
 */
export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>(() => {
    if (usesApi) return { status: 'loading' };
    try {
      return { status: 'ready', catalog: getLocalCatalog(), source: 'local' };
    } catch (error) {
      return { status: 'error', message: (error as Error).message };
    }
  });

  useEffect(() => {
    if (!usesApi) return;
    const controller = new AbortController();

    loadCatalog(controller.signal)
      .then(({ catalog, source }) => setState({ status: 'ready', catalog, source }))
      .catch((error: Error) => {
        if (error.name === 'AbortError') return;
        setState({ status: 'error', message: error.message });
      });

    return () => controller.abort();
  }, []);

  return state;
}
