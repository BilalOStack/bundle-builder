import { useRef, type KeyboardEvent } from 'react';
import type { Variant } from '@/types/catalog';
import styles from './VariantSelector.module.css';

interface VariantSelectorProps {
  variants: Variant[];
  activeId: string | undefined;
  onSelect: (variantId: string) => void;
  productTitle: string;
}

/**
 * A radio group, not a list of buttons — the chips are one choice among
 * several, so arrow keys move between them and only the active chip is a tab
 * stop (roving tabindex).
 *
 * Selecting a chip only changes which variant the card's stepper is bound to.
 * It never adds to the bundle and never removes the other variants' counts.
 */
export function VariantSelector({
  variants,
  activeId,
  onSelect,
  productTitle,
}: VariantSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(
    0,
    variants.findIndex((variant) => variant.id === activeId),
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !backward) return;

    event.preventDefault();
    const delta = forward ? 1 : -1;
    const next = (activeIndex + delta + variants.length) % variants.length;
    onSelect(variants[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={`${productTitle} colour`}
      className={styles.group}
      onKeyDown={handleKeyDown}
    >
      {variants.map((variant, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={variant.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className={[styles.chip, isActive ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onSelect(variant.id)}
          >
            <img src={variant.thumbnail} alt="" className={styles.swatch} loading="lazy" />
            {variant.label}
          </button>
        );
      })}
    </div>
  );
}
