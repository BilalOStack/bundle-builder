import { createContext, type Dispatch } from 'react';
import type { Catalog } from '@/types/catalog';
import type { BundleState } from '@/types/state';
import type { BundleAction } from './actions';

export interface BundleContextValue {
  catalog: Catalog;
  state: BundleState;
  /** Persists the current configuration. Returns false if storage is unavailable. */
  save: () => boolean;
  /** ISO timestamp of the last successful save in this session, if any. */
  lastSavedAt: string | null;
}

/**
 * State and dispatch live in separate contexts so components that only need to
 * dispatch (steppers, chips) don't re-render on every state change.
 */
export const BundleStateContext = createContext<BundleContextValue | null>(null);
export const BundleDispatchContext = createContext<Dispatch<BundleAction> | null>(null);
