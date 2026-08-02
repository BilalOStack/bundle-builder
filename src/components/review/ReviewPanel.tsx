import { useState } from 'react';
import { Button } from '@/components/primitives/Button';
import { Toast } from '@/components/primitives/Toast';
import { useToast } from '@/hooks/useToast';
import { useBundle, useGroupedLineItems, useLineItems, useTotals } from '@/hooks/useBundle';
import { formatMoney } from '@/lib/money';
import { CheckoutDialog } from './CheckoutDialog';
import { GuaranteeSeal } from './GuaranteeSeal';
import { ReviewLine } from './ReviewLine';
import { ShippingRow } from './ShippingRow';
import styles from './ReviewPanel.module.css';

export function ReviewPanel() {
  const { catalog, save } = useBundle();
  const groups = useGroupedLineItems();
  const items = useLineItems();
  const totals = useTotals();
  const toast = useToast();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const itemCount = items.reduce((count, item) => count + item.qty, 0);
  const savingsMessage = catalog.savingsTemplate.replace('{savings}', formatMoney(totals.savings));

  function handleSave() {
    toast.show(save() ? 'System saved to this browser' : "Couldn't save — storage is unavailable");
  }

  return (
    <aside className={styles.panel} aria-label="Your security system summary">
      <div className={styles.grid}>
        <div className={styles.main}>
          <p className={styles.eyebrow}>{catalog.review.eyebrow}</p>
          <h2 className={styles.title}>{catalog.review.title}</h2>
          <p className={styles.subtitle}>{catalog.review.subtitle}</p>

          {groups.length === 0 ? (
            <p className={styles.empty}>
              Nothing selected yet — add a camera to start building your system.
            </p>
          ) : (
            groups.map((group) => (
              <section key={group.category} className={styles.group}>
                <h3 className={styles.groupLabel}>{group.label}</h3>
                <ul>
                  {group.items.map((item) => (
                    <ReviewLine key={item.key} item={item} />
                  ))}
                </ul>
              </section>
            ))
          )}

          <ShippingRow shipping={catalog.shipping} />
        </div>

        <div className={styles.summary}>
          <div className={styles.guaranteeRow}>
            <GuaranteeSeal
              ringText={catalog.guarantee.sealLines[0]}
              imageSrc={catalog.guarantee.sealImage}
              size={78}
            />

            <div className={styles.guaranteeText}>
              <h3 className={styles.guaranteeHeadline}>{catalog.guarantee.headline}</h3>
              <p className={styles.guaranteeBody}>{catalog.guarantee.body}</p>
            </div>

            <div className={styles.moneyBlock}>
              <span className={styles.financePill}>
                {catalog.financing.prefix} {formatMoney(totals.monthly)}/mo
              </span>

              <p className={styles.totals}>
                {totals.compareAtTotal > totals.subtotal && (
                  <s className={styles.totalCompare}>
                    <span className="visuallyHidden">Was </span>
                    {formatMoney(totals.compareAtTotal)}
                  </s>
                )}
                <span className={styles.totalNow}>
                  <span className="visuallyHidden">Total </span>
                  {formatMoney(totals.subtotal)}
                </span>
              </p>
            </div>
          </div>

          {/*
          The one place the running total is announced. Steppers stay quiet so
          a screen reader hears "total is $209.87" rather than every figure.
        */}
          <p className={styles.savings} aria-live="polite">
            {totals.savings > 0
              ? savingsMessage
              : `Your system totals ${formatMoney(totals.subtotal)}.`}
          </p>

          <Button fullWidth onClick={() => setCheckoutOpen(true)} disabled={itemCount === 0}>
            Checkout
          </Button>

          <div className={styles.saveRow}>
            <Button variant="link" onClick={handleSave}>
              Save my system for later
            </Button>
          </div>
        </div>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        itemCount={itemCount}
        total={totals.subtotal}
      />

      {toast.message && <Toast message={toast.message} onDismiss={toast.dismiss} />}
    </aside>
  );
}
