import { Icon } from './Icon';
import styles from './QuantityStepper.module.css';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** The Sense Hub renders its stepper but neither button is operable. */
  disabled?: boolean;
  size?: 'card' | 'line';
  /** Used to build the buttons' accessible names, e.g. "Wyze Cam v4, White". */
  itemLabel: string;
}

/**
 * One stepper serves both the product cards and the review-panel lines. Both
 * read and write the same quantity in the store, which is what keeps them in
 * sync — there is only ever one number behind them.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  disabled = false,
  size = 'card',
  itemLabel,
}: QuantityStepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div className={[styles.stepper, styles[size]].join(' ')}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label={`Decrease quantity of ${itemLabel}`}
      >
        <Icon name="minus" size={size === 'card' ? 10 : 14} />
      </button>

      <span className={styles.value} aria-hidden="true">
        {value}
      </span>
      {/* The visible number is decorative; the real value rides on the buttons'
          labels and the panel's live region, so screen readers hear it once. */}
      <span className="visuallyHidden">{`Quantity of ${itemLabel}: ${value}`}</span>

      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label={`Increase quantity of ${itemLabel}`}
      >
        <Icon name="plus" size={size === 'card' ? 10 : 14} />
      </button>
    </div>
  );
}
