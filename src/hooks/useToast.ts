import { useCallback, useState } from 'react';

/** Drives the transient confirmation shown after saving. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const dismiss = useCallback(() => setMessage(null), []);
  return { message, show: setMessage, dismiss };
}
