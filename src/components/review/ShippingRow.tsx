import { Icon } from '@/components/primitives/Icon';
import { PriceDisplay } from '@/components/primitives/PriceDisplay';
import type { Catalog } from '@/types/catalog';
import styles from './ShippingRow.module.css';

/**
 * Shown as a line but deliberately excluded from the totals — the design's
 * compare-at figure is the product lines alone. See selectTotals().
 */
export function ShippingRow({ shipping }: { shipping: Catalog['shipping'] }) {
  return (
    <div className={styles.row}>
      <span className={styles.iconBox}>
        <Icon name={shipping.icon} size={26} />
      </span>
      <p className={styles.label}>{shipping.label}</p>
      <PriceDisplay
        price={shipping.price}
        compareAtPrice={shipping.compareAtPrice}
        freeLabel={shipping.freeLabel}
        tone="review"
        size="sm"
        stacked
      />
    </div>
  );
}
