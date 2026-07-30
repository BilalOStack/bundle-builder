import { Button } from '@/components/primitives/Button';
import { useLineItems, useTotals } from '@/hooks/useBundle';
import { formatMoney } from '@/lib/money';
import styles from './MobileSummaryBar.module.css';

export function MobileSummaryBar({ panelId }: { panelId: string }) {
  const items = useLineItems();
  const totals = useTotals();
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  function scrollToPanel() {
    document.getElementById(panelId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className={styles.bar}>
      <div className={styles.meta}>
        <span className={styles.count}>
          {count} {count === 1 ? 'item' : 'items'}
        </span>
        <span className={styles.total}>{formatMoney(totals.subtotal)}</span>
      </div>

      <Button className={styles.action} onClick={scrollToPanel}>
        View summary
      </Button>
    </div>
  );
}
