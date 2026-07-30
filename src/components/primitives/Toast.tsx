import { useEffect } from 'react';
import { Icon } from './Icon';
import styles from './Toast.module.css';

/** Transient confirmation. Announced politely rather than interrupting. */
export function Toast({
  message,
  onDismiss,
  duration = 2600,
}: {
  message: string;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [onDismiss, duration, message]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <Icon name="seal" size={18} />
      {message}
    </div>
  );
}
