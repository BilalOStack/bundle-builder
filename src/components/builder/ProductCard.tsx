import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';
import { PriceDisplay } from '@/components/primitives/PriceDisplay';
import { QuantityStepper } from '@/components/primitives/QuantityStepper';
import { useBundleDispatch, useProductCardState } from '@/hooks/useBundle';
import { discountPercent } from '@/lib/money';
import type { Product } from '@/types/catalog';
import { VariantSelector } from './VariantSelector';
import styles from './ProductCard.module.css';

/**
 * Renders entirely from catalog data — there is no per-product markup
 * anywhere. Badge, description, Learn More link and variant selector each
 * appear only when the data provides them, which is how the design's
 * badge-less and variant-less products fall out.
 */
export function ProductCard({ product }: { product: Product }) {
  const dispatch = useBundleDispatch();
  const { variant, qty, price, compareAtPrice, image } = useProductCardState(product);

  const badge = product.badgeOverride ?? formatDiscount(price, compareAtPrice);
  const itemLabel = variant ? `${product.title}, ${variant.label}` : product.title;
  // The stepper reflects the active variant, so the card's selected state
  // tracks the same number the shopper can see.
  const isSelected = qty > 0;

  const setQuantity = (next: number) =>
    dispatch({ type: 'setQuantity', productId: product.id, variantId: variant?.id, qty: next });

  return (
    <li className={styles.cell}>
      <article
        className={[styles.card, isSelected ? styles.selected : '', badge ? styles.hasBadge : '']
          .filter(Boolean)
          .join(' ')}
        aria-label={product.title}
      >
        {/* Over the image where there is one, in flow where there isn't. */}
        {badge && image && <Badge className={styles.badge}>{badge}</Badge>}

        {/* Subscription plans have no product shot; they lead with their lockup. */}
        {image && (
          <div className={styles.media}>
            <img
              src={image}
              alt={itemLabel}
              loading="lazy"
              width={264}
              height={264}
              decoding="async"
            />
          </div>
        )}

        <div className={styles.body}>
          {badge && !image && <Badge className={styles.inlineBadge}>{badge}</Badge>}

          {product.titleLockup ? (
            <h3 className={styles.lockup}>
              <Icon name={product.titleLockup.mark} size={24} className={styles.lockupMark} />
              <span>
                {product.titleLockup.lead}{' '}
                <span className={styles.lockupAccent}>{product.titleLockup.accent}</span>
              </span>
            </h3>
          ) : (
            <h3 className={styles.title}>{product.title}</h3>
          )}

          {product.description && (
            <p className={styles.description}>
              {product.description}{' '}
              {product.learnMoreUrl && (
                <a
                  className={styles.learnMore}
                  href={product.learnMoreUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Learn More
                  <span className="visuallyHidden"> about {product.title}</span>
                </a>
              )}
            </p>
          )}

          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              activeId={variant?.id}
              productTitle={product.title}
              onSelect={(variantId) =>
                dispatch({ type: 'selectVariant', productId: product.id, variantId })
              }
            />
          )}

          <div className={styles.footer}>
            {/* A monthly plan is a choice, not a quantity. */}
            {product.selectionMode === 'single' ? (
              <Button
                variant={isSelected ? 'primary' : 'outline'}
                className={styles.select}
                onClick={() => setQuantity(1)}
                disabled={isSelected}
                aria-pressed={isSelected}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            ) : (
              <QuantityStepper
                value={qty}
                onChange={setQuantity}
                min={product.minQty ?? 0}
                max={product.maxQty}
                disabled={product.locked}
                itemLabel={itemLabel}
                size="card"
              />
            )}
            <PriceDisplay
              price={price}
              compareAtPrice={compareAtPrice}
              suffix={product.priceSuffix}
              freeLabel={product.freeLabel}
              tone="card"
              size="md"
            />
          </div>
        </div>
      </article>
    </li>
  );
}

function formatDiscount(price: number, compareAtPrice?: number): string | null {
  const percent = discountPercent(price, compareAtPrice);
  return percent == null ? null : `Save ${percent}%`;
}
