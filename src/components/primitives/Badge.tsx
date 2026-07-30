import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={[styles.badge, className].filter(Boolean).join(' ')}>{children}</span>;
}
