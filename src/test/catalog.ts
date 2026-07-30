import { getLocalCatalog } from '@/data/loadCatalog';
import type { Catalog } from '@/types/catalog';

/** The real shipped catalog — tests assert against the actual design data. */
export const catalog: Catalog = getLocalCatalog();

export const ids = {
  camV4: 'wyze-cam-v4',
  panV3: 'wyze-cam-pan-v3',
  floodlight: 'wyze-cam-floodlight-v2',
  doorbell: 'wyze-duo-cam-doorbell',
  motionSensor: 'wyze-sense-motion-sensor',
  hub: 'wyze-sense-hub',
  microSd: 'wyze-microsd-256gb',
  camUnlimited: 'cam-unlimited',
  camPlus: 'cam-plus',
} as const;

export function product(id: string) {
  const found = catalog.products.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Test fixture missing product "${id}".`);
  return found;
}
