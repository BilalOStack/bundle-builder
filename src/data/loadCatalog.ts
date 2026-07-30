import localCatalog from '@data/catalog.json';
import type { Catalog } from '@/types/catalog';
import { validateCatalog } from './validateCatalog';

/**
 * The bundled JSON is the guaranteed source, so a clean clone works with
 * `npm run dev` alone. When VITE_API_URL is set the app prefers the API (the
 * optional backend bonus) and silently falls back on any failure — a bonus
 * should never become a setup requirement.
 */
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export function getLocalCatalog(): Catalog {
  const { catalog, errors } = validateCatalog(localCatalog);
  if (!catalog) {
    throw new Error(`Bundled catalog.json is invalid:\n${errors.join('\n')}`);
  }
  return catalog;
}

export async function loadCatalog(signal?: AbortSignal): Promise<{
  catalog: Catalog;
  source: 'api' | 'local';
}> {
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/catalog`, { signal });
      if (response.ok) {
        const { catalog, errors } = validateCatalog(await response.json());
        if (catalog) return { catalog, source: 'api' };
        console.warn('[catalog] API payload failed validation, using bundled copy:', errors);
      } else {
        console.warn(`[catalog] API responded ${response.status}, using bundled copy.`);
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') throw error;
      console.warn('[catalog] API unreachable, using bundled copy.', error);
    }
  }

  return { catalog: getLocalCatalog(), source: 'local' };
}
