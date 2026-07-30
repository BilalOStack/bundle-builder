import { Icon } from '@/components/primitives/Icon';
import { PriceDisplay } from '@/components/primitives/PriceDisplay';
import { QuantityStepper } from '@/components/primitives/QuantityStepper';
import { useBundleDispatch } from '@/hooks/useBundle';
import type { LineItem } from '@/types/state';
import styles from './ReviewLine.module.css';

/**
 * One selected variant. Its stepper writes to the same store entry the product
 * card's stepper does, which is what keeps the two in sync.
 */
export function ReviewLine({ item }: { item: LineItem }) {
  const dispatch = useBundleDispatch();
  const { product, variant, qty, lineTotal, lineCompareAtTotal } = item;

  const itemLabel = variant ? `${product.title}, ${variant.label}` : product.title;
  const hasStepper = product.selectionMode !== 'single';
  const lockup = product.titleLockup;

  return (
    <li className={[styles.line, lockup ? styles.lockupLine : ''].filter(Boolean).join(' ')}>
      {!lockup && (
        <span className={styles.thumb}>
          <img src={variant?.thumbnail ?? product.thumbnail} alt="" loading="lazy" />
        </span>
      )}

      {lockup ? (
        <p className={styles.lockup}>
          <Icon name={lockup.mark} size={22} className={styles.lockupMark} />
          <span>
            {lockup.lead} <span className={styles.lockupAccent}>{lockup.accent}</span>
          </span>
        </p>
      ) : (
        <p className={styles.name}>
          {product.title}
          {variant && <span className={styles.variant}>{variant.label}</span>}
        </p>
      )}

      {hasStepper && (
        <div className={styles.stepper}>
          <QuantityStepper
            value={qty}
            onChange={(next) =>
              dispatch({
                type: 'setQuantity',
                productId: product.id,
                variantId: variant?.id,
                qty: next,
              })
            }
            min={product.minQty ?? 0}
            max={product.maxQty}
            disabled={product.locked}
            itemLabel={itemLabel}
            size="line"
          />
        </div>
      )}

      <PriceDisplay
        className={styles.price}
        price={lineTotal}
        compareAtPrice={lineCompareAtTotal}
        suffix={product.priceSuffix}
        freeLabel={product.freeLabel}
        tone="review"
        size="sm"
        stacked
      />
    </li>
  );
}
