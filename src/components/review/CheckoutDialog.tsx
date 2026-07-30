import { useEffect, useRef } from 'react';
import { Button } from '@/components/primitives/Button';
import { Icon } from '@/components/primitives/Icon';
import { formatMoney } from '@/lib/money';
import styles from './CheckoutDialog.module.css';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  itemCount: number;
  total: number;
}

/**
 * Checkout has nowhere to go in this prototype, so it confirms instead.
 * Uses a native <dialog> so focus trapping, Escape and the backdrop come from
 * the platform rather than hand-rolled JavaScript.
 */
export function CheckoutDialog({ open, onClose, itemCount, total }: CheckoutDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose} aria-labelledby="checkout-title">
      {/* Contents only exist while open, so a closed dialog doesn't duplicate
          the total in the DOM for find-in-page or assistive tech. */}
      {!open ? null : (
        <div className={styles.inner}>
          <span className={styles.mark}>
            <Icon name="seal" size={30} />
          </span>

          <h2 id="checkout-title" className={styles.title}>
            Your system is ready
          </h2>
          <p className={styles.body}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your security system.
          </p>
          <p className={styles.total}>{formatMoney(total)}</p>
          <p className={styles.note}>
            This is a prototype — checkout isn&apos;t wired up to a payment flow.
          </p>

          <div className={styles.actions}>
            <Button fullWidth onClick={onClose}>
              Back to my system
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
