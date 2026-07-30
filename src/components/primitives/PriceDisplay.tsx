import { formatPrice } from '@/lib/money';
import type { Cents } from '@/types/catalog';
import styles from './PriceDisplay.module.css';

interface PriceDisplayProps {
  price: Cents;
  compareAtPrice?: Cents;
  /** Appended to the figure, e.g. "/mo". */
  suffix?: string;
  /** Rendered in place of "$0.00" — the design shows "FREE". */
  freeLabel?: string;
  /** Cards use a red strikethrough, the review panel a grey one. */
  tone?: 'card' | 'review';
  size?: 'sm' | 'md' | 'lg';
  /** Review lines stack compare-at above the price; cards sit them inline. */
  stacked?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  suffix,
  freeLabel,
  tone = 'card',
  size = 'md',
  stacked = false,
  className,
}: PriceDisplayProps) {
  const showCompare = compareAtPrice != null && compareAtPrice > price;
  const isFree = price === 0 && Boolean(freeLabel);

  const classes = [
    styles.price,
    styles[tone],
    styles[size],
    stacked ? styles.stacked : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <p className={classes}>
      {showCompare && (
        <s className={styles.compare}>
          <span className="visuallyHidden">Was </span>
          {formatPrice(compareAtPrice, suffix)}
        </s>
      )}
      <span className={[styles.current, isFree ? styles.free : ''].filter(Boolean).join(' ')}>
        {showCompare && <span className="visuallyHidden">Now </span>}
        {isFree ? freeLabel : formatPrice(price, suffix)}
      </span>
    </p>
  );
}
