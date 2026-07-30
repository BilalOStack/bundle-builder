import type { StepId } from '@/types/catalog';
import type { BundleState } from '@/types/state';

export type BundleAction =
  | { type: 'setQuantity'; productId: string; variantId?: string; qty: number }
  | { type: 'adjustQuantity'; productId: string; variantId?: string; delta: number }
  | { type: 'selectVariant'; productId: string; variantId: string }
  | { type: 'toggleStep'; stepId: StepId }
  | { type: 'openStep'; stepId: StepId | null }
  | { type: 'hydrate'; state: BundleState }
  | { type: 'reset' };
